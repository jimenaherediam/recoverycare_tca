import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'recoveryTheme',
    themes: {
      recoveryTheme: {
        dark: false,
        colors: {
          primary: '#7C3AED',
          'primary-darken-1': '#6D28D9',
          'primary-darken-2': '#4C1D95',
          secondary: '#F59E0B',
          'secondary-darken-1': '#D97706',
          accent: '#C084FC',
          error: '#EF4444',
          warning: '#F97316',
          info: '#3B82F6',
          success: '#10B981',
          surface: '#FFFFFF',
          background: '#F5F3FF',
          'on-primary': '#FFFFFF',
          'on-secondary': '#1C1917',
        },
      },
    },
  },
  defaults: {
    VBtn: { style: 'font-weight: 600; letter-spacing: 0;' },
    VCard: { rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
  },
})
