const fs = require('fs');
const path = require('path');

const TMP = '/tmp/modian-cases.json';
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');

function loadSeed() {
  return JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
}

function storeTeam() {
  return process.env.STORE_TEAM_ID || '';
}

function storeId() {
  return process.env.EDGE_CONFIG_ID || '';
}

function writeToken() {
  return process.env.STORE_VERCEL_TOKEN || '';
}

function readToken() {
  return process.env.EDGE_CONFIG_READ_TOKEN || writeToken();
}

function canPersist() {
  return Boolean(storeId() && (readToken() || writeToken()));
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

  if (!writeToken()) return null;
  const team = storeTeam();
  const qs = team ? `?teamId=${encodeURIComponent(team)}` : '';
  const r = await fetch(`https://api.vercel.com/v1/edge-config/${id}/item/store${qs}`, {
    headers: { Authorization: `Bearer ${writeToken()}` },
  });
  if (!r.ok) return null;
  const j = await r.json();
  return validStore(j && j.value) ? j.value : null;
}

async function edgeSet(store) {
  const id = storeId();
  const token = writeToken();
  if (!id || !token) return false;
  const team = storeTeam();
  const qs = team ? `?teamId=${encodeURIComponent(team)}` : '';
  const r = await fetch(`https://api.vercel.com/v1/edge-config/${id}/items${qs}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ operation: 'upsert', key: 'store', value: store }],
    }),
  });
  return r.ok;
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

async function readStore() {
  const seed = loadSeed();
  const edge = await edgeGet();
  const tmp = readTmp();
  const store = validStore(edge) ? edge : validStore(tmp) ? tmp : { cases: [], updatedAt: 0 };
  const have = new Set((store.cases || []).map((c) => c.id));
  for (const item of seed.cases || []) {
    if (!have.has(item.id)) store.cases.push(item);
  }
  if (!store.cases.length) return seed;
  return store;
}

async function writeStore(store) {
  store.updatedAt = Date.now();
  const persisted = await edgeSet(store);
  writeTmp(store);
  return { persisted, ephemeral: !persisted };
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
