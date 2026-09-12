const fs = require('fs');
const path = require('path');

const TMP = '/tmp/modian-cases.json';
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');
const FALLBACK_EDGE_CONFIG_ID = 'ecfg_zs0ktvbyhzvzypmbx9ln26kkox8i';
const FALLBACK_TEAM_ID = 'team_gL80e1LzYeGncie1FHelnFHx';

function loadSeed() {
  return JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
}

function extractEdgeConfigId(raw) {
  const text = String(raw || '').trim();
  const m = text.match(/ecfg_[A-Za-z0-9]+/);
  return m ? m[0] : '';
}

function storeTeam() {
  return process.env.STORE_TEAM_ID || process.env.VERCEL_TEAM_ID || FALLBACK_TEAM_ID;
}

function storeId() {
  return (
    extractEdgeConfigId(process.env.EDGE_CONFIG_ID) ||
    extractEdgeConfigId(process.env.EDGE_CONFIG) ||
    FALLBACK_EDGE_CONFIG_ID
  );
}

function writeTokens() {
  return [...new Set([process.env.STORE_VERCEL_TOKEN, process.env.VERCEL_OIDC_TOKEN].filter(Boolean))];
}

function readToken() {
  return process.env.EDGE_CONFIG_READ_TOKEN || writeTokens()[0] || '';
}

function canPersist() {
  return Boolean(storeId() && writeTokens().length);
}

function validStore(store) {
  return store && Array.isArray(store.cases);
}

async function edgeGet() {
  const id = storeId();
  const token = readToken();
  if (!id || !token) return null;

  const cdn = await fetch(`https://edge-config.vercel.com/${id}/item/store`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (cdn.ok) {
    const value = await cdn.json();
    if (validStore(value)) return value;
  }

  const team = storeTeam();
  const qs = team ? `?teamId=${encodeURIComponent(team)}` : '';
  for (const tok of writeTokens()) {
    const r = await fetch(`https://api.vercel.com/v1/edge-config/${id}/item/store${qs}`, {
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (!r.ok) continue;
    const j = await r.json();
    if (validStore(j && j.value)) return j.value;
  }
  return null;
}

async function edgeSet(store) {
  const id = storeId();
  const tokens = writeTokens();
  if (!id || !tokens.length) return { ok: false, error: 'missing-credentials' };
  const team = storeTeam();
  const qs = team ? `?teamId=${encodeURIComponent(team)}` : '';
  const body = JSON.stringify({
    items: [{ operation: 'upsert', key: 'store', value: store }],
  });
  let last = 'write-failed';
  for (const token of tokens) {
    try {
      const r = await fetch(`https://api.vercel.com/v1/edge-config/${id}/items${qs}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });
      const text = await r.text();
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = {};
      }
      if (r.ok && (parsed.status === 'ok' || !parsed.error)) return { ok: true };
      last = (parsed.error && (parsed.error.code || parsed.error.message)) || `http-${r.status}`;
    } catch (err) {
      last = err && err.message ? err.message : 'network-error';
    }
  }
  return { ok: false, error: String(last).slice(0, 80) };
}

function readTmp() {
  try {
    return JSON.parse(fs.readFileSync(TMP, 'utf8'));
  } catch {
    return null;
  }
}

function writeTmp(store) {
  try {
    fs.writeFileSync(TMP, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

function mergeSeed(store) {
  const seed = loadSeed();
  const have = new Set((store.cases || []).map((c) => c.id));
  for (const item of seed.cases || []) {
    if (!have.has(item.id)) store.cases.push(item);
  }
  return store;
}

async function readStore() {
  const seed = loadSeed();
  const edge = await edgeGet();
  const tmp = readTmp();
  const store = validStore(edge) ? edge : validStore(tmp) ? tmp : { cases: [], updatedAt: 0 };
  mergeSeed(store);
  if (!store.cases.length) return seed;
  return store;
}

async function writeStore(store) {
  store.updatedAt = Date.now();
  mergeSeed(store);
  const result = await edgeSet(store);
  writeTmp(store);
  return { persisted: result.ok, ephemeral: !result.ok, persistError: result.error || null };
}

function publicCase(item, unlocked) {
  return {
    id: item.id,
    title: item.title,
    tag: item.tag,
    blurb: item.blurb,
    cover: item.cover,
    demoUrl: item.demoUrl,
    sort: item.sort || 0,
    visible: item.visible !== false,
    unlocked: Boolean(unlocked),
  };
}

function adminCase(item) {
  return {
    ...publicCase(item, false),
    hasPassword: Boolean(item.passwordHash),
    updatedAt: item.updatedAt || null,
  };
}

function slugify(input) {
  const raw = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return raw || `case-${Date.now().toString(36)}`;
}

module.exports = {
  readStore,
  writeStore,
  publicCase,
  adminCase,
  slugify,
  loadSeed,
  canPersist,
};
