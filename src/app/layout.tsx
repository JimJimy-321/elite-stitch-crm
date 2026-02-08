import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SastrePro SaaS',
  description: 'Sistema de Gestión Multisede para Sastrerías Profesionales',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
