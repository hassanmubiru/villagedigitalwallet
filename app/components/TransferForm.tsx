'use client'

import { useState } from "react"
import { useActiveAccount, useSendTransaction } from "thirdweb/react"
import { prepareTransaction, toWei } from "thirdweb"
import { client } from "../providers/ThirdwebProvider"
import { celo, defineChain } from "thirdweb/chains"

// Define Celo Alfajores testnet
const celoAlfajores = defineChain({
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpc: "https://alfajores-forno.celo-testnet.org",
})

export default function TransferForm() {
  const account = useActiveAccount()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedChain, setSelectedChain] = useState(celoAlfajores)
  const [isLoading, setIsLoading] = useState(false)
  const [txResult, setTxResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { mutate: sendTransaction } = useSendTransaction()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account) return

    setIsLoading(true)
    setError(null)
    setTxResult(null)

    try {
      // Validate inputs
      if (!recipient || !amount) {
        throw new Error("Please fill in all fields")
      }

      if (parseFloat(amount) <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      // Prepare the transaction
      const transaction = prepareTransaction({
        client,
        chain: selectedChain,
        to: recipient,
        value: toWei(amount),
      })

      // Send the transaction
      sendTransaction(transaction, {
        onSuccess: (result) => {
          setTxResult(result.transactionHash)
          setRecipient("")
          setAmount("")
          setIsLoading(false)
        },
        onError: (error) => {
          setError(error.message || "Transaction failed")
          setIsLoading(false)
        }
      })

    } catch (err: any) {
      setError(err.message || "An error occurred")
      setIsLoading(false)
    }
  }

  if (!account) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Connect your wallet to send tokens</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chain Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Network:
          </label>
          <select
            value={selectedChain.id}
            onChange={(e) => {
              const chainId = parseInt(e.target.value)
              setSelectedChain(chainId === celo.id ? celo : celoAlfajores)
            }}
            className="input"
          >
            <option value={celoAlfajores.id}>Celo Alfajores (Testnet)</option>
            <option value={celo.id}>Celo Mainnet</option>
          </select>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address:
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="input"
            disabled={isLoading}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (CELO):
          </label>
          <input
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            className="input"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !recipient || !amount}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="spinner"></div>
              <span>Sending...</span>
            </div>
          ) : (
            "Send CELO"
          )}
        </button>
      </form>

      {/* Transaction Result */}
      {txResult && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-green-800 font-semibold mb-2">Transaction Successful!</h4>
          <p className="text-sm text-green-700 mb-2">Transaction Hash:</p>
          <p className="font-mono text-sm text-green-800 break-all">
            {txResult}
          </p>
          <a
            href={`${selectedChain.id === celo.id ? 
              'https://explorer.celo.org' : 
              'https://alfajores.celoscan.io'}/tx/${txResult}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-green-600 hover:text-green-800 underline"
          >
            View on Explorer →
          </a>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2">Error</h4>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Quick Send Options */}
      <div className="border-t pt-4">
        <h4 className="text-gray-700 font-semibold mb-3">Quick Send</h4>
        <div className="grid grid-cols-3 gap-2">
          {["0.1", "0.5", "1.0"].map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount)}
              className="btn btn-secondary text-sm"
              disabled={isLoading}
            >
              {quickAmount} CELO
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
