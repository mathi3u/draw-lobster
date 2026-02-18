import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Draw me a lobster',
  description: 'Draw a lobster and watch it walk across the ocean floor',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
