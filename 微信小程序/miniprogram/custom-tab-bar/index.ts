Component({
  data: {
    selected: 0,
    theme: 'ink' as ThemeId,
    role: 'member' as RoleId,
    list: [
      { pagePath: '/pages/home/home', text: '首页', key: 'home' },
      { pagePath: '/pages/nearby/nearby', text: '附近', key: 'near' },
      { pagePath: '/pages/member/member', text: '会员', key: 'member' },
      { pagePath: '/pages/mine/mine', text: '我的', key: 'mine' },
    ],
  },
  lifetimes: {
    attached() {
      const app = getApp<IAppOption>()
      this.setData({ theme: app.globalData.theme, role: app.globalData.role })
    },
  },
  methods: {
    switchTab(e: WechatMiniprogram.TouchEvent) {
      const path = e.currentTarget.dataset.path as string
      wx.switchTab({ url: path })
    },
  },
})
