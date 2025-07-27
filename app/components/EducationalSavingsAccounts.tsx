// Phase 4: Educational Savings Accounts
// Comprehensive educational financing and savings solutions

'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Target, 
  Calendar, 
  DollarSign, 
  Users, 
  Award, 
  BookOpen, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Building,
  PlusCircle,
  Wallet,
  CreditCard,
  RefreshCw,
  Download
} from 'lucide-react';
import { useLanguage } from '../providers/LanguageProvider';
import { translations } from '../utils/translations';

export interface EducationalGoal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: EducationCategory;
  priority: 'high' | 'medium' | 'low';
  beneficiary: Beneficiary;
  contributionSchedule: ContributionSchedule;
  milestones: Milestone[];
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdDate: Date;
  autoSaveEnabled: boolean;
  autoSaveAmount: number;
  autoSaveFrequency: 'weekly' | 'monthly';
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: 'self' | 'child' | 'sibling' | 'spouse' | 'other';
  age: number;
  currentEducationLevel: string;
  targetEducationLevel: string;
  institution?: string;
  expectedGraduationDate?: Date;
}

export interface ContributionSchedule {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  amount: number;
  nextContributionDate: Date;
  totalContributions: number;
  missedContributions: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  targetDate: Date;
  achieved: boolean;
  achievedDate?: Date;
  reward?: string;
}

export interface EducationalInstitution {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'university' | 'vocational' | 'training';
  location: string;
  fees: InstitutionFees;
  programs: EducationalProgram[];
  scholarships: Scholarship[];
  paymentPlans: PaymentPlan[];
  partnershipStatus: 'partner' | 'verified' | 'unverified';
  rating: number;
  accreditation: string[];
}

export interface InstitutionFees {
  tuition: number;
  registration: number;
  accommodation?: number;
  meals?: number;
  books: number;
  miscellaneous: number;
  total: number;
  paymentPeriod: 'semester' | 'term' | 'annual';
}

export interface EducationalProgram {
  id: string;
  name: string;
  duration: number; // months
  fees: number;
  requirements: string[];
  outcomes: string[];
  employmentRate: number;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  type: 'full' | 'partial' | 'merit' | 'need-based';
  eligibilityRequirements: string[];
  applicationDeadline: Date;
  applicationUrl?: string;
  isActive: boolean;
}

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  installments: number;
  interestRate: number;
  gracePeriod: number; // days
  penaltyRate: number;
}

export interface EducationCategory {
  id: string;
  name: string;
  description: string;
  typicalCost: number;
  duration: number; // months
  ageRange: { min: number; max: number };
}

export interface SavingsInsight {
  projectedCompletion: Date;
  monthlyShortfall: number;
  recommendedAdjustment: number;
  onTrackPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Educational Savings Service
class EducationalSavingsService {
  private goals: Map<string, EducationalGoal> = new Map();
  private institutions: Map<string, EducationalInstitution> = new Map();
  private categories: EducationCategory[];

  constructor() {
    this.categories = this.initializeCategories();
    this.initializeInstitutions();
    this.initializeSampleGoals();
  }

  private initializeCategories(): EducationCategory[] {
    return [
      {
        id: 'primary',
        name: 'Primary Education',
        description: 'Basic elementary education',
        typicalCost: 2000,
        duration: 84, // 7 years
        ageRange: { min: 6, max: 13 }
      },
      {
        id: 'secondary',
        name: 'Secondary Education',
        description: 'High school education',
        typicalCost: 4000,
        duration: 48, // 4 years
        ageRange: { min: 14, max: 18 }
      },
      {
        id: 'university',
        name: 'University Education',
        description: 'Bachelor\'s degree programs',
        typicalCost: 15000,
        duration: 48, // 4 years
        ageRange: { min: 18, max: 25 }
      },
      {
        id: 'vocational',
        name: 'Vocational Training',
        description: 'Technical and professional skills training',
        typicalCost: 3000,
        duration: 18, // 1.5 years
        ageRange: { min: 16, max: 35 }
      },
      {
        id: 'professional',
        name: 'Professional Development',
        description: 'Continuing education and certifications',
        typicalCost: 1500,
        duration: 6, // 6 months
        ageRange: { min: 22, max: 65 }
      }
    ];
  }

