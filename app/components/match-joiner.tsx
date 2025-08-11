"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContract } from "../hooks/use-contract"
import { Users, Loader2 } from "lucide-react"

interface MatchJoinerProps {
  onMatchJoined: (matchId: string) => void
}

export function MatchJoiner({ onMatchJoined }: MatchJoinerProps) {
  const [matchId, setMatchId] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const { joinMatch } = useContract()

  const handleJoinMatch = async () => {
    if (!matchId.trim()) return

    setIsJoining(true)
    try {
      await joinMatch(matchId)
      onMatchJoined(matchId)
    } catch (error) {
      console.error("Failed to join match:", error)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Join Match
        </CardTitle>
        <CardDescription className="text-blue-200">
          Join an existing Battleship match (Entry fee: 0.001 ETH)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="match-id" className="text-white">
            Match ID
          </Label>
          <Input
            id="match-id"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="0x..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        <Button
          onClick={handleJoinMatch}
          disabled={!matchId.trim() || isJoining}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isJoining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Match"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
