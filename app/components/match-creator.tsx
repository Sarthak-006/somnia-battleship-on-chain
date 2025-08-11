"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContract } from "../hooks/use-contract"
import { Plus, Loader2 } from "lucide-react"

interface MatchCreatorProps {
  onMatchCreated: (matchId: string) => void
}

export function MatchCreator({ onMatchCreated }: MatchCreatorProps) {
  const [matchName, setMatchName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { joinMatch } = useContract()

  const createMatch = async () => {
    if (!matchName.trim()) return

    setIsCreating(true)
    try {
      // Generate a unique match ID based on name and timestamp
      const matchId = `0x${Buffer.from(`${matchName}-${Date.now()}`).toString("hex").padEnd(64, "0")}`

      await joinMatch(matchId)
      onMatchCreated(matchId)
    } catch (error) {
      console.error("Failed to create match:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Match
        </CardTitle>
        <CardDescription className="text-blue-200">Start a new Battleship match (Entry fee: 0.001 ETH)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="match-name" className="text-white">
            Match Name
          </Label>
          <Input
            id="match-name"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
            placeholder="Enter match name..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        <Button
          onClick={createMatch}
          disabled={!matchName.trim() || isCreating}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create & Join Match"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
