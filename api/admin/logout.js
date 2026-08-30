const { clearCookie, json } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });
  clearCookie(res, req, 'md_admin');
  json(res, 200, { ok: true });
};
