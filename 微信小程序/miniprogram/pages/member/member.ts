import { coupons, packs, tickets, verifyQueue } from '../../utils/mock'
import { applyImageFallback } from '../../utils/oss'
import { demo, demoVr, syncChrome } from '../../utils/theme'

const NAV: Record<ThemeId, { member: { title: string; loc: string }; merchant: { title: string; loc: string } }> = {
  ink: {
    member: { title: '册页', loc: '积分 · 券印 · 套餐' },
    merchant: { title: '核销簿', loc: '到店确认' },
  },
  wechat: {
    member: { title: '卡包', loc: '券和积分都在这' },
    merchant: { title: '核销', loc: '扫码或输券码' },
  },
  family: {
    member: { title: '我的卡包', loc: '星星和门票' },
    merchant: { title: '给小朋友核销', loc: '到店点一下就好' },
  },
  biz: {
    member: { title: '我的账户', loc: '积分 · 券 · 套餐' },
    merchant: { title: '到店核销', loc: '待核销队列' },
  },
}

Page({
  data: {
    theme: 'ink' as ThemeId,
    role: 'member' as RoleId,
    statusBarHeight: 47,
    tabIndex: 2,
    themeName: '墨典夜刊',
    roleLabel: '会员端',
    navTitle: NAV.ink.member.title,
    navLoc: NAV.ink.member.loc,
    coupons,
    packs,
    tickets,
    verifyQueue,
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
    syncChrome(this, 2)
    const app = getApp<IAppOption>()
    const pair = NAV[app.globalData.theme][app.globalData.role]
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
  onImgError(e: WechatMiniprogram.CustomEvent) {
    applyImageFallback(this, e)
  },
})
