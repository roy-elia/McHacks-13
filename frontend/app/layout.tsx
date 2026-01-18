import './globals.css'

export const metadata = {
  title: 'AACTION - AI-Powered Communication',
  description: 'AACTION: Accessible, Intelligent, Empowering communication for everyone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
