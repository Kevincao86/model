#!/usr/bin/env node
/**
 * 将 AI 案例图直传 OSS，并带 callback。
 * 需要环境变量：OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET
 * 可选：OSS_CALLBACK_URL（总部回调，OSS 上传成功后 POST）
 *
 * 用法：node scripts/oss-seed.mjs
 */
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const HOST = 'https://modianningbo.oss-cn-shanghai.aliyuncs.com'
const DIR = 'modian-alliance/demo/'
const DIR_ABS = path.join(__dirname, '../miniprogram/images/demo')
const KEY_ID = process.env.OSS_ACCESS_KEY_ID || ''
const KEY_SECRET = process.env.OSS_ACCESS_KEY_SECRET || ''
const CALLBACK_URL = process.env.OSS_CALLBACK_URL || ''

function policyAndSign() {
  const expire = new Date(Date.now() + 30 * 60 * 1000).toISOString()
  const policyObj = {
    expiration: expire,
    conditions: [
      ['starts-with', '$key', DIR],
      ['content-length-range', 0, 8 * 1024 * 1024],
    ],
  }
  const policy = Buffer.from(JSON.stringify(policyObj)).toString('base64')
  const signature = crypto.createHmac('sha1', KEY_SECRET).update(policy).digest('base64')
  const callback = CALLBACK_URL
    ? Buffer.from(
        JSON.stringify({
          callbackUrl: CALLBACK_URL,
          callbackBody:
            'filename=${object}&size=${size}&mimeType=${mimeType}&height=${imageInfo.height}&width=${imageInfo.width}',
          callbackBodyType: 'application/x-www-form-urlencoded',
        }),
      ).toString('base64')
    : ''
  return { policy, signature, callback }
}

async function postFile(filePath, filename, cred) {
  const key = `${DIR}${filename}`
  const buf = fs.readFileSync(filePath)
  const boundary = '----ModianOss' + Date.now()
  const parts = []
  const fields = {
    key,
    policy: cred.policy,
    OSSAccessKeyId: KEY_ID,
    signature: cred.signature,
    success_action_status: '200',
  }
  if (cred.callback) fields.callback = cred.callback
  for (const [k, v] of Object.entries(fields)) {
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`,
    )
  }
  parts.push(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`,
  )
  const head = Buffer.from(parts.join(''), 'utf8')
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
  const body = Buffer.concat([head, buf, tail])
  const res = await fetch(HOST, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
  })
  const text = await res.text()
  return { ok: res.ok, status: res.status, text, url: `${HOST}/${key}` }
}

async function main() {
  if (!KEY_ID || !KEY_SECRET) {
    console.log('未配置 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET')
    console.log('案例图已在小程序包 images/demo/，接通总部 /oss/policy 后走直传回调。')
    process.exit(0)
  }
  const cred = policyAndSign()
  const files = fs.readdirSync(DIR_ABS).filter((n) => n.endsWith('.jpg'))
  for (const name of files) {
    const r = await postFile(path.join(DIR_ABS, name), name, cred)
    console.log(name, r.status, r.ok ? r.url : r.text.slice(0, 180))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
