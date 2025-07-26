'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../providers/LanguageProvider'
import { useActiveAccount } from 'thirdweb/react'
import { 
  Users, 
  Plus, 
  Calendar, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  UserPlus
} from 'lucide-react'
import { SavingsGroup, GroupMember } from '../types'

export default function SavingsGroups() {
  const { t } = useLanguage()
  const account = useActiveAccount()
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover' | 'create'>('my-groups')
  const [selectedGroup, setSelectedGroup] = useState<SavingsGroup | null>(null)

  // Mock data - replace with real data from blockchain/backend
  const [myGroups] = useState<SavingsGroup[]>([
    {
      id: '1',
      name: 'Village Farmers Group',
      description: 'Supporting local agriculture through collective savings',
      members: [],
      adminId: account?.address || '',
      totalSavings: '2500.00',
      contributionAmount: '50.00',
      contributionFrequency: 'monthly',
      payoutOrder: [],
      currentRound: 3,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      nextPayoutDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Women\'s Savings Circle',
      description: 'Empowering women through financial independence',
      members: [],
      adminId: 'other-admin',
      totalSavings: '1800.00',
      contributionAmount: '30.00',
      contributionFrequency: 'weekly',
      payoutOrder: [],
      currentRound: 12,
      isActive: true,
      createdAt: new Date('2023-11-20'),
      nextPayoutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }
  ])

  const [availableGroups] = useState<SavingsGroup[]>([
    {
      id: '3',
      name: 'Youth Business Network',
      description: 'Young entrepreneurs supporting each other',
      members: [],
      adminId: 'youth-admin',
      totalSavings: '800.00',
      contributionAmount: '25.00',
      contributionFrequency: 'weekly',
      payoutOrder: [],
      currentRound: 5,
      isActive: true,
      createdAt: new Date('2024-02-01'),
      nextPayoutDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      name: 'Micro-traders Collective',
      description: 'Small business owners pooling resources',
      members: [],
      adminId: 'trader-admin',
      totalSavings: '1200.00',
      contributionAmount: '40.00',
      contributionFrequency: 'monthly',
      payoutOrder: [],
      currentRound: 2,
      isActive: true,
      createdAt: new Date('2024-03-10'),
      nextPayoutDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    }
  ])

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    contributionFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly'
  })

  const handleCreateGroup = async () => {
    // In a real app, this would interact with smart contracts
    console.log('Creating group:', newGroup)
    // Reset form
    setNewGroup({
      name: '',
      description: '',
      contributionAmount: '',
      contributionFrequency: 'monthly'
    })
    setActiveTab('my-groups')
  }

  const handleJoinGroup = async (groupId: string) => {
    // In a real app, this would interact with smart contracts
    console.log('Joining group:', groupId)
  }

  const handleContribution = async (groupId: string, amount: string) => {
    // In a real app, this would trigger a blockchain transaction
    console.log('Making contribution:', { groupId, amount })
  }

  const MyGroupsTab = () => (
    <div className="space-y-6">
      {myGroups.map((group) => (
        <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              {group.adminId === account?.address && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Admin
                </span>
              )}
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{group.totalSavings}</div>
              <div className="text-sm text-gray-600">Total Savings (CELO)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{group.contributionAmount}</div>
              <div className="text-sm text-gray-600">Contribution (CELO)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{group.currentRound}</div>
              <div className="text-sm text-gray-600">Current Round</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {group.nextPayoutDate.toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">Next Payout</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleContribution(group.id, group.contributionAmount)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              Make Contribution
            </button>
            <button
              onClick={() => setSelectedGroup(group)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              View Details
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </div>
        </div>
      ))}

      {myGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Yet</h3>
          <p className="text-gray-600 mb-6">Join or create a savings group to get started</p>
          <button
            onClick={() => setActiveTab('discover')}
            className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Discover Groups
          </button>
        </div>
      )}
    </div>
  )

  const DiscoverTab = () => (
    <div className="space-y-6">
      {availableGroups.map((group) => (
        <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">4.8</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{group.contributionAmount} CELO</div>
              <div className="text-sm text-gray-600">Contribution</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 capitalize">{group.contributionFrequency}</div>
              <div className="text-sm text-gray-600">Frequency</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Members</div>
            </div>
          </div>

          <button
            onClick={() => handleJoinGroup(group.id)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Join Group
          </button>
        </div>
      ))}
    </div>
  )

  const CreateTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New Savings Group</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Name
          </label>
          <input
            type="text"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter group name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Describe the purpose of your group"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contribution Amount (CELO)
          </label>
          <input
            type="number"
            step="0.01"
            value={newGroup.contributionAmount}
            onChange={(e) => setNewGroup({ ...newGroup, contributionAmount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contribution Frequency
          </label>
          <select
            value={newGroup.contributionFrequency}
            onChange={(e) => setNewGroup({ ...newGroup, contributionFrequency: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
          </select>
        </div>

        <button
          onClick={handleCreateGroup}
          disabled={!newGroup.name || !newGroup.contributionAmount}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Group
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Savings Groups</h1>
          <p className="text-gray-600">
            Join community savings groups or create your own to achieve financial goals together
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my-groups'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Groups
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'discover'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create New
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'my-groups' && <MyGroupsTab />}
        {activeTab === 'discover' && <DiscoverTab />}
        {activeTab === 'create' && <CreateTab />}
      </div>
    </div>
  )
}
