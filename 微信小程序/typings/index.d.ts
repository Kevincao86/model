/// <reference path="./types/index.d.ts" />

type ThemeId = 'ink' | 'wechat' | 'family' | 'biz'
type RoleId = 'member' | 'merchant'

interface IAppOption {
  globalData: {
    theme: ThemeId
    role: RoleId
    statusBarHeight: number
    menuTop: number
    menuHeight: number
    capsulePad: number
  }
  setTheme: (theme: ThemeId) => void
  setRole: (role: RoleId) => void
}
