const fs = require('fs');
const path = require('path');

const TMP = '/tmp/modian-cases.json';
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');

function loadSeed() {
  return JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
}

function storeTeam() {
  return process.env.VERCEL_TEAM_ID || process.env.STORE_TEAM_ID || '';
}

function storeId() {
  return process.env.EDGE_CONFIG_ID || '';
}

function storeToken() {
  return process.env.STORE_VERCEL_TOKEN || '';
}

function canPersist() {
  return Boolean(storeId() && storeToken());
}

async function edgeGet() {
  if (!canPersist()) return null;
  const team = storeTeam();
  const qs = team ? `?teamId=${encodeURIComponent(team)}` : '';
  const r = await fetch(`https://api.vercel.com/v1/edge-config/${storeId()}/item/store${qs}`, {
    headers: { Authorization: `Bearer ${storeToken()}` },
  });
  if (!r.ok) return null;
  const j = await r.json();
  const value = j && j.value;
  return validStore(value) ? value : null;
}

async function edgeSet(store) {
  if (!canPersist()) return false;
  const team = storeTeam();
  const qs = team ? `?teamId=${encodeURIComponent(team)}` : '';
  const r = await fetch(`https://api.vercel.com/v1/edge-config/${storeId()}/items${qs}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${storeToken()}`,
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

function validStore(store) {
  return store && Array.isArray(store.cases);
}

async function readStore() {
  const edge = await edgeGet();
  if (validStore(edge)) return edge;
  const tmp = readTmp();
  if (validStore(tmp)) return tmp;
  return loadSeed();
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
