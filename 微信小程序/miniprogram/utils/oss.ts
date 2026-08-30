import { API_BASE, OSS_DIR, OSS_HOST, POLICY_PATH } from '../config'

const STORE_KEY = 'oss-assets'

export interface OssPolicy {
  host: string
  dir: string
  policy: string
  signature: string
  accessKeyId: string
  callback: string
  expire?: number
}

export interface OssCallbackResult {
  url?: string
  data?: { url?: string }
}

function readCache(): Record<string, string> {
  const cached = wx.getStorageSync(STORE_KEY) as Record<string, string> | ''
  return cached && typeof cached === 'object' ? cached : {}
}

export function localUrl(key: string): string {
  return `/images/demo/${key}.jpg`
}

export function ossObjectUrl(key: string): string {
  return `${OSS_HOST}/${OSS_DIR}${key}.jpg`
}

/** 优先用 OSS 回调回写的地址，没有则用本地案例图 */
export function assetUrl(key: string): string {
  const hit = readCache()[key]
  return hit || localUrl(key)
}

export function rememberOssUrl(key: string, url: string): void {
  const next = { ...readCache(), [key]: url }
  wx.setStorageSync(STORE_KEY, next)
}

export function fetchOssPolicy(): Promise<OssPolicy> {
  if (!API_BASE) {
    return Promise.reject(new Error('NO_OSS_API'))
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${POLICY_PATH}`,
      method: 'GET',
      success(res) {
        const data = res.data as OssPolicy
        if (res.statusCode === 200 && data && data.host && data.policy && data.signature) {
          resolve(data)
          return
        }
        reject(new Error('OSS policy 无效'))
      },
      fail: reject,
    })
  })
}

export function applyImageFallback(
  page: WechatMiniprogram.Page.Instance<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject>,
  e: WechatMiniprogram.CustomEvent,
): void {
  const cover = e.currentTarget.dataset.cover as string
  const field = e.currentTarget.dataset.field as string
  const id = e.currentTarget.dataset.id as string
  const local = localUrl(cover)
  const failKey = `${field || 'item'}-${id || cover}`
  const bag = (page as { _imgFail?: Record<string, boolean> })._imgFail || {}
  if (bag[failKey]) return
  bag[failKey] = true
  ;(page as { _imgFail?: Record<string, boolean> })._imgFail = bag

  if (field === 'featured' || field === 'bentoMain' || field === 'bentoA' || field === 'bentoB') {
    const node = page.data[field] as { image?: string }
    if (node && node.image === local) return
    page.setData({ [`${field}.image`]: local })
    return
  }
  const list = page.data[field] as Array<{ id: string; image: string }>
  if (!Array.isArray(list)) return
  const hit = list.find((item) => item.id === id)
  if (hit && hit.image === local) return
  page.setData({
    [field]: list.map((item) => (item.id === id ? { ...item, image: local } : item)),
  })
}

/** 小程序直传 OSS，并带 callback。上传成功后 OSS 会 POST 总部回调。 */
export function uploadWithCallback(filePath: string, filename: string): Promise<string> {
  return fetchOssPolicy().then(
    (policy) =>
      new Promise((resolve, reject) => {
        const dir = policy.dir || OSS_DIR
        const key = `${dir}${filename}`
        wx.uploadFile({
          url: policy.host,
          filePath,
          name: 'file',
          formData: {
            key,
            policy: policy.policy,
            OSSAccessKeyId: policy.accessKeyId,
            signature: policy.signature,
            success_action_status: '200',
            callback: policy.callback,
          },
          success(res) {
            let url = `${OSS_HOST}/${key}`
            try {
              const body = JSON.parse(res.data) as OssCallbackResult
              if (body.url) url = body.url
              else if (body.data && body.data.url) url = body.data.url
            } catch (err) {
              console.log(err)
            }
            resolve(url)
          },
          fail: reject,
        })
      }),
  )
}
