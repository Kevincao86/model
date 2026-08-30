import { THEMES } from '../../utils/theme'

Component({
  properties: {
    theme: {
      type: String,
      value: 'ink',
    },
  },
  data: {
    themes: THEMES,
  },
  methods: {
    pick(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id as ThemeId
      if (!id || id === this.properties.theme) return
      const app = getApp<IAppOption>()
      app.setTheme(id)
      this.triggerEvent('change', { theme: id })
    },
  },
})
