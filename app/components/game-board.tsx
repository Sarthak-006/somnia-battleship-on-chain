"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Ship, Target, Waves, Zap, RotateCw } from "lucide-react"

interface GameBoardProps {
  matchId: string
  gamePhase: "setup" | "playing"
  gameMode: "single" | "multi"
  onPhaseChange: (phase: "lobby" | "setup" | "playing" | "confirming" | "finished") => void
}

type CellState = "empty" | "ship" | "hit" | "miss" | "sunk"

interface GameState {
  myBoard: CellState[][]
  enemyBoard: CellState[][]
  myHits: number
  enemyHits: number
  isMyTurn: boolean
  gameStarted: boolean
}

export function GameBoard({ matchId, gamePhase, gameMode, onPhaseChange }: GameBoardProps) {
  const ships = [
    { id: 1, name: "Carrier", size: 5 },
    { id: 2, name: "Battleship", size: 4 },
    { id: 3, name: "Cruiser", size: 3 },
    { id: 4, name: "Submarine", size: 3 },
    { id: 5, name: "Destroyer", size: 2 },
  ]

  const generateEnemyShips = () => {
    const board: CellState[][] = Array(10)
      .fill(null)
      .map(() => Array(10).fill("empty"))
    const shipsToPlace = [...ships]

    for (const ship of shipsToPlace) {
      let placed = false
      let attempts = 0

      while (!placed && attempts < 100) {
        const horizontal = Math.random() > 0.5
        const row = Math.floor(Math.random() * 10)
        const col = Math.floor(Math.random() * 10)

        let canPlace = true
        const positions: [number, number][] = []

        for (let i = 0; i < ship.size; i++) {
          const r = horizontal ? row : row + i
          const c = horizontal ? col + i : col

          if (r >= 10 || c >= 10 || board[r][c] !== "empty") {
            canPlace = false
            break
          }
          positions.push([r, c])
        }

        if (canPlace) {
          let hasAdjacent = false
          for (const [r, c] of positions) {
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr
                const nc = c + dc
                if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && board[nr][nc] === "ship") {
                  hasAdjacent = true
                  break
                }
              }
              if (hasAdjacent) break
            }
            if (hasAdjacent) break
          }

          if (!hasAdjacent) {
            positions.forEach(([r, c]) => {
              board[r][c] = "ship"
            })
            placed = true
          }
        }
        attempts++
      }
    }
    return board
  }

  const [myBoard, setMyBoard] = useState<CellState[][]>(
    Array(10)
      .fill(null)
      .map(() => Array(10).fill("empty")),
  )
  const [enemyBoard, setEnemyBoard] = useState<CellState[][]>(
    Array(10)
      .fill(null)
      .map(() => Array(10).fill("empty")),
  )
  const [selectedShip, setSelectedShip] = useState<number | null>(null)
  const [shipsPlaced, setShipsPlaced] = useState<number[]>([])
  const [isMyTurn, setIsMyTurn] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [myHits, setMyHits] = useState(0)
  const [enemyHits, setEnemyHits] = useState(0)
  const [isHorizontal, setIsHorizontal] = useState(true)
  const [enemyShips, setEnemyShips] = useState<CellState[][]>(() =>
    Array(10)
      .fill(null)
      .map(() => Array(10).fill("empty")),
  )
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Auto-handle single player result
  useEffect(() => {
    if (gameMode === "single" && (myHits >= 17 || enemyHits >= 17)) {
      const winner = myHits >= 17 ? "player" : "ai"

      // Store result for match status component
      localStorage.setItem(
        `game-result-${matchId}`,
        JSON.stringify({
          winner,
          playerHits: myHits,
          aiHits: enemyHits,
        }),
      )

      setTimeout(() => {
        onPhaseChange("confirming")
      }, 2000)
    }
  }, [myHits, enemyHits, gameMode, onPhaseChange, matchId])

  // Multiplayer game state synchronization
  useEffect(() => {
    if (gameMode === "multi" && gameStarted) {
      const syncGameState = () => {
        // Simple multiplayer sync using localStorage (in production, use WebSocket/server)
        const storedState = localStorage.getItem(`multiplayer-${matchId}`)
        if (storedState) {
          const parsed = JSON.parse(storedState)
          if (parsed.lastUpdate > Date.now() - 10000) {
            // Only sync recent updates
            // Update opponent's moves
            if (parsed.opponentBoard) {
              setMyBoard(parsed.opponentBoard)
            }
          }
        }
      }

      const interval = setInterval(syncGameState, 3000)
      return () => clearInterval(interval)
    }
  }, [gameMode, gameStarted, matchId])

  const placeShip = (row: number, col: number, shipId: number, horizontal = isHorizontal) => {
    const ship = ships.find((s) => s.id === shipId)
    if (!ship || shipsPlaced.includes(shipId)) return false

    const newBoard = [...myBoard]
    const positions: [number, number][] = []

    // Check if ship can be placed
    for (let i = 0; i < ship.size; i++) {
      const r = horizontal ? row : row + i
      const c = horizontal ? col + i : col

      if (r >= 10 || c >= 10 || newBoard[r][c] !== "empty") {
        return false
      }
      positions.push([r, c])
    }

    // Check for adjacent ships
    for (const [r, c] of positions) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && newBoard[nr][nc] === "ship") {
            return false // Ships can't be adjacent
          }
        }
      }
    }

    // Place ship
    positions.forEach(([r, c]) => {
      newBoard[r][c] = "ship"
    })

    setMyBoard(newBoard)
    setShipsPlaced([...shipsPlaced, shipId])
    setSelectedShip(null)
    return true
  }

  const handleCellClick = (row: number, col: number, isMyBoard: boolean) => {
    if (isProcessing) return

    if (gamePhase === "setup" && isMyBoard && selectedShip) {
      placeShip(row, col, selectedShip)
    } else if (gamePhase === "playing" && !isMyBoard && isMyTurn) {
      setIsProcessing(true)
      attackCell(row, col)
    }
  }

  const attackCell = (row: number, col: number) => {
    const newEnemyBoard = [...enemyBoard]

    // Prevent attacking same cell twice
    if (newEnemyBoard[row][col] !== "empty") {
      setIsProcessing(false)
      return
    }

    let isHit = false

    if (gameMode === "single") {
      isHit = enemyShips[row][col] === "ship"
    } else {
      // For multiplayer, simulate hit detection (in real app, this would come from server)
      isHit = Math.random() > 0.65 // Slightly higher hit rate for better gameplay
    }

    if (isHit) {
      newEnemyBoard[row][col] = "hit"
      setMyHits((prev) => prev + 1)
    } else {
      newEnemyBoard[row][col] = "miss"
    }

    setEnemyBoard(newEnemyBoard)
    setIsMyTurn(false)

    // Store game state for multiplayer
    if (gameMode === "multi") {
      const gameState = {
        playerBoard: myBoard,
        opponentBoard: newEnemyBoard,
        lastUpdate: Date.now(),
        turn: "opponent",
      }
      localStorage.setItem(`multiplayer-${matchId}`, JSON.stringify(gameState))
    }

    // Check win condition
    const newHits = myHits + (isHit ? 1 : 0)
    if (newHits >= 17) {
      setTimeout(() => {
        if (gameMode === "single") {
          localStorage.setItem(
            `game-result-${matchId}`,
            JSON.stringify({
              winner: "player",
              playerHits: newHits,
              aiHits: enemyHits,
            }),
          )
        }
        onPhaseChange("confirming")
      }, 1000)
      return
    }

    // Simulate enemy turn
    setTimeout(
      () => {
        simulateEnemyTurn()
      },
      1500 + Math.random() * 1000,
    )
  }

  const simulateEnemyTurn = () => {
    const newMyBoard = [...myBoard]
    let row, col
    let attempts = 0

    // Find a random cell that hasn't been attacked
    do {
      row = Math.floor(Math.random() * 10)
      col = Math.floor(Math.random() * 10)
      attempts++
    } while ((newMyBoard[row][col] === "hit" || newMyBoard[row][col] === "miss") && attempts < 100)

    if (attempts >= 100) {
      // Find any unattacked cell
      let found = false
      for (let r = 0; r < 10 && !found; r++) {
        for (let c = 0; c < 10 && !found; c++) {
          if (newMyBoard[r][c] !== "hit" && newMyBoard[r][c] !== "miss") {
            row = r
            col = c
            found = true
          }
        }
      }
    }

    const isHit = newMyBoard[row][col] === "ship"

    if (isHit) {
      newMyBoard[row][col] = "hit"
      setEnemyHits((prev) => prev + 1)
    } else {
      newMyBoard[row][col] = "miss"
    }

    setMyBoard(newMyBoard)
    setIsMyTurn(true)
    setIsProcessing(false)

    // Store game state for multiplayer
    if (gameMode === "multi") {
      const gameState = {
        myBoard: newMyBoard,
        enemyBoard,
        myHits,
        enemyHits: enemyHits + (isHit ? 1 : 0),
        isMyTurn: true,
        gameStarted: true,
      }
      localStorage.setItem(`game-${matchId}`, JSON.stringify(gameState))
    }
  }

  const startGame = () => {
    if (shipsPlaced.length < 5) return

    setIsProcessing(true)

    try {
      if (gameMode === "single") {
        const newEnemyShips = generateEnemyShips()
        setEnemyShips(newEnemyShips)
      }

      setGameStarted(true)
      onPhaseChange("playing")
    } catch (error) {
      console.error("Failed to start game:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderCell = (row: number, col: number, state: CellState, isMyBoard: boolean) => {
    const getCellContent = () => {
      switch (state) {
        case "ship":
          return isMyBoard ? <Ship className="h-3 w-3 text-gray-600" /> : null
        case "hit":
          return <Target className="h-3 w-3 text-red-500" />
        case "miss":
          return <Waves className="h-3 w-3 text-blue-400" />
        default:
          return null
      }
    }

    const getCellColor = () => {
      switch (state) {
        case "ship":
          return isMyBoard ? "bg-gray-300" : "bg-blue-100"
        case "hit":
          return "bg-red-200"
        case "miss":
          return "bg-blue-200"
        default:
          return "bg-blue-100 hover:bg-blue-200"
      }
    }

    const isClickable =
      (gamePhase === "setup" && isMyBoard && selectedShip) ||
      (gamePhase === "playing" && !isMyBoard && isMyTurn && state === "empty" && !isProcessing)

    return (
      <button
        key={`${row}-${col}`}
        className={cn(
          "w-6 h-6 sm:w-8 sm:h-8 border border-blue-300 flex items-center justify-center transition-colors text-xs",
          getCellColor(),
          isClickable ? "cursor-pointer hover:scale-105" : "cursor-default",
          isProcessing && "opacity-50",
        )}
        onClick={() => handleCellClick(row, col, isMyBoard)}
        disabled={!isClickable}
        aria-label={`Cell ${row + 1}-${col + 1}`}
      >
        {getCellContent()}
      </button>
    )
  }

  const getGameStatus = () => {
    if (myHits >= 17) return "🎉 You Won!"
    if (enemyHits >= 17) return "💀 You Lost!"
    if (gamePhase === "playing" && isMyTurn) return "🎯 Your Turn"
    if (gamePhase === "playing" && !isMyTurn) return "⏳ Enemy Turn"
    return ""
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {gamePhase === "setup" && (
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Ship className="h-5 w-5" />
              Ship Placement
            </CardTitle>
            <CardDescription className="text-blue-200 text-sm">
              Place your ships on the board. Click a ship, then click on the board to place it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {ships.map((ship) => (
                <Button
                  key={ship.id}
                  variant={selectedShip === ship.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedShip(ship.id)}
                  disabled={shipsPlaced.includes(ship.id)}
                  className={cn(
                    "text-xs",
                    shipsPlaced.includes(ship.id) && "opacity-50",
                    selectedShip === ship.id && "bg-blue-600",
                  )}
                >
                  {ship.name} ({ship.size}){shipsPlaced.includes(ship.id) && " ✓"}
                </Button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm">Ships placed: {shipsPlaced.length}/5</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHorizontal(!isHorizontal)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  {isHorizontal ? "Horizontal" : "Vertical"}
                </Button>
              </div>
              <Button
                onClick={startGame}
                disabled={shipsPlaced.length < 5 || isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? "Starting..." : "Start Game"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gamePhase === "playing" && (
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{getGameStatus()}</h2>
          {isProcessing && <p className="text-blue-200 text-sm">Processing move...</p>}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base sm:text-lg">
              <span>Your Board</span>
              <Badge variant="outline" className="text-xs">
                Hits taken: {enemyHits}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-0.5 sm:gap-1 w-fit mx-auto">
              {myBoard.map((row, rowIndex) => row.map((cell, colIndex) => renderCell(rowIndex, colIndex, cell, true)))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base sm:text-lg">
              <span>Enemy Board</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Your hits: {myHits}
                </Badge>
                {gamePhase === "playing" && (
                  <Badge variant={isMyTurn ? "default" : "secondary"} className="text-xs">
                    {isMyTurn ? "Your Turn" : "Enemy Turn"}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-0.5 sm:gap-1 w-fit mx-auto">
              {enemyBoard.map((row, rowIndex) =>
                row.map((cell, colIndex) => renderCell(rowIndex, colIndex, cell, false)),
              )}
            </div>
            {gamePhase === "playing" && !isMyTurn && (
              <div className="text-center mt-4 text-blue-200">
                <Zap className="h-4 w-4 animate-pulse inline mr-2" />
                {gameMode === "single" ? "AI is thinking..." : "Waiting for opponent..."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
