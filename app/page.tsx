"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WalletConnect } from "./components/wallet-connect"
import { MatchCreator } from "./components/match-creator"
import { MatchJoiner } from "./components/match-joiner"
import { GameBoard } from "./components/game-board"
import { MatchStatus } from "./components/match-status"
import { useWallet } from "./hooks/use-wallet"
import { Wifi, WifiOff } from "lucide-react"

export default function BattleshipGame() {
  const { isConnected, address } = useWallet()
  const [currentMatch, setCurrentMatch] = useState<string | null>(null)
  const [gamePhase, setGamePhase] = useState<"lobby" | "setup" | "playing" | "confirming" | "finished">("lobby")
  const [gameMode, setGameMode] = useState<"single" | "multi" | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">⚓ Battleship On-Chain</CardTitle>
            <CardDescription>
              Connect your wallet to start playing decentralized Battleship on Somnia Testnet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-2 sm:p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">⚓ Battleship On-Chain</h1>
          <p className="text-blue-200 text-sm sm:text-base">Decentralized naval warfare on Somnia Testnet</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs sm:text-sm text-blue-300">
            <span>
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <div className="flex items-center gap-1">
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        {/* Offline Warning */}
        {!isOnline && (
          <Alert variant="destructive" className="mb-6">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're offline. Multiplayer features are disabled. Single player mode is still available.
            </AlertDescription>
          </Alert>
        )}

        {gamePhase === "lobby" && !gameMode && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl">Choose Game Mode</CardTitle>
                <CardDescription className="text-blue-200">
                  Play against AI or challenge another player on-chain
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setGameMode("single")}
                  className="h-20 sm:h-24 bg-purple-600 hover:bg-purple-700 flex flex-col gap-2"
                >
                  <span className="text-base sm:text-lg">🤖 Single Player</span>
                  <span className="text-xs sm:text-sm opacity-80">Play against AI (Free)</span>
                </Button>
                <Button
                  onClick={() => setGameMode("multi")}
                  disabled={!isOnline}
                  className="h-20 sm:h-24 bg-blue-600 hover:bg-blue-700 flex flex-col gap-2 disabled:opacity-50"
                >
                  <span className="text-base sm:text-lg">⚔️ Multiplayer</span>
                  <span className="text-xs sm:text-sm opacity-80">Play on-chain (0.001 ETH)</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {gamePhase === "lobby" && gameMode === "multi" && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <MatchCreator
              onMatchCreated={(matchId) => {
                setCurrentMatch(matchId)
                setGamePhase("setup")
              }}
            />
            <MatchJoiner
              onMatchJoined={(matchId) => {
                setCurrentMatch(matchId)
                setGamePhase("setup")
              }}
            />
          </div>
        )}

        {gamePhase === "lobby" && gameMode === "single" && (
          <div className="max-w-md mx-auto">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader className="text-center">
                <CardTitle>🤖 Single Player Mode</CardTitle>
                <CardDescription className="text-blue-200">Battle against an AI opponent</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    setCurrentMatch("single-player")
                    setGamePhase("setup")
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Start Single Player Game
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentMatch && gamePhase !== "lobby" && (
          <div className="space-y-4 sm:space-y-6">
            <MatchStatus
              matchId={currentMatch}
              gamePhase={gamePhase}
              gameMode={gameMode!}
              onPhaseChange={setGamePhase}
            />

            {(gamePhase === "setup" || gamePhase === "playing") && (
              <GameBoard
                matchId={currentMatch}
                gamePhase={gamePhase}
                gameMode={gameMode!}
                onPhaseChange={setGamePhase}
              />
            )}

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentMatch(null)
                  setGamePhase("lobby")
                  setGameMode(null)
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Back to Lobby
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
