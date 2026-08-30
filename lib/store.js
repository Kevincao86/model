const fs = require('fs');
const path = require('path');

const KEY = 'modian-cases-v1';
const TMP = '/tmp/modian-cases.json';
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');

function loadSeed() {
  return JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
}

async function kvGet() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const r = await fetch(`${url}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const j = await r.json();
  if (!j.result) return null;
  try {
    return typeof j.result === 'string' ? JSON.parse(j.result) : j.result;
  } catch {
    return null;
  }
}

async function kvSet(store) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', KEY, JSON.stringify(store)]),
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
  const kv = await kvGet();
  if (validStore(kv)) return kv;
  const tmp = readTmp();
  if (validStore(tmp)) return tmp;
  return loadSeed();
}

async function writeStore(store) {
  store.updatedAt = Date.now();
  const persisted = await kvSet(store);
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
};
