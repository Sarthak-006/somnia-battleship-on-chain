"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "../hooks/use-wallet"
import { Wallet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function WalletConnect() {
  const { connect, isConnecting, error } = useWallet()

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={connect} disabled={isConnecting} className="w-full bg-blue-600 hover:bg-blue-700">
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>

      <p className="text-xs text-blue-300 text-center">
        Make sure you're on the correct network and have MetaMask installed
      </p>
    </div>
  )
}
