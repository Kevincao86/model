import {
  cats,
  coupons,
  gridCats,
  merchants,
  packs,
  verifyQueue,
  weekendRoute,
} from '../../utils/mock'
import { applyImageFallback, uploadWithCallback } from '../../utils/oss'
import { demo, demoAi, demoVr, syncChrome } from '../../utils/theme'

const featured = merchants[1]
const list = merchants
  .filter((item) => item.id !== featured.id)
  .map((item, i) => ({ ...item, no: String(i + 1).padStart(2, '0') }))

const NAV: Record<ThemeId, { title: string; loc: string }> = {
  ink: { title: '墨典夜刊', loc: '温州 · 平阳' },
  wechat: { title: '搜附近吃喝玩乐', loc: '平阳 · 昆阳' },
  family: { title: '周末好呀', loc: '平阳 · 今天带娃去哪' },
  biz: { title: '墨典联盟', loc: '温州平阳 · 商务宴请' },
}

Page({
  data: {
    theme: 'ink' as ThemeId,
    role: 'member' as RoleId,
    statusBarHeight: 47,
    tabIndex: 0,
    themeName: '墨典夜刊',
    roleLabel: '会员端',
    navTitle: NAV.ink.title,
    navLoc: NAV.ink.loc,
    cats,
    gridCats,
    coupons,
    packs,
    verifyQueue,
    weekendRoute,
    merchants,
    featured,
    list,
    bentoMain: merchants[4],
    bentoA: merchants[0],
    bentoB: merchants[5],
    bizTabs: ['全部', '餐饮', '景区', '亲子', '影院'],
    activeTab: '全部',
    bizList: merchants,
  },
  onShow() {
    this.syncNav()
  },
  onThemeChange() {
    this.syncNav()
  },
  onRoleChange() {
    this.syncNav()
  },
  syncNav() {
    syncChrome(this, 0)
    const theme = getApp<IAppOption>().globalData.theme
    const pair = NAV[theme]
    if (this.data.navTitle !== pair.title || this.data.navLoc !== pair.loc) {
      this.setData({ navTitle: pair.title, navLoc: pair.loc })
    }
  },
  demo() {
    demo()
  },
  demoVr() {
    demoVr()
  },
  demoAi() {
    demoAi()
  },
  goNearby() {
    wx.switchTab({ url: '/pages/nearby/nearby' })
  },
  onCat(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    if (id === 'wheel') {
      wx.switchTab({ url: '/pages/member/member' })
      return
    }
    demo()
  },
  onBizTab(e: WechatMiniprogram.TouchEvent) {
    const name = e.currentTarget.dataset.name as string
    const bizList =
      name === '全部' ? merchants : merchants.filter((item) => item.cat === name)
    this.setData({ activeTab: name, bizList })
  },
  onImgError(e: WechatMiniprogram.CustomEvent) {
    applyImageFallback(this, e)
  },
  onUploadShop() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const file = res.tempFiles[0]
        if (!file) return
        wx.showLoading({ title: 'OSS 直传中' })
        uploadWithCallback(file.tempFilePath, `shop-${Date.now()}.jpg`)
          .then((url) => {
            wx.hideLoading()
            wx.showToast({ title: '回调已回写', icon: 'none' })
            console.log(url)
          })
          .catch(() => {
            wx.hideLoading()
            demo('请配置总部 /oss/policy 后直传回调')
          })
      },
    })
  },
})