  private initializeInstitutions(): void {
    const sampleInstitutions: EducationalInstitution[] = [
      {
        id: 'makerere_university',
        name: 'Makerere University',
        type: 'university',
        location: 'Kampala, Uganda',
        partnershipStatus: 'partner',
        rating: 4.5,
        accreditation: ['NCHE', 'IAU'],
        fees: {
          tuition: 3000,
          registration: 200,
          accommodation: 800,
          meals: 600,
          books: 300,
          miscellaneous: 400,
          total: 5300,
          paymentPeriod: 'semester'
        },
        programs: [
          {
            id: 'comp_sci',
            name: 'Computer Science',
            duration: 48,
            fees: 15000,
            requirements: ['Mathematics', 'Physics', 'Chemistry'],
            outcomes: ['Software Development', 'System Analysis', 'Project Management'],
            employmentRate: 85
          }
        ],
        scholarships: [
          {
            id: 'merit_scholarship',
            name: 'Merit-Based Scholarship',
            provider: 'University Foundation',
            amount: 2000,
            type: 'merit',
            eligibilityRequirements: ['GPA > 3.5', 'Financial need demonstration'],
            applicationDeadline: new Date('2025-03-15'),
            isActive: true
          }
        ],
        paymentPlans: [
          {
            id: 'installment_plan',
            name: 'Semester Installment Plan',
            description: 'Pay tuition in 3 installments per semester',
            installments: 3,
            interestRate: 2.5,
            gracePeriod: 7,
            penaltyRate: 1.0
          }
        ]
      },
      {
        id: 'kcca_technical',
        name: 'KCCA Technical Institute',
        type: 'vocational',
        location: 'Kampala, Uganda',
        partnershipStatus: 'verified',
        rating: 4.2,
        accreditation: ['BTVET'],
        fees: {
          tuition: 800,
          registration: 50,
          books: 100,
          miscellaneous: 150,
          total: 1100,
          paymentPeriod: 'term'
        },
        programs: [
          {
            id: 'auto_mechanics',
            name: 'Automotive Mechanics',
            duration: 18,
            fees: 3300,
            requirements: ['Secondary education'],
            outcomes: ['Vehicle Repair', 'Diagnostics', 'Business Management'],
            employmentRate: 78
          }
        ],
        scholarships: [
          {
            id: 'skills_scholarship',
            name: 'Skills Development Scholarship',
            provider: 'Ministry of Education',
            amount: 500,
            type: 'need-based',
            eligibilityRequirements: ['Household income < $200/month'],
            applicationDeadline: new Date('2025-01-30'),
            isActive: true
          }
        ],
        paymentPlans: [
          {
            id: 'monthly_plan',
            name: 'Monthly Payment Plan',
            description: 'Spread payments over the course duration',
            installments: 18,
            interestRate: 1.5,
            gracePeriod: 5,
            penaltyRate: 0.5
          }
        ]
      }
    ];

    sampleInstitutions.forEach(institution => {
      this.institutions.set(institution.id, institution);
    });
  }

  private initializeSampleGoals(): void {
    const sampleGoals: EducationalGoal[] = [
      {
        id: 'goal_1',
        name: 'Sarah\'s University Fund',
        description: 'Saving for daughter\'s university education',
        targetAmount: 15000,
        currentAmount: 3500,
        targetDate: new Date('2028-09-01'),
        category: this.categories.find(c => c.id === 'university')!,
        priority: 'high',
        status: 'active',
        createdDate: new Date('2024-01-15'),
        autoSaveEnabled: true,
        autoSaveAmount: 200,
        autoSaveFrequency: 'monthly',
        beneficiary: {
          id: 'beneficiary_1',
          name: 'Sarah Johnson',
          relationship: 'child',
          age: 15,
          currentEducationLevel: 'Secondary School',
          targetEducationLevel: 'University Degree',
          institution: 'Kampala Secondary School',
          expectedGraduationDate: new Date('2028-06-01')
        },
        contributionSchedule: {
          frequency: 'monthly',
          amount: 200,
          nextContributionDate: new Date('2024-08-01'),
          totalContributions: 18,
          missedContributions: 1
        },
        milestones: [
          {
            id: 'milestone_1',
            title: '25% Target Reached',
            description: 'First quarter of savings goal achieved',
            targetAmount: 3750,
            targetDate: new Date('2025-06-01'),
            achieved: false
          },
          {
            id: 'milestone_2',
            title: '50% Target Reached',
            description: 'Halfway to education fund goal',
            targetAmount: 7500,
            targetDate: new Date('2026-09-01'),
            achieved: false
          }
        ]
      },
      {
        id: 'goal_2',
        name: 'Vocational Training Fund',
        description: 'Personal skills development in automotive repair',
        targetAmount: 3300,
        currentAmount: 1200,
        targetDate: new Date('2025-03-01'),
        category: this.categories.find(c => c.id === 'vocational')!,
        priority: 'medium',
        status: 'active',
        createdDate: new Date('2024-06-01'),
        autoSaveEnabled: true,
        autoSaveAmount: 150,
        autoSaveFrequency: 'monthly',
        beneficiary: {
          id: 'beneficiary_2',
          name: 'John Mukasa',
          relationship: 'self',
          age: 22,
          currentEducationLevel: 'Secondary School Graduate',
          targetEducationLevel: 'Vocational Certificate'
        },
        contributionSchedule: {
          frequency: 'monthly',
          amount: 150,
          nextContributionDate: new Date('2024-08-01'),
          totalContributions: 8,
          missedContributions: 0
        },
        milestones: [
          {
            id: 'milestone_3',
            title: 'Course Registration',
            description: 'Enough savings to register for the course',
            targetAmount: 1650,
            targetDate: new Date('2024-12-01'),
            achieved: false
          }
        ]
      }
    ];

    sampleGoals.forEach(goal => {
      this.goals.set(goal.id, goal);
    });
  }

