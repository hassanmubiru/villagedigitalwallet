// Core Types for Village Digital Wallet

export interface User {
  id: string
  address: string
  name: string
  phoneNumber: string
  profileImage?: string
  language: 'en' | 'sw' | 'fr' | 'es'
  isVerified: boolean
  joinedAt: Date
  reputation: number
}

export interface SavingsGroup {
  id: string
  name: string
  description: string
  members: GroupMember[]
  adminId: string
  contractAddress?: string
  totalSavings: string
  contributionAmount: string
  contributionFrequency: 'daily' | 'weekly' | 'monthly'
  payoutOrder: string[]
  currentRound: number
  isActive: boolean
  createdAt: Date
  nextPayoutDate: Date
}

export interface GroupMember {
  userId: string
  user: User
  joinedAt: Date
  totalContributions: string
  missedPayments: number
  isActive: boolean
  role: 'admin' | 'member'
}

export interface Contribution {
  id: string
  groupId: string
  userId: string
  amount: string
  transactionHash: string
  timestamp: Date
  round: number
  isLate: boolean
}

export interface Payout {
  id: string
  groupId: string
  recipientId: string
  amount: string
  transactionHash: string
  timestamp: Date
  round: number
}

export interface Loan {
  id: string
  borrowerId: string
  lenderId?: string
  groupId?: string
  amount: string
  interestRate: number
  duration: number // in days
  purpose: string
  status: 'pending' | 'approved' | 'disbursed' | 'repaying' | 'completed' | 'defaulted'
  collateral?: string
  createdAt: Date
  approvedAt?: Date
  disbursedAt?: Date
  dueDate: Date
  totalRepaid: string
  contractAddress?: string
}

export interface LoanPayment {
  id: string
  loanId: string
  amount: string
  transactionHash: string
  timestamp: Date
  isOnTime: boolean
}

export interface Reward {
  id: string
  userId: string
  type: 'ontime_payment' | 'group_participation' | 'referral' | 'milestone'
  amount: string
  description: string
  timestamp: Date
  claimed: boolean
}

export interface Transaction {
  id: string
  userId: string
  type: 'contribution' | 'payout' | 'loan' | 'repayment' | 'reward' | 'transfer'
  amount: string
  fromAddress: string
  toAddress: string
  transactionHash: string
  timestamp: Date
  status: 'pending' | 'confirmed' | 'failed'
  description: string
}

export interface CashInOutRequest {
  id: string
  userId: string
  type: 'cash_in' | 'cash_out'
  amount: string
  method: 'mobile_money' | 'agent' | 'bank'
  phoneNumber?: string
  agentId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
}

export interface Agent {
  id: string
  name: string
  phoneNumber: string
  address: string
  location: {
    latitude: number
    longitude: number
  }
  isActive: boolean
  rating: number
  totalTransactions: number
}

export interface Notification {
  id: string
  userId: string
  type: 'contribution_due' | 'payout_ready' | 'loan_approved' | 'payment_due' | 'reward_earned'
  title: string
  message: string
  read: boolean
  timestamp: Date
  actionUrl?: string
}
