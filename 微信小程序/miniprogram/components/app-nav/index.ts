Component({
  properties: {
    theme: {
      type: String,
      value: 'ink',
    },
    role: {
      type: String,
      value: 'member',
    },
    title: {
      type: String,
      value: '墨典联盟',
    },
    loc: {
      type: String,
      value: '温州 · 平阳',
    },
  },
  data: {
    menuTop: 47,
    menuHeight: 32,
    capsulePad: 110,
  },
  lifetimes: {
    attached() {
      const app = getApp<IAppOption>()
      this.setData({
        menuTop: app.globalData.menuTop,
        menuHeight: app.globalData.menuHeight,
        capsulePad: app.globalData.capsulePad,
      })
    },
  },
  methods: {
    pickRole(e: WechatMiniprogram.TouchEvent) {
      const role = e.currentTarget.dataset.role as RoleId
      if (!role || role === this.properties.role) return
      const app = getApp<IAppOption>()
      app.setRole(role)
      this.triggerEvent('rolechange', { role })
    },
    onTheme(e: WechatMiniprogram.CustomEvent) {
      this.triggerEvent('themechange', e.detail)
    },
  },
})
