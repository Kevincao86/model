import { merchants } from '../../utils/mock'
import { applyImageFallback } from '../../utils/oss'
import { demo, demoAi, demoVr, syncChrome } from '../../utils/theme'

const NAV: Record<ThemeId, { title: string; loc: string }> = {
  ink: { title: '近处', loc: '按夜色距离排列' },
  wechat: { title: '搜附近商家', loc: '距离优先' },
  family: { title: '附近好玩', loc: '少走路 · 多好玩' },
  biz: { title: '附近门店', loc: '按距离排序' },
}

Page({
  data: {
    theme: 'ink' as ThemeId,
    role: 'member' as RoleId,
    statusBarHeight: 47,
    tabIndex: 1,
    themeName: '墨典夜刊',
    roleLabel: '会员端',
    navTitle: NAV.ink.title,
    navLoc: NAV.ink.loc,
    filters: ['全部', '餐饮', '景区', '亲子', '1km'],
    active: '全部',
    list: merchants,
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
    syncChrome(this, 1)
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
  onFilter(e: WechatMiniprogram.TouchEvent) {
    const name = e.currentTarget.dataset.name as string
    const list =
      name === '全部' || name === '1km'
        ? merchants
        : merchants.filter((item) => item.cat === name)
    this.setData({ active: name, list })
  },
  onImgError(e: WechatMiniprogram.CustomEvent) {
    applyImageFallback(this, e)
  },
})
