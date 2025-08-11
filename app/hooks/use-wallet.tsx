"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  chainId: number | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    checkConnection()
    setupEventListeners()
  }, [])

  const setupEventListeners = () => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
      window.ethereum.on("disconnect", handleDisconnect)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      setAddress(accounts[0])
      setIsConnected(true)
      setError(null)
    }
  }

  const handleChainChanged = (chainId: string) => {
    setChainId(Number.parseInt(chainId, 16))
    // Reload the page to reset state
    window.location.reload()
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        const chainId = await window.ethereum.request({ method: "eth_chainId" })

        setChainId(Number.parseInt(chainId, 16))

        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Failed to check connection:", error)
        setError("Failed to check wallet connection")
      }
    }
  }

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Please install MetaMask or another Web3 wallet")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })

      setChainId(Number.parseInt(chainId, 16))

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error)

      if (error.code === 4001) {
        setError("Connection rejected by user")
      } else if (error.code === -32002) {
        setError("Connection request already pending")
      } else {
        setError("Failed to connect wallet. Please try again.")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setError(null)
    setChainId(null)
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        isConnecting,
        error,
        connect,
        disconnect,
        chainId,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
