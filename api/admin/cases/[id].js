const { getAdmin, hashPassword, json, readBody } = require('../../../lib/auth');
const { readStore, writeStore, adminCase } = require('../../../lib/store');

module.exports = async function handler(req, res) {
  const admin = getAdmin(req);
  if (!admin) return json(res, 401, { error: '请先登录' });

  const id = req.query.id || new URL(req.url, `http://${req.headers.host}`).pathname.split('/').pop();
  const store = await readStore();
  const index = store.cases.findIndex((c) => c.id === id);
  if (index < 0) return json(res, 404, { error: '案例不存在' });

  if (req.method === 'DELETE') {
    const removed = store.cases.splice(index, 1)[0];
    const result = await writeStore(store);
    return json(res, 200, { ok: true, id: removed.id, ...result });
  }

  if (req.method === 'PUT') {
    let body;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: 'invalid json' });
    }
    const item = store.cases[index];
    if (body.title != null) item.title = String(body.title).slice(0, 40);
    if (body.tag != null) item.tag = String(body.tag).slice(0, 40);
    if (body.blurb != null) item.blurb = String(body.blurb).slice(0, 240);
    if (body.cover != null) item.cover = String(body.cover).slice(0, 400);
    if (body.demoUrl != null) item.demoUrl = String(body.demoUrl).slice(0, 400);
    if (body.sort != null) item.sort = Number(body.sort) || item.sort;
    if (body.visible != null) item.visible = Boolean(body.visible);
    if (body.password) item.passwordHash = hashPassword(String(body.password).trim());
    item.updatedAt = Date.now();
    const result = await writeStore(store);
    if (!result.persisted) {
      return json(res, 500, {
        error: result.persistError ? `密码未保存成功（${result.persistError}）` : '密码未保存成功，请重试',
      });
    }
    return json(res, 200, { ok: true, case: adminCase(item), ...result });
  }

  return json(res, 405, { error: 'method not allowed' });
};
