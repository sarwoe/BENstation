import './globals.css'

export const metadata = {
  title: 'BENstation POS',
  description: 'Sistem Kasir BENstation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}