  // Create new educational goal
  async createGoal(goalData: Omit<EducationalGoal, 'id' | 'createdDate' | 'currentAmount' | 'milestones'>): Promise<EducationalGoal> {
    const goal: EducationalGoal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      createdDate: new Date(),
      currentAmount: 0,
      milestones: this.generateMilestones(goalData.targetAmount, goalData.targetDate)
    };

    this.goals.set(goal.id, goal);
    return goal;
  }

  // Generate milestone suggestions
  private generateMilestones(targetAmount: number, targetDate: Date): Milestone[] {
    const milestones: Milestone[] = [];
    const timeToTarget = targetDate.getTime() - Date.now();
    const monthsToTarget = Math.ceil(timeToTarget / (1000 * 60 * 60 * 24 * 30));

    // Create milestones at 25%, 50%, and 75% of target
    [25, 50, 75].forEach((percentage, index) => {
      const milestoneDate = new Date();
      milestoneDate.setMonth(milestoneDate.getMonth() + Math.floor((monthsToTarget * percentage) / 100));

      milestones.push({
        id: `milestone_${Date.now()}_${index}`,
        title: `${percentage}% Target Reached`,
        description: `${percentage}% of education savings goal achieved`,
        targetAmount: (targetAmount * percentage) / 100,
        targetDate: milestoneDate,
        achieved: false
      });
    });

    return milestones;
  }

  // Add contribution to goal
  async addContribution(goalId: string, amount: number): Promise<EducationalGoal> {
    const goal = this.goals.get(goalId);
    if (!goal) throw new Error('Goal not found');

    goal.currentAmount += amount;
    goal.contributionSchedule.totalContributions += 1;

    // Check if any milestones were achieved
    goal.milestones.forEach(milestone => {
      if (!milestone.achieved && goal.currentAmount >= milestone.targetAmount) {
        milestone.achieved = true;
        milestone.achievedDate = new Date();
      }
    });

    // Update goal status if target reached
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    return goal;
  }

