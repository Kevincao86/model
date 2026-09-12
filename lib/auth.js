const crypto = require('crypto');

const SALT = 'modian-case-v1';

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'modian-demo-secret-2026';
}

function hashPassword(plain) {
  return crypto.createHash('sha256').update(`${SALT}:${String(plain)}`).digest('hex');
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || 'kaiyedaji888';
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expect = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

function cookieDomain(req) {
  const host = String(req.headers.host || '').split(':')[0];
  if (host.endsWith('modianmodel.online')) return '; Domain=.modianmodel.online';
  return '';
}

function isLocal(req) {
  const host = String(req.headers.host || '');
  return host.includes('localhost') || host.startsWith('127.');
}

function appendCookie(res, cookie) {
  const prev = res.getHeader('Set-Cookie');
  if (!prev) return cookie;
  return Array.isArray(prev) ? [...prev, cookie] : [prev, cookie];
}

function setCookie(res, req, name, value, maxAge) {
  const secure = isLocal(req) ? '' : '; Secure';
  res.setHeader(
    'Set-Cookie',
    appendCookie(
      res,
      `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${cookieDomain(req)}${secure}`
    )
  );
}

function clearCookie(res, req, name) {
  res.setHeader(
    'Set-Cookie',
    appendCookie(res, `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${cookieDomain(req)}`)
  );
}

function readCookies(req) {
  const raw = req.headers.cookie || '';
  const out = {};
  raw.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i < 0) return;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function getAdmin(req) {
  const cookies = readCookies(req);
  const data = verify(cookies.md_admin);
  return data && data.role === 'admin' ? data : null;
}

function getUnlocks(req) {
  const cookies = readCookies(req);
  const data = verify(cookies.md_unlock);
  return data && Array.isArray(data.ids) ? data.ids : [];
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e6) {
        reject(new Error('body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('invalid json'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = {
  hashPassword,
  adminPassword,
  sign,
  verify,
  setCookie,
  clearCookie,
  readCookies,
  getAdmin,
  getUnlocks,
  json,
  readBody,
};
