import './globals.css'
import { Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';


const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="en">
      <head>
        <title>Chat app</title>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta name="description" content="Chat app" />
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            const query = window.matchMedia("(prefers-color-scheme: dark)");
            const theme = localStorage.getItem("theme");
            if (theme === "dark" || (!theme && query.matches)) {
              document.documentElement.classList.add("dark");
            }
          `
          }}
          />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
