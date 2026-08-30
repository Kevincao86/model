const { hashPassword, getUnlocks, sign, setCookie, json, readBody } = require('../lib/auth');
const { readStore } = require('../lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });
  let body;
  try {
    body = await readBody(req);
  } catch {
    return json(res, 400, { error: 'invalid json' });
  }
  const id = String(body.id || '').trim();
  const password = String(body.password || '');
  if (!id || !password) return json(res, 400, { error: '请输入密码' });

  const store = await readStore();
  const item = store.cases.find((c) => c.id === id && c.visible !== false);
  if (!item) return json(res, 404, { error: '案例不存在' });
  if (!item.passwordHash || item.passwordHash !== hashPassword(password)) {
    return json(res, 403, { error: '密码不正确' });
  }

  const ids = Array.from(new Set([...getUnlocks(req), id]));
  setCookie(res, req, 'md_unlock', sign({ ids, exp: Date.now() + 7 * 24 * 3600 * 1000 }), 7 * 24 * 3600);
  json(res, 200, { ok: true, id, demoUrl: item.demoUrl });
};