  // Get savings insights for a goal
  getSavingsInsights(goalId: string): SavingsInsight {
    const goal = this.goals.get(goalId);
    if (!goal) throw new Error('Goal not found');

    const timeRemaining = goal.targetDate.getTime() - Date.now();
    const monthsRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24 * 30));
    const amountRemaining = goal.targetAmount - goal.currentAmount;
    const requiredMonthlyContribution = amountRemaining / monthsRemaining;
    const currentMonthlyContribution = goal.contributionSchedule.amount;
    const monthlyShortfall = Math.max(0, requiredMonthlyContribution - currentMonthlyContribution);

    const onTrackPercentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (monthlyShortfall > currentMonthlyContribution * 0.5) riskLevel = 'high';
    else if (monthlyShortfall > currentMonthlyContribution * 0.2) riskLevel = 'medium';

    const recommendations: string[] = [];
    if (monthlyShortfall > 0) {
      recommendations.push(`Increase monthly savings by $${monthlyShortfall.toFixed(2)}`);
    }
    if (goal.contributionSchedule.missedContributions > 2) {
      recommendations.push('Set up automatic savings to avoid missed contributions');
    }
    if (onTrackPercentage < 50 && monthsRemaining < 12) {
      recommendations.push('Consider scholarship opportunities to reduce funding needs');
    }

    const projectedCompletion = new Date();
    const projectedMonths = amountRemaining / currentMonthlyContribution;
    projectedCompletion.setMonth(projectedCompletion.getMonth() + projectedMonths);

    return {
      projectedCompletion,
      monthlyShortfall,
      recommendedAdjustment: monthlyShortfall,
      onTrackPercentage,
      riskLevel,
      recommendations
    };
  }

  // Search for scholarships
  searchScholarships(goalId: string): Scholarship[] {
    const goal = this.goals.get(goalId);
    if (!goal) return [];

    const allScholarships: Scholarship[] = [];
    Array.from(this.institutions.values()).forEach(institution => {
      allScholarships.push(...institution.scholarships.filter(s => s.isActive));
    });

    // Filter scholarships based on education category and beneficiary age
    return allScholarships.filter(scholarship => {
      // Basic filtering - in real implementation, would be more sophisticated
      return scholarship.isActive && scholarship.applicationDeadline > new Date();
    });
  }

  // Get all goals
  getAllGoals(): EducationalGoal[] {
    return Array.from(this.goals.values());
  }

  // Get goal by ID
  getGoal(id: string): EducationalGoal | undefined {
    return this.goals.get(id);
  }

  // Get all institutions
  getAllInstitutions(): EducationalInstitution[] {
    return Array.from(this.institutions.values());
  }

  // Get all categories
  getCategories(): EducationCategory[] {
    return this.categories;
  }

  // Calculate total savings across all goals
  getTotalSavings(): number {
    return Array.from(this.goals.values()).reduce((total, goal) => total + goal.currentAmount, 0);
  }

  // Get upcoming milestones
  getUpcomingMilestones(): { goal: EducationalGoal; milestone: Milestone }[] {
    const upcoming: { goal: EducationalGoal; milestone: Milestone }[] = [];
    
    Array.from(this.goals.values()).forEach(goal => {
      goal.milestones.forEach(milestone => {
        if (!milestone.achieved && milestone.targetDate > new Date()) {
          upcoming.push({ goal, milestone });
        }
      });
    });

    return upcoming.sort((a, b) => a.milestone.targetDate.getTime() - b.milestone.targetDate.getTime());
  }
}

// Export singleton instance
export const educationalSavingsService = new EducationalSavingsService();

