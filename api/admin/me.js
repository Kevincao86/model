const { getAdmin, json } = require('../../lib/auth');
const { readStore } = require('../../lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed' });
  const admin = getAdmin(req);
  if (!admin) return json(res, 401, { ok: false });
  const store = await readStore();
  json(res, 200, {
    ok: true,
    ephemeral: !process.env.KV_REST_API_URL,
    updatedAt: store.updatedAt || 0,
  });
};
