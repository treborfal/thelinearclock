/**
 * Google Apps Script endpoint for shop email signups.
 *
 * SECURITY MODEL:
 * - No shared client secret in browser code.
 * - GET `?action=challenge` issues a short-lived signed nonce.
 * - POST validates origin + nonce signature + nonce TTL/replay.
 * - Honeypot + dwell-time checks reduce low-effort bot traffic.
 * - Per-identity cooldown and optional Turnstile challenges for suspicious retries.
 * - Secrets remain in Script Properties only.
 *
 * Required Script Properties:
 * - ALLOWED_ORIGINS: Comma-separated origins, e.g. "https://thelinearclock.com,https://www.thelinearclock.com"
 * - SIGNING_SECRET: Long random string generated and stored server-side only
 * - SHEET_ID: Target Google Sheet ID
 *
 * Optional Script Properties:
 * - MIN_DWELL_MS: Minimum allowed dwell time in ms (default 3000)
 * - MAX_CLIENT_CLOCK_SKEW_MS: Allowed client/server submit timestamp drift (default 120000)
 * - IP_COOLDOWN_MS: Per-IP cooldown in ms (default 60000)
 * - EMAIL_COOLDOWN_MS: Per-email cooldown in ms (default 300000)
 * - SUSPICIOUS_WINDOW_MS: Window for counting suspicious attempts (default 3600000)
 * - SUSPICIOUS_THRESHOLD: Attempts in window before CAPTCHA is required (default 3)
 * - TURNSTILE_SECRET: If set, Turnstile verification is enabled for suspicious attempts
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
  const nonce = param_(e, 'nonce');
  const issuedAt = param_(e, 'issuedAt');
  const signature = param_(e, 'signature');
  const origin = param_(e, 'origin');
  const honeypot = param_(e, 'website');
  const submittedAt = param_(e, 'submittedAt');
  const dwellMs = param_(e, 'dwellMs');
  const turnstileToken = param_(e, 'turnstileToken');
  const ipKey = getRequesterIpKey_(e);

  if (!allowedOrigins.includes(origin)) {
    return textResponse('Unauthorized');
  }

  if (honeypot) {
    registerSuspiciousAttempt_(props, email, ipKey);
    return textResponse('Unauthorized');
  }

  if (!isValidEmail_(email)) {
    return textResponse('Invalid email');
  }

  if (!nonce || !issuedAt || !signature || !isValidChallenge_(nonce, issuedAt, signature)) {
    registerSuspiciousAttempt_(props, email, ipKey);
    return textResponse('Unauthorized');
  }

  if (!isValidSubmitTiming_(props, submittedAt, dwellMs)) {
    registerSuspiciousAttempt_(props, email, ipKey);
    return textResponse('Unauthorized');
  }

  const usedNonceKey = `used_nonce_${nonce}`;
  if (props.getProperty(usedNonceKey)) {
    registerSuspiciousAttempt_(props, email, ipKey);
    return textResponse('Unauthorized');
  }

  if (isInCooldown_(props, `cooldown_ip_${ipKey}`, numberProp_(props, 'IP_COOLDOWN_MS', 60 * 1000))) {
    registerSuspiciousAttempt_(props, email, ipKey);
    return textResponse('Unauthorized');
  }

  if (isInCooldown_(props, `cooldown_email_${email}`, numberProp_(props, 'EMAIL_COOLDOWN_MS', 5 * 60 * 1000))) {
    registerSuspiciousAttempt_(props, email, ipKey);
    return textResponse('Unauthorized');
  }

  if (requiresCaptcha_(props, email, ipKey) && !verifyTurnstile_(props, turnstileToken, ipKey)) {
    registerSuspiciousAttempt_(props, email, ipKey);
    return textResponse('CaptchaRequired');
  }

  props.setProperty(usedNonceKey, Date.now().toString());
  props.setProperty(`cooldown_ip_${ipKey}`, Date.now().toString());
  props.setProperty(`cooldown_email_${email}`, Date.now().toString());

  const sheetId = props.getProperty('SHEET_ID');
  if (!sheetId) {
    return textResponse('Server misconfigured');
  }

  const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
  sheet.appendRow([new Date(), email, origin, ipKey]);

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

function isValidSubmitTiming_(props, submittedAt, dwellMs) {
  const minDwellMs = numberProp_(props, 'MIN_DWELL_MS', 3000);
  const maxClockSkewMs = numberProp_(props, 'MAX_CLIENT_CLOCK_SKEW_MS', 2 * 60 * 1000);

  const submitTs = Number(submittedAt);
  const dwell = Number(dwellMs);
  if (!Number.isFinite(submitTs) || !Number.isFinite(dwell) || dwell < minDwellMs) {
    return false;
  }

  return Math.abs(Date.now() - submitTs) <= maxClockSkewMs;
}

function isInCooldown_(props, key, cooldownMs) {
  const previous = Number(props.getProperty(key));
  if (!Number.isFinite(previous)) {
    return false;
  }
  return Date.now() - previous < cooldownMs;
}

function requiresCaptcha_(props, email, ipKey) {
  const threshold = numberProp_(props, 'SUSPICIOUS_THRESHOLD', 3);
  const emailScore = suspiciousCount_(props, `suspicious_email_${email}`);
  const ipScore = suspiciousCount_(props, `suspicious_ip_${ipKey}`);
  return Math.max(emailScore, ipScore) >= threshold;
}

function registerSuspiciousAttempt_(props, email, ipKey) {
  const windowMs = numberProp_(props, 'SUSPICIOUS_WINDOW_MS', 60 * 60 * 1000);
  bumpSuspiciousCounter_(props, `suspicious_email_${email}`, windowMs);
  bumpSuspiciousCounter_(props, `suspicious_ip_${ipKey}`, windowMs);
}

function suspiciousCount_(props, key) {
  const parsed = parseSuspicious_(props.getProperty(key));
  if (!parsed) {
    return 0;
  }
  return parsed.count;
}

function bumpSuspiciousCounter_(props, key, windowMs) {
  const now = Date.now();
  const parsed = parseSuspicious_(props.getProperty(key));
  const next = (!parsed || now - parsed.windowStart > windowMs)
    ? { count: 1, windowStart: now }
    : { count: parsed.count + 1, windowStart: parsed.windowStart };
  props.setProperty(key, JSON.stringify(next));
}

function parseSuspicious_(raw) {
  if (!raw) {
    return null;
  }

  try {
    const obj = JSON.parse(raw);
    if (!Number.isFinite(obj.count) || !Number.isFinite(obj.windowStart)) {
      return null;
    }
    return obj;
  } catch (err) {
    return null;
  }
}

function verifyTurnstile_(props, token, ipAddress) {
  const secret = props.getProperty('TURNSTILE_SECRET');
  if (!secret) {
    return false;
  }

  if (!token) {
    return false;
  }

  const payload = {
    secret,
    response: token,
    remoteip: ipAddress
  };

  try {
    const response = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'post',
      payload,
      muteHttpExceptions: true
    });
    const body = JSON.parse(response.getContentText() || '{}');
    return body.success === true;
  } catch (err) {
    return false;
  }
}

function getRequesterIpKey_(e) {
  const raw = param_(e, 'ipAddress') || 'unknown';
  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw)
  ).slice(0, 24);
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

function numberProp_(props, key, fallback) {
  const value = Number(props.getProperty(key));
  return Number.isFinite(value) ? value : fallback;
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
