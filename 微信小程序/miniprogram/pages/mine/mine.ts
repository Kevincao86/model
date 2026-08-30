import { merchants } from '../../utils/mock'
import { demo, syncChrome } from '../../utils/theme'

const NAV: Record<ThemeId, { member: { title: string; loc: string }; merchant: { title: string; loc: string } }> = {
  ink: {
    member: { title: '我', loc: '平阳会员' },
    merchant: { title: '店', loc: '昆阳茶寮' },
  },
  wechat: {
    member: { title: '我的', loc: '个人信息' },
    merchant: { title: '商家中心', loc: '昆阳茶寮' },
  },
  family: {
    member: { title: '我家', loc: '平阳小朋友' },
    merchant: { title: '我们店', loc: '昆阳茶寮' },
  },
  biz: {
    member: { title: '我的', loc: '平阳会员' },
    merchant: { title: '商家中心', loc: '昆阳茶寮' },
  },
}

Page({
  data: {
    theme: 'ink' as ThemeId,
    role: 'member' as RoleId,
    statusBarHeight: 47,
    tabIndex: 3,
    themeName: '墨典夜刊',
    roleLabel: '会员端',
    navTitle: NAV.ink.member.title,
    navLoc: NAV.ink.member.loc,
    shopCover: merchants[0].image,
    memberCover: merchants[1].image,
    memberMenu: [
      { k: '买单记录', v: '演示' },
      { k: '我的券与套餐', v: '' },
      { k: '积分明细', v: '1280' },
      { k: '锁客归属店', v: '昆阳茶寮' },
    ],
    merchantMenu: [
      { k: '入驻资料', v: '已提交' },
      { k: '上架券 / 套餐 / 门票', v: '' },
      { k: '分账与提现', v: '收付通' },
      { k: '跨店贡献', v: '¥420' },
      { k: '积分购发兑', v: '' },
    ],
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
    syncChrome(this, 3)
    const app = getApp<IAppOption>()
    const pair = NAV[app.globalData.theme][app.globalData.role]
    if (this.data.navTitle !== pair.title || this.data.navLoc !== pair.loc) {
      this.setData({ navTitle: pair.title, navLoc: pair.loc })
    }
  },
  demo() {
    demo()
  },
})
