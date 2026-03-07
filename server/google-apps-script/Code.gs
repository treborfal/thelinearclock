/**
 * Google Apps Script endpoint for shop email signups.
 *
 * SECURITY MODEL:
 * - Browser submits via plain form/no-cors POST (no readable cross-origin response).
 * - POST validates allowed origin, honeypot, dwell time, and email format.
 * - Optional challenge endpoint can still be used for future hardening.
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

  const email = normalizeEmail_(param_(e, 'email'));
  const origin = param_(e, 'origin');
  const honeypot = param_(e, 'website');
  const dwellMs = Number(param_(e, 'dwellMs'));

  if (!allowedOrigins.includes(origin)) {
    return textResponse('Unauthorized');
  }

  if (!isValidEmail_(email)) {
    return textResponse('Invalid email');
  }

  if (honeypot) {
    return textResponse('Unauthorized');
  }

  if (!Number.isFinite(dwellMs) || dwellMs < 3000 || dwellMs > 86400000) {
    return textResponse('Unauthorized');
  }

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

function normalizeEmail_(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed || trimmed.length > 254) {
    return '';
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return '';
  }

  const local = parts[0].trim().toLowerCase();
  const domain = parts[1].trim().toLowerCase();
  if (!local || !domain) {
    return '';
  }

  return `${local}@${domain}`;
}

function isValidEmail_(email) {
  if (!email || email.length > 254) {
    return false;
  }

  const at = email.indexOf('@');
  if (at <= 0 || at !== email.lastIndexOf('@')) {
    return false;
  }

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (local.length > 64 || domain.length > 253) {
    return false;
  }

  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return false;
  }

  if (domain.includes('..')) {
    return false;
  }

  const localPartPattern = /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+$/i;
  const domainPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

  return localPartPattern.test(local) && domainPattern.test(domain);
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
