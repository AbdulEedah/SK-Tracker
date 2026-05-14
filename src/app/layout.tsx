import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'

// Import local fonts
import '@fontsource/work-sans/300.css'
import '@fontsource/work-sans/400.css'
import '@fontsource/work-sans/500.css'
import '@fontsource/work-sans/600.css'
import '@fontsource/work-sans/700.css'
import '@fontsource/work-sans/800.css'

import '@fontsource/reem-kufi/400.css'
import '@fontsource/reem-kufi/500.css'
import '@fontsource/reem-kufi/600.css'
import '@fontsource/reem-kufi/700.css'

export const metadata: Metadata = {
  title: 'Startup Kano center for innovation developement Hub - Portfolio Management',
  description: 'Task management and team collaboration platform for Startup Kano center for innovation developement Hub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            richColors
            closeButton
          />
        </AuthProvider>
      </body>
    </html>
  )
}