import { defineTheme } from '@astryxdesign/core/theme'
import { neutralTheme as importedTheme } from '@astryxdesign/theme-neutral'

// Extend the maintained theme; keep brand decisions in one place.
export const bboneTheme = defineTheme({
  name: 'bbone',
  extends: importedTheme,
  tokens: {
    '--color-accent': ['#0066ee', '#70b5ff'],
    '--color-on-accent': ['#ffffff', '#102a56'],
    '--color-accent-muted': ['#eff7ff', '#152d4b'],
    '--color-text-accent': ['#0053c4', '#93cfff'],
    '--color-icon-accent': ['#0066ee', '#93cfff'],
    '--color-background-body': ['#fafcfd', '#0c1726'],
    '--color-background-surface': ['#ffffff', '#142238'],
    '--color-text-primary': ['#102a56', '#edf5ff'],
    '--color-text-secondary': ['#536277', '#acbad0'],
    '--color-border': ['#dce7f0', '#2d415b'],
    '--font-family-body': '"Be Vietnam Pro", "Segoe UI", system-ui, sans-serif',
    '--font-family-heading': '"Be Vietnam Pro", "Segoe UI", system-ui, sans-serif',
  },
})
