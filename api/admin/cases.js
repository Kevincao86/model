const { getAdmin, hashPassword, json, readBody } = require('../../lib/auth');
const { readStore, writeStore, adminCase, slugify } = require('../../lib/store');

module.exports = async function handler(req, res) {
  const admin = getAdmin(req);
  if (!admin) return json(res, 401, { error: '请先登录' });

  if (req.method === 'GET') {
    const store = await readStore();
    const cases = store.cases
      .slice()
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .map(adminCase);
    return json(res, 200, {
      cases,
      ephemeral: !process.env.KV_REST_API_URL,
      updatedAt: store.updatedAt || 0,
    });
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: 'invalid json' });
    }
    const store = await readStore();
    let id = slugify(body.id || body.title);
    if (store.cases.some((c) => c.id === id)) id = `${id}-${Date.now().toString(36)}`;
    if (!body.password) return json(res, 400, { error: '请设置案例密码' });
    const item = {
      id,
      title: String(body.title || '未命名案例').slice(0, 40),
      tag: String(body.tag || '演示').slice(0, 40),
      blurb: String(body.blurb || '').slice(0, 240),
      cover: String(body.cover || '').slice(0, 400),
      demoUrl: String(body.demoUrl || '/').slice(0, 400),
      passwordHash: hashPassword(body.password),
      sort: Number(body.sort) || store.cases.length + 1,
      visible: body.visible !== false,
      updatedAt: Date.now(),
    };
    store.cases.push(item);
    const result = await writeStore(store);
    return json(res, 200, { ok: true, case: adminCase(item), ...result });
  }

  return json(res, 405, { error: 'method not allowed' });
};
