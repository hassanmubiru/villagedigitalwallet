// Phase 4: Community Governance
// Democratic decision-making for financial groups using blockchain voting and governance tokens

'use client';

import React, { useState, useEffect } from 'react';
import { Users, Vote, ShieldCheck, Coins, BarChart2, CheckCircle, XCircle, Clock, Star, PlusCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../providers/LanguageProvider';
import { translations } from '../utils/translations';

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdDate: Date;
  status: 'open' | 'closed' | 'executed' | 'rejected';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  deadline: Date;
  groupId: string;
  executionDetails?: string;
}

export interface GovernanceGroup {
  id: string;
  name: string;
  members: GovernanceMember[];
  governanceTokenSupply: number;
  proposals: GovernanceProposal[];
  rules: string[];
  createdDate: Date;
}

export interface GovernanceMember {
  id: string;
  name: string;
  walletAddress: string;
  tokens: number;
  joinedDate: Date;
  role: 'admin' | 'member';
}

// Governance Service
class CommunityGovernanceService {
  private groups: Map<string, GovernanceGroup> = new Map();

  constructor() {
    this.initializeSampleGroups();
  }

  private initializeSampleGroups() {
    const sampleGroup: GovernanceGroup = {
      id: 'group_1',
      name: 'Village Savings Group',
      members: [
        { id: 'm1', name: 'Alice', walletAddress: '0xabc...', tokens: 100, joinedDate: new Date('2024-01-01'), role: 'admin' },
        { id: 'm2', name: 'Bob', walletAddress: '0xdef...', tokens: 80, joinedDate: new Date('2024-02-01'), role: 'member' },
        { id: 'm3', name: 'Carol', walletAddress: '0x123...', tokens: 60, joinedDate: new Date('2024-03-01'), role: 'member' }
      ],
      governanceTokenSupply: 240,
      proposals: [
        {
          id: 'proposal_1',
          title: 'Increase Savings Rate',
          description: 'Proposal to increase monthly savings rate by 10%',
          createdBy: 'Alice',
          createdDate: new Date('2025-07-01'),
          status: 'open',
          votesFor: 2,
          votesAgainst: 1,
          votesAbstain: 0,
          deadline: new Date('2025-07-31'),
          groupId: 'group_1'
        }
      ],
      rules: [
        'Majority vote required for financial decisions',
        'Proposals must be open for at least 7 days',
        'Each token equals one vote'
      ],
      createdDate: new Date('2024-01-01')
    };
    this.groups.set(sampleGroup.id, sampleGroup);
  }

  getGroups(): GovernanceGroup[] {
    return Array.from(this.groups.values());
  }

  getGroup(id: string): GovernanceGroup | undefined {
    return this.groups.get(id);
  }

  getProposals(groupId: string): GovernanceProposal[] {
    const group = this.groups.get(groupId);
    return group ? group.proposals : [];
  }

  createProposal(groupId: string, proposalData: Omit<GovernanceProposal, 'id' | 'createdDate' | 'status' | 'votesFor' | 'votesAgainst' | 'votesAbstain'>): GovernanceProposal {
    const group = this.groups.get(groupId);
    if (!group) throw new Error('Group not found');
    const proposal: GovernanceProposal = {
      ...proposalData,
      id: `proposal_${Date.now()}`,
      createdDate: new Date(),
      status: 'open',
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0
    };
    group.proposals.push(proposal);
    return proposal;
  }

  voteOnProposal(groupId: string, proposalId: string, memberId: string, vote: 'for' | 'against' | 'abstain'): GovernanceProposal {
    const group = this.groups.get(groupId);
    if (!group) throw new Error('Group not found');
    const proposal = group.proposals.find(p => p.id === proposalId);
    if (!proposal) throw new Error('Proposal not found');
    switch (vote) {
      case 'for': proposal.votesFor += 1; break;
      case 'against': proposal.votesAgainst += 1; break;
      case 'abstain': proposal.votesAbstain += 1; break;
    }
    return proposal;
  }

