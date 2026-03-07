/**
 * Google Apps Script endpoint for shop email signups.
 *
 * SECURITY MODEL:
 * - No shared client secret in browser code.
 * - GET `?action=challenge` issues a short-lived signed nonce.
 * - POST validates origin + nonce signature + nonce TTL/replay.
 * - Secrets remain in Script Properties only.
 *
 * Required Script Properties:
 * - ALLOWED_ORIGINS: Comma-separated origins, e.g. "https://thelinearclock.com,https://www.thelinearclock.com"
 * - SIGNING_SECRET: Long random string generated and stored server-side only
 * - SHEET_ID: Target Google Sheet ID
 */

const NONCE_TTL_MS = 5 * 60 * 1000;

function doGet(e) {
  const action = (e.parameter.action || '').trim();
  if (action !== 'challenge') {
    return textResponse('Not found');
  }

  const nonce = Utilities.getUuid();
  const issuedAt = Date.now().toString();
  const signature = signNonce_(nonce, issuedAt);

  return jsonResponse({ nonce, issuedAt, signature });
}

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const allowedOrigins = (props.getProperty('ALLOWED_ORIGINS') || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);

  const email = param_(e, 'email');
  const nonce = param_(e, 'nonce');
  const issuedAt = param_(e, 'issuedAt');
  const signature = param_(e, 'signature');
  const origin = param_(e, 'origin');

  if (!allowedOrigins.includes(origin)) {
    return textResponse('Unauthorized');
  }

  if (!isValidEmail_(email)) {
    return textResponse('Invalid email');
  }

  if (!nonce || !issuedAt || !signature || !isValidChallenge_(nonce, issuedAt, signature)) {
    return textResponse('Unauthorized');
  }

  const usedNonceKey = `used_nonce_${nonce}`;
  if (props.getProperty(usedNonceKey)) {
    return textResponse('Unauthorized');
  }

  props.setProperty(usedNonceKey, Date.now().toString());

  const sheetId = props.getProperty('SHEET_ID');
  if (!sheetId) {
    return textResponse('Server misconfigured');
  }

  const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
  sheet.appendRow([new Date(), email, origin]);

  return textResponse('Success');
}

function isValidChallenge_(nonce, issuedAt, signature) {
  const now = Date.now();
  const issued = Number(issuedAt);

  if (!Number.isFinite(issued)) {
    return false;
  }

  if (Math.abs(now - issued) > NONCE_TTL_MS) {
    return false;
  }

  const expected = signNonce_(nonce, issuedAt);
  return safeEquals_(signature, expected);
}

function signNonce_(nonce, issuedAt) {
  const secret = PropertiesService.getScriptProperties().getProperty('SIGNING_SECRET');
  if (!secret) {
    throw new Error('Missing SIGNING_SECRET script property');
  }

  const payload = `${nonce}.${issuedAt}`;
  const bytes = Utilities.computeHmacSha256Signature(payload, secret);
  return Utilities.base64EncodeWebSafe(bytes, true);
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

function param_(e, key) {
  return (e && e.parameter && e.parameter[key]) ? String(e.parameter[key]).trim() : '';
}

function safeEquals_(a, b) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }

  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function textResponse(message) {
  return ContentService
    .createTextOutput(message)
    .setMimeType(ContentService.MimeType.TEXT);
}
