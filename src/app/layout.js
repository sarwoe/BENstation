import './globals.css'

export const metadata = {
  title: 'BENstation',
  description: 'Aplikasi Kasir BENstation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
