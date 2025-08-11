"use client"

import { createContext, useContext, type ReactNode } from "react"
import { ethers } from "ethers"

const CONTRACT_ADDRESS = "0xaf14a7F58f9d85e81010A4C3ae4F8EA16847C259"

const CONTRACT_ABI = [
  "function joinMatch(bytes32 matchId) external payable",
  "function confirmResult(bytes32 matchId, address winner, uint8 scoreA, uint8 scoreB) external",
  "function getMatch(bytes32 matchId) external view returns (tuple(address playerA, address playerB, bool paidOut, address winner, uint8 scoreA, uint8 scoreB))",
  "event MatchJoined(bytes32 indexed matchId, address indexed player, address playerA, address playerB)",
  "event ResultConfirmed(bytes32 indexed matchId, address indexed player, bytes32 resultHash)",
  "event MatchPaid(bytes32 indexed matchId, address indexed winner, uint256 amount)",
]

interface ContractContextType {
  joinMatch: (matchId: string) => Promise<void>
  confirmResult: (matchId: string, winner: string, scoreA: number, scoreB: number) => Promise<void>
  getMatch: (matchId: string) => Promise<any>
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export function ContractProvider({ children }: { children: ReactNode }) {
  const getContract = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Ethereum provider not found")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }

  const joinMatch = async (matchId: string) => {
    try {
      const contract = await getContract()

      // Estimate gas first
      const gasEstimate = await contract.joinMatch.estimateGas(matchId, {
        value: ethers.parseEther("0.001"),
      })

      const tx = await contract.joinMatch(matchId, {
        value: ethers.parseEther("0.001"),
        gasLimit: (gasEstimate * 120n) / 100n, // Add 20% buffer
      })

      await tx.wait()
    } catch (error: any) {
      console.error("Failed to join match:", error)

      if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient funds to join match")
      } else if (error.code === "USER_REJECTED") {
        throw new Error("Transaction rejected by user")
      } else if (error.message?.includes("Match full")) {
        throw new Error("Match is already full")
      } else if (error.message?.includes("Already joined")) {
        throw new Error("You have already joined this match")
      } else {
        throw new Error("Failed to join match. Please try again.")
      }
    }
  }

  const confirmResult = async (matchId: string, winner: string, scoreA: number, scoreB: number) => {
    try {
      const contract = await getContract()

      const gasEstimate = await contract.confirmResult.estimateGas(matchId, winner, scoreA, scoreB)

      const tx = await contract.confirmResult(matchId, winner, scoreA, scoreB, {
        gasLimit: (gasEstimate * 120n) / 100n,
      })

      await tx.wait()
    } catch (error: any) {
      console.error("Failed to confirm result:", error)

      if (error.code === "USER_REJECTED") {
        throw new Error("Transaction rejected by user")
      } else if (error.message?.includes("Not player")) {
        throw new Error("You are not a player in this match")
      } else if (error.message?.includes("Already paid")) {
        throw new Error("Match result already confirmed")
      } else {
        throw new Error("Failed to confirm result. Please try again.")
      }
    }
  }

  const getMatch = async (matchId: string) => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("Ethereum provider not found")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      const result = await contract.getMatch(matchId)

      return {
        playerA: result[0],
        playerB: result[1],
        paidOut: result[2],
        winner: result[3],
        scoreA: result[4],
        scoreB: result[5],
      }
    } catch (error) {
      console.error("Failed to get match:", error)
      throw new Error("Failed to fetch match information")
    }
  }

  return (
    <ContractContext.Provider
      value={{
        joinMatch,
        confirmResult,
        getMatch,
      }}
    >
      {children}
    </ContractContext.Provider>
  )
}

export function useContract() {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error("useContract must be used within a ContractProvider")
  }
  return context
}
