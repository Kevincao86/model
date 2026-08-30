const { adminPassword, sign, setCookie, json, readBody } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });
  let body;
  try {
    body = await readBody(req);
  } catch {
    return json(res, 400, { error: 'invalid json' });
  }
  if (String(body.password || '') !== adminPassword()) {
    return json(res, 403, { error: '密码不正确' });
  }
  setCookie(res, req, 'md_admin', sign({ role: 'admin', exp: Date.now() + 7 * 24 * 3600 * 1000 }), 7 * 24 * 3600);
  json(res, 200, { ok: true });
};
