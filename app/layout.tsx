import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "./hooks/use-wallet"
import { ContractProvider } from "./hooks/use-contract"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Battleship On-Chain",
  description: "Decentralized Battleship game on the blockchain",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <ContractProvider>{children}</ContractProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
