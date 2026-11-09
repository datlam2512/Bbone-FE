import '@/shared/styles/layers.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { Theme } from '@astryxdesign/core/theme'
import '@astryxdesign/core/reset.css'
import '@astryxdesign/core/astryx.css'
import { themes, defaultThemeSlug } from './astryx-themes'
import '@/shared/styles/globals.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Theme theme={themes[defaultThemeSlug]} mode="light">
      <RouterProvider router={router} />
    </Theme>
  </StrictMode>,
)
