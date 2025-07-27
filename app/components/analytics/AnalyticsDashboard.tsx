/**
 * Comprehensive Analytics Dashboard Component
 * Provides detailed insights for users and group administrators
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, 
  CreditCard, Target, AlertTriangle, CheckCircle,
  Calendar, Filter, Download, Share2
} from 'lucide-react';

interface AnalyticsData {
  financialHealth: FinancialHealthMetrics;
  spendingPatterns: SpendingPattern[];
  groupPerformance: GroupPerformanceMetrics;
  predictiveInsights: PredictiveInsight[];
  transactionHistory: TransactionAnalytics[];
  savingsGoals: SavingsGoalProgress[];
}

interface FinancialHealthMetrics {
  healthScore: number; // 0-100
  creditScore: number; // 300-850
  savingsRate: number; // Percentage
  debtToIncomeRatio: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFundMonths: number;
  trends: {
    healthScoreChange: number;
    savingsGrowth: number;
    expenseChange: number;
  };
}

interface SpendingPattern {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  transactions: number;
}

interface GroupPerformanceMetrics {
  groupId: string;
  groupName: string;
  totalMembers: number;
  activeMembers: number;
  totalSavings: number;
  averageContribution: number;
  loanRepaymentRate: number;
  groupHealthScore: number;
  monthlyGrowth: number;
  topPerformers: GroupMember[];
}

interface GroupMember {
  id: string;
  name: string;
  contributionAmount: number;
  consistencyScore: number;
  role: string;
}

interface PredictiveInsight {
  type: 'savings' | 'spending' | 'income' | 'debt';
  title: string;
  description: string;
  prediction: number;
  confidence: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

interface TransactionAnalytics {
  date: string;
  income: number;
  expenses: number;
  savings: number;
  loans: number;
  repayments: number;
}

interface SavingsGoalProgress {
  goalId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  progress: number;
  projectedCompletion: string;
  onTrack: boolean;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'predictions'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockData: AnalyticsData = {
        financialHealth: {
          healthScore: 78,
          creditScore: 685,
          savingsRate: 15.5,
          debtToIncomeRatio: 0.25,
          monthlyIncome: 800000,
          monthlyExpenses: 620000,
          emergencyFundMonths: 2.3,
          trends: {
            healthScoreChange: 5.2,
            savingsGrowth: 12.8,
            expenseChange: -3.5
          }
        },
        spendingPatterns: [
          { category: 'Food & Groceries', amount: 250000, percentage: 40.3, trend: 'up', trendPercentage: 5.2, transactions: 45 },
          { category: 'Transportation', amount: 120000, percentage: 19.4, trend: 'stable', trendPercentage: 0.8, transactions: 20 },
          { category: 'Healthcare', amount: 80000, percentage: 12.9, trend: 'down', trendPercentage: -8.1, transactions: 8 },
          { category: 'Education', amount: 70000, percentage: 11.3, trend: 'up', trendPercentage: 15.3, transactions: 5 },
          { category: 'Utilities', amount: 60000, percentage: 9.7, trend: 'stable', trendPercentage: 2.1, transactions: 12 },
          { category: 'Others', amount: 40000, percentage: 6.4, trend: 'down', trendPercentage: -12.5, transactions: 18 }
        ],
        groupPerformance: {
          groupId: 'group-001',
          groupName: 'Village Farmers Cooperative',
          totalMembers: 25,
          activeMembers: 23,
          totalSavings: 15000000,
          averageContribution: 120000,
          loanRepaymentRate: 94.5,
          groupHealthScore: 82,
          monthlyGrowth: 8.7,
          topPerformers: [
            { id: '1', name: 'Sarah Nakato', contributionAmount: 200000, consistencyScore: 98, role: 'Leader' },
            { id: '2', name: 'John Mukasa', contributionAmount: 180000, consistencyScore: 95, role: 'Treasurer' },
            { id: '3', name: 'Mary Namuli', contributionAmount: 175000, consistencyScore: 92, role: 'Member' }
          ]
        },
        predictiveInsights: [
          {
            type: 'savings',
            title: 'Savings Goal Achievement',
            description: 'You\'re on track to exceed your annual savings goal by 15%',
            prediction: 2300000,
            confidence: 87,
            recommendation: 'Consider increasing your goal or exploring investment options',
            priority: 'medium'
          },
          {
            type: 'spending',
            title: 'Food Budget Alert',
            description: 'Food expenses are trending 15% above your budget',
            prediction: 287500,
            confidence: 92,
            recommendation: 'Review food expenses and consider bulk buying to reduce costs',
            priority: 'high'
          }
        ],
        transactionHistory: [
          { date: '2025-01', income: 800000, expenses: 620000, savings: 120000, loans: 0, repayments: 60000 },
          { date: '2025-02', income: 850000, expenses: 640000, savings: 130000, loans: 200000, repayments: 80000 },
          { date: '2025-03', income: 820000, expenses: 600000, savings: 140000, loans: 0, repayments: 80000 },
          { date: '2025-04', income: 900000, expenses: 650000, savings: 150000, loans: 0, repayments: 100000 },
          { date: '2025-05', income: 880000, expenses: 630000, savings: 160000, loans: 0, repayments: 90000 },
          { date: '2025-06', income: 920000, expenses: 640000, savings: 170000, loans: 300000, repayments: 110000 }
        ],
        savingsGoals: [
          {
            goalId: 'goal-1',
            title: 'Emergency Fund',
            targetAmount: 2400000,
            currentAmount: 1800000,
            deadline: '2025-12-31',
            progress: 75,
            projectedCompletion: '2025-11-15',
            onTrack: true
          },
          {
            goalId: 'goal-2',
            title: 'Business Expansion',
            targetAmount: 5000000,
            currentAmount: 2100000,
            deadline: '2026-06-30',
            progress: 42,
            projectedCompletion: '2026-08-20',
            onTrack: false
          }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const exportData = async (format: 'pdf' | 'excel') => {
    // Implementation for data export
    console.log(`Exporting analytics data as ${format}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive financial insights and projections</p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            {(['overview', 'detailed', 'predictions'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-4 py-2 text-sm capitalize ${
                  selectedView === view
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => exportData('excel')}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">Export</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Financial Health Score</p>
              <p className={`text-3xl font-bold ${getHealthScoreColor(analyticsData.financialHealth.healthScore)}`}>
                {analyticsData.financialHealth.healthScore}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+{analyticsData.financialHealth.trends.healthScoreChange}%</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Credit Score</p>
              <p className="text-3xl font-bold text-blue-600">{analyticsData.financialHealth.creditScore}</p>
              <p className="text-sm text-gray-500">Good</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Savings Rate</p>
              <p className="text-3xl font-bold text-green-600">{analyticsData.financialHealth.savingsRate}%</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+{analyticsData.financialHealth.trends.savingsGrowth}%</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emergency Fund</p>
              <p className="text-3xl font-bold text-orange-600">{analyticsData.financialHealth.emergencyFundMonths}</p>
              <p className="text-sm text-gray-500">months</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {selectedView === 'overview' && (
        <>
          {/* Transaction Trends */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.transactionHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="savings" stackId="3" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Spending Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.spendingPatterns}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                  >
                    {analyticsData.spendingPatterns.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Trends</h3>
              <div className="space-y-4">
                {analyticsData.spendingPatterns.slice(0, 5).map((pattern, index) => (
                  <div key={pattern.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900">{pattern.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{formatCurrency(pattern.amount)}</span>
                      {getTrendIcon(pattern.trend)}
                      <span className={`text-sm ${
                        pattern.trend === 'up' ? 'text-red-600' : 
                        pattern.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {pattern.trend === 'up' ? '+' : pattern.trend === 'down' ? '-' : ''}
                        {Math.abs(pattern.trendPercentage)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Savings Goals Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Savings Goals Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analyticsData.savingsGoals.map((goal) => (
                <div key={goal.goalId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      goal.onTrack ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {goal.onTrack ? 'On Track' : 'Behind'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${goal.onTrack ? 'bg-green-600' : 'bg-yellow-600'}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Projected completion: {goal.projectedCompletion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedView === 'predictions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analyticsData.predictiveInsights.map((insight, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    insight.priority === 'high' ? 'bg-red-100' :
                    insight.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      insight.priority === 'high' ? 'text-red-600' :
                      insight.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                  insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {insight.priority.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Confidence Level</span>
                    <span className="font-medium">{insight.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">Recommendation:</p>
                  <p className="text-sm text-gray-700">{insight.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
