"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useContract } from "../hooks/use-contract"
import { useWallet } from "../hooks/use-wallet"
import { Trophy, Users, Clock, CheckCircle } from "lucide-react"

interface MatchStatusProps {
  matchId: string
  gamePhase: string
  gameMode: "single" | "multi"
  onPhaseChange: (phase: "lobby" | "setup" | "playing" | "confirming" | "finished") => void
}

export function MatchStatus({ matchId, gamePhase, gameMode, onPhaseChange }: MatchStatusProps) {
  const [matchInfo, setMatchInfo] = useState<any>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const { getMatch, confirmResult } = useContract()
  const { address } = useWallet()

  useEffect(() => {
    if (gameMode === "single") {
      // For single player, create mock match info
      setMatchInfo({
        playerA: address,
        playerB: "0x0000000000000000000000000000000000000001", // AI player
        paidOut: false,
        winner: "0x0000000000000000000000000000000000000000",
        scoreA: 0,
        scoreB: 0,
      })
      return
    }

    const fetchMatchInfo = async () => {
      try {
        const info = await getMatch(matchId)
        setMatchInfo(info)
      } catch (error) {
        console.error("Failed to fetch match info:", error)
      }
    }

    fetchMatchInfo()
    const interval = setInterval(fetchMatchInfo, 5000)
    return () => clearInterval(interval)
  }, [matchId, getMatch, gameMode, address])

  // Auto-handle single player results
  useEffect(() => {
    const gameResult = localStorage.getItem(`game-result-${matchId}`)
    if (gameMode === "single" && gameResult && !winner) {
      const result = JSON.parse(gameResult)
      setWinner(result.winner)

      // Auto-transition to finished after showing result
      setTimeout(() => {
        onPhaseChange("finished")
      }, 3000)
    }
  }, [matchId, gameMode, winner, onPhaseChange])

  const handleConfirmResult = async (winnerAddress: string, scoreA: number, scoreB: number) => {
    if (gameMode === "single") {
      // For single player, just finish the game
      onPhaseChange("finished")
      return
    }

    setIsConfirming(true)
    try {
      await confirmResult(matchId, winnerAddress, scoreA, scoreB)
      onPhaseChange("finished")
    } catch (error) {
      console.error("Failed to confirm result:", error)
    } finally {
      setIsConfirming(false)
    }
  }

  if (!matchInfo) {
    return (
      <Card className="bg-white/10 border-white/20 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-5 w-5 animate-spin mr-2" />
            Loading match info...
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPlayerA = address === matchInfo.playerA
  const isPlayerB = address === matchInfo.playerB
  const bothPlayersJoined =
    matchInfo.playerA !== "0x0000000000000000000000000000000000000000" &&
    matchInfo.playerB !== "0x0000000000000000000000000000000000000000"

  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Match Status
          </span>
          <Badge variant={bothPlayersJoined ? "default" : "secondary"}>
            {gameMode === "single" ? "Single Player" : bothPlayersJoined ? "Ready" : "Waiting"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-200">
          {gameMode === "single" ? "Playing against AI" : `Match ID: ${matchId.slice(0, 10)}...${matchId.slice(-6)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Player A</span>
              {isPlayerA && (
                <Badge variant="outline" className="text-xs">
                  You
                </Badge>
              )}
            </div>
            <p className="text-xs text-blue-200 font-mono">
              {matchInfo.playerA === "0x0000000000000000000000000000000000000000"
                ? "Waiting..."
                : `${matchInfo.playerA.slice(0, 6)}...${matchInfo.playerA.slice(-4)}`}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Player B</span>
              {isPlayerB && (
                <Badge variant="outline" className="text-xs">
                  You
                </Badge>
              )}
              {gameMode === "single" && (
                <Badge variant="outline" className="text-xs">
                  AI
                </Badge>
              )}
            </div>
            <p className="text-xs text-blue-200 font-mono">
              {gameMode === "single"
                ? "🤖 AI Opponent"
                : matchInfo.playerB === "0x0000000000000000000000000000000000000000"
                  ? "Waiting..."
                  : `${matchInfo.playerB.slice(0, 6)}...${matchInfo.playerB.slice(-4)}`}
            </p>
          </div>
        </div>

        {/* Single Player Result Display */}
        {gameMode === "single" && winner && (
          <div
            className={`${winner === "player" ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30"} border rounded-lg p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className={`h-5 w-5 ${winner === "player" ? "text-green-400" : "text-red-400"}`} />
              <span className={`font-medium ${winner === "player" ? "text-green-400" : "text-red-400"}`}>
                Game Completed
              </span>
            </div>
            <p className={`text-sm ${winner === "player" ? "text-green-200" : "text-red-200"}`}>
              {winner === "player" ? "🎉 You Won!" : "💀 AI Won!"}
            </p>
          </div>
        )}

        {/* Multiplayer Result Display */}
        {gameMode === "multi" && matchInfo.paidOut && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-medium text-green-400">Match Completed</span>
            </div>
            <p className="text-sm text-green-200">
              Winner:{" "}
              {matchInfo.winner === address
                ? "You!"
                : `${matchInfo.winner.slice(0, 6)}...${matchInfo.winner.slice(-4)}`}
            </p>
            <p className="text-xs text-green-300">
              Score: {matchInfo.scoreA} - {matchInfo.scoreB}
            </p>
          </div>
        )}

        {/* Multiplayer Confirmation */}
        {gameMode === "multi" && gamePhase === "confirming" && !matchInfo.paidOut && (
          <div className="space-y-2">
            <p className="text-sm text-yellow-200">Game finished! Confirm the result:</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleConfirmResult(address!, 5, 0)}
                disabled={isConfirming}
                className="bg-green-600 hover:bg-green-700"
              >
                I Won (5-0)
              </Button>
              <Button
                size="sm"
                onClick={() => handleConfirmResult(isPlayerA ? matchInfo.playerB : matchInfo.playerA, 0, 5)}
                disabled={isConfirming}
                className="bg-red-600 hover:bg-red-700"
              >
                I Lost (0-5)
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-blue-300">
          {gameMode === "single" ? (
            <p>Single Player Mode - Free to play!</p>
          ) : (
            <>
              <p>Entry Fee: 0.001 ETH per player</p>
              <p>Prize Pool: {bothPlayersJoined ? "0.002 ETH" : "0.001 ETH"}</p>
              <p>Network: Somnia Testnet</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
