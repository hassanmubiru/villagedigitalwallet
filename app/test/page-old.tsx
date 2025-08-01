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
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          🎉 Village Digital Wallet Test
        </h1>
        <p className="text-center text-gray-600 mb-4">
          If you can see this page, the deployment is working!
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>✅ Success!</strong> The basic Next.js app is functioning correctly.
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p><strong>Deployment URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side rendered'}</p>
          <p><strong>Build Time:</strong> {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  )
}
