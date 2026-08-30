export const THEMES: { id: ThemeId; name: string; short: string; code: string; dot: string }[] = [
  { id: 'ink', name: '墨典夜刊', short: '夜刊', code: 'INK', dot: '#D4A574' },
  { id: 'wechat', name: '点评绿', short: '点评', code: 'WX', dot: '#07C160' },
  { id: 'family', name: '带娃出行', short: '带娃', code: 'KID', dot: '#FF6B3D' },
  { id: 'biz', name: '宴请台', short: '宴请', code: 'BIZ', dot: '#0B1F33' },
]

const PAGE_BG: Record<ThemeId, string> = {
  ink: '#0C0A08',
  wechat: '#EDEDED',
  family: '#FFF1E3',
  biz: '#E8EDF2',
}

const TAB_LABELS: Record<ThemeId, string[]> = {
  ink: ['今夜', '近处', '册页', '我'],
  wechat: ['首页', '附近', '卡包', '我的'],
  family: ['去玩', '附近', '卡包', '我家'],
  biz: ['总览', '门店', '资产', '账户'],
}

export function readTheme(): ThemeId {
  const saved = wx.getStorageSync('modian-theme') as ThemeId
  if (saved === 'ink' || saved === 'wechat' || saved === 'family' || saved === 'biz') {
    return saved
  }
  return 'ink'
}

export function readRole(): RoleId {
  const saved = wx.getStorageSync('modian-role') as RoleId
  return saved === 'merchant' ? 'merchant' : 'member'
}

export function themeName(id: ThemeId): string {
  const hit = THEMES.find((item) => item.id === id)
  return hit ? hit.name : '墨典夜刊'
}

export function syncChrome(
  page: WechatMiniprogram.Page.Instance<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject>,
  tabIndex: number,
): void {
  const app = getApp<IAppOption>()
  const theme = app.globalData.theme
  const role = app.globalData.role
  const themeLabel = themeName(theme)
  const roleLabel = role === 'merchant' ? '商家端' : '会员端'
  const same =
    page.data.theme === theme &&
    page.data.role === role &&
    page.data.tabIndex === tabIndex &&
    page.data.themeName === themeLabel &&
    page.data.roleLabel === roleLabel
  if (!same) {
    page.setData({
      theme,
      role,
      statusBarHeight: app.globalData.statusBarHeight,
      tabIndex,
      themeName: themeLabel,
      roleLabel,
    })
  }
  try {
    const bar = page.getTabBar()
    if (bar) {
      const labels = TAB_LABELS[theme]
      const barData = bar.data as {
        selected?: number
        theme?: string
        role?: string
        list?: { pagePath: string; text: string; key: string }[]
      }
      const nextList = (barData.list || []).map((item, i) => ({
        ...item,
        text: labels[i] || item.text,
      }))
      const listSame =
        barData.list &&
        nextList.every((item, i) => item.text === barData.list![i].text)
      if (
        barData.selected !== tabIndex ||
        barData.theme !== theme ||
        barData.role !== role ||
        !listSame
      ) {
        bar.setData({ selected: tabIndex, theme, role, list: nextList })
      }
    }
  } catch (err) {
    console.log(err)
  }
  wx.setBackgroundColor({ backgroundColor: PAGE_BG[theme] })
  try {
    wx.setNavigationBarColor({
      frontColor: theme === 'ink' ? '#ffffff' : '#000000',
      backgroundColor: PAGE_BG[theme],
    })
  } catch (err) {
    console.log(err)
  }
}

export function demo(title = '演示占位，一期接通后可用'): void {
  wx.showToast({ title, icon: 'none' })
}

export function demoVr(): void {
  wx.showToast({ title: 'VR 预览 · 二期接入全景拖转', icon: 'none', duration: 2200 })
}

export function demoAi(): void {
  wx.showToast({ title: '智能能力已预埋，二期开启', icon: 'none', duration: 2200 })
}
