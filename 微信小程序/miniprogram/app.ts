import { readRole, readTheme } from './utils/theme'

App<IAppOption>({
  globalData: {
    theme: 'ink',
    role: 'member',
    statusBarHeight: 47,
    menuTop: 47,
    menuHeight: 32,
    capsulePad: 110,
  },
  onLaunch() {
    const info = wx.getSystemInfoSync()
    const menu = wx.getMenuButtonBoundingClientRect()
    this.globalData.statusBarHeight = info.statusBarHeight || 47
    this.globalData.menuTop = menu.top || info.statusBarHeight || 47
    this.globalData.menuHeight = menu.height || 32
    this.globalData.capsulePad = Math.max(96, info.windowWidth - menu.left + 8)
    this.globalData.theme = readTheme()
    this.globalData.role = readRole()
  },
  setTheme(theme: ThemeId) {
    this.globalData.theme = theme
    wx.setStorageSync('modian-theme', theme)
  },
  setRole(role: RoleId) {
    this.globalData.role = role
    wx.setStorageSync('modian-role', role)
  },
})
