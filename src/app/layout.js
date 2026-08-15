import './globals.css'

export const metadata = {
  title: 'BENstation',
  description: 'Aplikasi Kasir BENstation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Memuat Tailwind CSS & FontInter via CDN agar tampilan langsung rapi */}
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}</style>
      </head>
      <body className="bg-neutral-50 text-neutral-800 antialiased">{children}</body>
    </html>
  )
}
