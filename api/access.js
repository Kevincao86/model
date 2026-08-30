const { getUnlocks, json } = require('../lib/auth');
const { readStore } = require('../lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed' });
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.searchParams.get('id') || '';
  const store = await readStore();
  const item = store.cases.find((c) => c.id === id);
  if (!item) return json(res, 404, { ok: false, error: '案例不存在' });
  const unlocked = getUnlocks(req).includes(id);
  json(res, 200, { ok: unlocked, id, demoUrl: unlocked ? item.demoUrl : null });
};
