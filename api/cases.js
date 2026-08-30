const { getAdmin, json } = require('../lib/auth');
const { readStore, publicCase } = require('../lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed' });
  const store = await readStore();
  const admin = getAdmin(req);
  const cases = store.cases
    .filter((c) => admin || c.visible !== false)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map((c) => publicCase(c, false));
  json(res, 200, { cases });
};