  closeProposal(groupId: string, proposalId: string): GovernanceProposal {
    const group = this.groups.get(groupId);
    if (!group) throw new Error('Group not found');
    const proposal = group.proposals.find(p => p.id === proposalId);
    if (!proposal) throw new Error('Proposal not found');
    proposal.status = 'closed';
    return proposal;
  }
}

export const communityGovernanceService = new CommunityGovernanceService();

export default function CommunityGovernance() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'groups' | 'proposals' | 'rules'>('groups');
  const [groups, setGroups] = useState<GovernanceGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('group_1');
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateProposal, setShowCreateProposal] = useState(false);

  useEffect(() => {
    setGroups(communityGovernanceService.getGroups());
    setProposals(communityGovernanceService.getProposals(selectedGroupId));
  }, [selectedGroupId]);

  const handleCreateProposal = (title: string, description: string, deadline: Date) => {
    communityGovernanceService.createProposal(selectedGroupId, {
      title,
      description,
      createdBy: 'Alice',
      deadline,
      groupId: selectedGroupId
    });
    setProposals(communityGovernanceService.getProposals(selectedGroupId));
    setShowCreateProposal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Governance</h1>
              <p className="text-gray-600">Democratic decision-making for financial groups</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateProposal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Proposal</span>
          </button>
        </div>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'groups', label: 'Groups', icon: Users },
            { id: 'proposals', label: 'Proposals', icon: Vote },
            { id: 'rules', label: 'Rules', icon: ShieldCheck }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            {activeTab === 'groups' && (
              <GovernanceGroups groups={groups} selectedGroupId={selectedGroupId} setSelectedGroupId={setSelectedGroupId} />
            )}
            {activeTab === 'proposals' && (
              <GovernanceProposals proposals={proposals} />
            )}
            {activeTab === 'rules' && (
              <GovernanceRules group={groups.find(g => g.id === selectedGroupId)} />
            )}
          </>
        )}
      </div>
      {showCreateProposal && (
        <CreateProposalModal
          onClose={() => setShowCreateProposal(false)}
          onCreate={handleCreateProposal}
        />
      )}
    </div>
  );
}

function GovernanceGroups({ groups, selectedGroupId, setSelectedGroupId }: {
  groups: GovernanceGroup[];
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Governance Groups</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map(group => (
          <div key={group.id} className={`bg-gray-50 rounded-lg p-6 border ${selectedGroupId === group.id ? 'border-green-500' : 'border-gray-200'}`}
            onClick={() => setSelectedGroupId(group.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{group.name}</h4>
                <p className="text-sm text-gray-600">{group.members.length} members</p>
              </div>
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-600">{group.governanceTokenSupply} tokens</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-gray-500">Created {group.createdDate.toLocaleDateString()}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {group.rules.map((rule, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GovernanceProposals({ proposals }: { proposals: GovernanceProposal[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Proposals</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {proposals.map(proposal => (
          <div key={proposal.id} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{proposal.title}</h4>
                <p className="text-sm text-gray-600">By {proposal.createdBy}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                proposal.status === 'open' ? 'bg-green-100 text-green-800' :
                proposal.status === 'executed' ? 'bg-blue-100 text-blue-800' :
                proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 text-sm">{proposal.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                <span>Deadline: {proposal.deadline.toLocaleDateString()}</span>
                <span>Votes: {proposal.votesFor} For, {proposal.votesAgainst} Against, {proposal.votesAbstain} Abstain</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GovernanceRules({ group }: { group?: GovernanceGroup }) {
  if (!group) return null;
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Group Rules</h3>
      <ul className="space-y-2">
        {group.rules.map((rule, idx) => (
          <li key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreateProposalModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (title: string, description: string, deadline: Date) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.deadline) return;
    onCreate(formData.title, formData.description, new Date(formData.deadline));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Governance Proposal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Create Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
