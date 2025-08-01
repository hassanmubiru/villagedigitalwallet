import { Metadata } from 'next'
import ContractTester from '../components/ContractTester'

export const metadata: Metadata = {
  title: 'Village Digital Wallet - Contract Tester',
  description: 'Test smart contract interactions and user flows',
}

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ContractTester />
    </div>
  )
}