// Main Educational Savings Component
export default function EducationalSavingsAccounts() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'institutions' | 'scholarships' | 'insights'>('overview');
  const [goals, setGoals] = useState<EducationalGoal[]>([]);
  const [institutions, setInstitutions] = useState<EducationalInstitution[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setGoals(educationalSavingsService.getAllGoals());
      setInstitutions(educationalSavingsService.getAllInstitutions());
      
      // Load scholarships for all goals
      const allScholarships: Scholarship[] = [];
      goals.forEach(goal => {
        allScholarships.push(...educationalSavingsService.searchScholarships(goal.id));
      });
      setScholarships(allScholarships);
    } catch (error) {
      console.error('Error loading educational savings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (goalId: string, amount: number) => {
    try {
      await educationalSavingsService.addContribution(goalId, amount);
      loadData();
    } catch (error) {
      console.error('Error adding contribution:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Educational Savings Accounts</h1>
              <p className="text-gray-600">Save systematically for education goals and dreams</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateGoal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'goals', label: 'Savings Goals', icon: Wallet },
            { id: 'institutions', label: 'Institutions', icon: Building },
            { id: 'scholarships', label: 'Scholarships', icon: Award },
            { id: 'insights', label: 'Insights', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <EducationOverview goals={goals} />
            )}
            
            {activeTab === 'goals' && (
              <SavingsGoals goals={goals} onAddContribution={handleAddContribution} />
            )}
            
            {activeTab === 'institutions' && (
              <EducationalInstitutions institutions={institutions} />
            )}
            
            {activeTab === 'scholarships' && (
              <ScholarshipOpportunities scholarships={scholarships} />
            )}
            
            {activeTab === 'insights' && (
              <EducationInsights goals={goals} />
            )}
          </>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <CreateGoalModal
          onClose={() => setShowCreateGoal(false)}
          onCreateGoal={() => {
            setShowCreateGoal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Education Overview Component
function EducationOverview({ goals }: { goals: EducationalGoal[] }) {
  const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTargets = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const upcomingMilestones = educationalSavingsService.getUpcomingMilestones();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Savings</p>
              <p className="text-2xl font-bold">${totalSavings.toLocaleString()}</p>
            </div>
            <Wallet className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Goals</p>
              <p className="text-2xl font-bold">{goals.filter(g => g.status === 'active').length}</p>
            </div>
            <Target className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Completed Goals</p>
              <p className="text-2xl font-bold">{completedGoals}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Progress</p>
              <p className="text-2xl font-bold">{totalTargets > 0 ? ((totalSavings / totalTargets) * 100).toFixed(1) : 0}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Recent Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Goals</h3>
          <div className="space-y-4">
            {goals.slice(0, 3).map(goal => (
              <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{goal.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    goal.status === 'active' ? 'bg-green-100 text-green-800' :
                    goal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">
                      ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Target: {goal.targetDate.toLocaleDateString()}</span>
                    <span>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Milestones</h3>
          <div className="space-y-4">
            {upcomingMilestones.slice(0, 3).map(({ goal, milestone }) => (
              <div key={milestone.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                    <p className="text-sm text-gray-600">{goal.name}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>Target: ${milestone.targetAmount.toLocaleString()}</span>
                      <span>Due: {milestone.targetDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Savings Goals Component
function SavingsGoals({ 
  goals, 
  onAddContribution 
}: {
  goals: EducationalGoal[];
  onAddContribution: (goalId: string, amount: number) => void;
}) {
  const [contributionAmount, setContributionAmount] = useState<{ [key: string]: string }>({});

  const handleContribution = (goalId: string) => {
    const amount = parseFloat(contributionAmount[goalId] || '0');
    if (amount > 0) {
      onAddContribution(goalId, amount);
      setContributionAmount({ ...contributionAmount, [goalId]: '' });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Your Education Savings Goals</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map(goal => {
          const insights = educationalSavingsService.getSavingsInsights(goal.id);
          
          return (
            <div key={goal.id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{goal.name}</h4>
                  <p className="text-sm text-gray-600">{goal.beneficiary.name} • {goal.category.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  insights.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                  insights.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {insights.riskLevel.toUpperCase()} RISK
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        insights.riskLevel === 'low' ? 'bg-green-500' :
                        insights.riskLevel === 'medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, insights.onTrackPercentage)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Target: {goal.targetDate.toLocaleDateString()}</span>
                    <span>{insights.onTrackPercentage.toFixed(1)}%</span>
                  </div>
                </div>

                {insights.monthlyShortfall > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Increase monthly savings by ${insights.monthlyShortfall.toFixed(2)} to stay on track
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Monthly Contribution:</span>
                    <p className="font-medium">${goal.contributionSchedule.amount}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Contribution:</span>
                    <p className="font-medium">{goal.contributionSchedule.nextContributionDate.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={contributionAmount[goal.id] || ''}
                    onChange={(e) => setContributionAmount({ 
                      ...contributionAmount, 
                      [goal.id]: e.target.value 
                    })}
                    placeholder="Contribution amount"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    min="0"
                    step="0.01"
                  />
                  <button
                    onClick={() => handleContribution(goal.id)}
                    disabled={!contributionAmount[goal.id] || parseFloat(contributionAmount[goal.id]) <= 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Educational Institutions Component
function EducationalInstitutions({ institutions }: { institutions: EducationalInstitution[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Partner Educational Institutions</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {institutions.map(institution => (
          <div key={institution.id} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{institution.name}</h4>
                <p className="text-sm text-gray-600">{institution.location}</p>
              </div>
              <div className="flex items-center space-x-2">
                {institution.partnershipStatus === 'partner' && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Partner
                  </span>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{institution.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="font-medium capitalize">{institution.type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tuition (per {institution.fees.paymentPeriod}):</span>
                  <p className="font-medium">${institution.fees.tuition.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <span className="text-gray-600 text-sm">Programs:</span>
                <div className="mt-1">
                  {institution.programs.slice(0, 2).map(program => (
                    <div key={program.id} className="text-sm">
                      <span className="font-medium">{program.name}</span>
                      <span className="text-gray-500"> • {program.duration} months • ${program.fees.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm text-green-600">
                  {institution.scholarships.filter(s => s.isActive).length} scholarships available
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Scholarship Opportunities Component
function ScholarshipOpportunities({ scholarships }: { scholarships: Scholarship[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Available Scholarships</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scholarships.map(scholarship => (
          <div key={scholarship.id} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{scholarship.name}</h4>
                <p className="text-sm text-gray-600">{scholarship.provider}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                scholarship.type === 'full' ? 'bg-green-100 text-green-800' :
                scholarship.type === 'merit' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {scholarship.type.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <p className="font-medium text-green-600">${scholarship.amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Deadline:</span>
                  <p className="font-medium">{scholarship.applicationDeadline.toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <span className="text-gray-600 text-sm">Requirements:</span>
                <ul className="mt-1 text-sm text-gray-700">
                  {scholarship.eligibilityRequirements.slice(0, 2).map((req, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{req}</span>
                    </li>
                  ))}
                  {scholarship.eligibilityRequirements.length > 2 && (
                    <li className="text-gray-500">+{scholarship.eligibilityRequirements.length - 2} more</li>
                  )}
                </ul>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {Math.ceil((scholarship.applicationDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                  </span>
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Education Insights Component
function EducationInsights({ goals }: { goals: EducationalGoal[] }) {
  const insights = goals.map(goal => ({
    goal,
    insights: educationalSavingsService.getSavingsInsights(goal.id)
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Savings Insights & Recommendations</h3>
      
      <div className="space-y-6">
        {insights.map(({ goal, insights }) => (
          <div key={goal.id} className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">{goal.name}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{insights.onTrackPercentage.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">On Track</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${insights.monthlyShortfall.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Monthly Shortfall</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {insights.projectedCompletion.toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Projected Completion</p>
              </div>
            </div>
            
            {insights.recommendations.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Recommendations:</h5>
                <ul className="space-y-1">
                  {insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Create Goal Modal Component
function CreateGoalModal({ 
  onClose, 
  onCreateGoal 
}: {
  onClose: () => void;
  onCreateGoal: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    categoryId: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    beneficiaryName: '',
    beneficiaryAge: '',
    beneficiaryRelationship: 'child' as 'self' | 'child' | 'sibling' | 'spouse' | 'other',
    autoSaveEnabled: false,
    autoSaveAmount: '',
    autoSaveFrequency: 'monthly' as 'weekly' | 'monthly'
  });

  const categories = educationalSavingsService.getCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedCategory = categories.find(c => c.id === formData.categoryId);
      if (!selectedCategory) return;

      const goalData = {
        name: formData.name,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: new Date(formData.targetDate),
        category: selectedCategory,
        priority: formData.priority,
        status: 'active' as const,
        autoSaveEnabled: formData.autoSaveEnabled,
        autoSaveAmount: parseFloat(formData.autoSaveAmount) || 0,
        autoSaveFrequency: formData.autoSaveFrequency,
        beneficiary: {
          id: `beneficiary_${Date.now()}`,
          name: formData.beneficiaryName,
          relationship: formData.beneficiaryRelationship,
          age: parseInt(formData.beneficiaryAge),
          currentEducationLevel: '',
          targetEducationLevel: selectedCategory.name
        },
        contributionSchedule: {
          frequency: formData.autoSaveFrequency,
          amount: parseFloat(formData.autoSaveAmount) || 0,
          nextContributionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          totalContributions: 0,
          missedContributions: 0
        }
      };

      await educationalSavingsService.createGoal(goalData);
      onCreateGoal();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Education Savings Goal</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount ($)
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select category...</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} (Typical: ${category.typicalCost.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiary Name
              </label>
              <input
                type="text"
                value={formData.beneficiaryName}
                onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.beneficiaryAge}
                onChange={(e) => setFormData({ ...formData, beneficiaryAge: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
                max="100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              value={formData.beneficiaryRelationship}
              onChange={(e) => setFormData({ ...formData, beneficiaryRelationship: e.target.value as any })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="self">Self</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="spouse">Spouse</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="autoSave"
                checked={formData.autoSaveEnabled}
                onChange={(e) => setFormData({ ...formData, autoSaveEnabled: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="autoSave" className="text-sm font-medium text-gray-700">
                Enable automatic savings
              </label>
            </div>

            {formData.autoSaveEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={formData.autoSaveAmount}
                    onChange={(e) => setFormData({ ...formData, autoSaveAmount: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={formData.autoSaveFrequency}
                    onChange={(e) => setFormData({ ...formData, autoSaveFrequency: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            )}
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
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
