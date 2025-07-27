// Carbon Credit Service
// This service handles interactions with carbon credit marketplaces

import { v4 as uuidv4 } from 'uuid';

// Types
export interface CarbonProject {
  id: string;
  name: string;
  description: string;
  location: string;
  projectType: 'reforestation' | 'conservation' | 'renewable' | 'methane' | 'other';
  totalCredits: number;
  availableCredits: number;
  pricePerCredit: number;
  currency: string;
  carbonReduction: number; // in tons of CO2
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'pending';
  verificationStandard: string; // e.g., "Gold Standard", "Verra VCS"
  images: string[];
  organizationId: string;
  organization: {
    name: string;
    logo: string;
    website: string;
  };
}

export interface CarbonCredit {
  id: string;
  projectId: string;
  userId: string;
  amount: number; // number of carbon credits
  totalCost: number;
  transactionDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
  certificateId?: string;
  blockchainTxHash?: string;
}

export interface CarbonFootprint {
  id: string;
  userId: string;
  calculationDate: Date;
  transportEmissions: number;
  energyEmissions: number;
  foodEmissions: number;
  goodsEmissions: number;
  totalEmissions: number; // in tons of CO2
  offsetCredits: number;
  remainingFootprint: number;
}

class CarbonCreditService {
  private projects: CarbonProject[] = [];
  private userCredits: Record<string, CarbonCredit[]> = {};
  private userFootprints: Record<string, CarbonFootprint[]> = {};

  constructor() {
    this.initializeMockData();
  }

  // Initialize with sample data for development
  private initializeMockData() {
    // Sample carbon projects
    this.projects = [
      {
        id: uuidv4(),
        name: "East African Reforestation Initiative",
        description: "Large-scale tree planting project in Uganda and Kenya to restore degraded landscapes.",
        location: "Uganda/Kenya",
        projectType: "reforestation",
        totalCredits: 10000,
        availableCredits: 8750,
        pricePerCredit: 12,
        currency: "CUSD",
        carbonReduction: 10000,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2028-01-01'),
        status: "active",
        verificationStandard: "Gold Standard",
        images: [
          "/images/carbon/reforestation-1.jpg",
          "/images/carbon/reforestation-2.jpg"
        ],
        organizationId: "org123",
        organization: {
          name: "GreenEarth Alliance",
          logo: "/images/orgs/greenearth-logo.png",
          website: "https://greenearth-alliance.org"
        }
      },
      {
        id: uuidv4(),
        name: "Solar Power for Rural Communities",
        description: "Installing solar panels in off-grid villages to replace diesel generators.",
        location: "Tanzania",
        projectType: "renewable",
        totalCredits: 5000,
        availableCredits: 3200,
        pricePerCredit: 15,
        currency: "CUSD",
        carbonReduction: 5000,
        startDate: new Date('2024-03-15'),
        endDate: new Date('2029-03-15'),
        status: "active",
        verificationStandard: "Verra VCS",
        images: [
          "/images/carbon/solar-1.jpg",
          "/images/carbon/solar-2.jpg"
        ],
        organizationId: "org456",
        organization: {
          name: "SolarFuture",
          logo: "/images/orgs/solar-future-logo.png",
          website: "https://solarfuture.net"
        }
      },
      {
        id: uuidv4(),
        name: "Mangrove Conservation Project",
        description: "Protection and restoration of mangrove forests along coastal areas.",
        location: "Mozambique",
        projectType: "conservation",
        totalCredits: 7500,
        availableCredits: 6000,
        pricePerCredit: 10,
        currency: "CUSD",
        carbonReduction: 7500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2034-01-01'),
        status: "active",
        verificationStandard: "Plan Vivo",
        images: [
          "/images/carbon/mangrove-1.jpg",
          "/images/carbon/mangrove-2.jpg"
        ],
        organizationId: "org789",
        organization: {
          name: "OceanGuardians",
          logo: "/images/orgs/ocean-guardians-logo.png",
          website: "https://oceanguardians.org"
        }
      },
      {
        id: uuidv4(),
        name: "Clean Cookstoves Initiative",
        description: "Distribution of efficient cookstoves to reduce wood consumption and indoor air pollution.",
        location: "Rwanda",
        projectType: "methane",
        totalCredits: 3000,
        availableCredits: 2100,
        pricePerCredit: 8,
        currency: "CUSD",
        carbonReduction: 3000,
        startDate: new Date('2023-06-15'),
        endDate: new Date('2026-06-15'),
        status: "active",
        verificationStandard: "Gold Standard",
        images: [
          "/images/carbon/cookstoves-1.jpg",
          "/images/carbon/cookstoves-2.jpg"
        ],
        organizationId: "org101",
        organization: {
          name: "Clean Air Foundation",
          logo: "/images/orgs/clean-air-logo.png",
          website: "https://cleanair-foundation.org"
        }
      }
    ];
  }

  // Get all available carbon credit projects
  getAvailableProjects(): CarbonProject[] {
    return this.projects.filter(project => 
      project.status === 'active' && project.availableCredits > 0
    );
  }

  // Get a specific project by ID
  getProjectById(projectId: string): CarbonProject | undefined {
    return this.projects.find(project => project.id === projectId);
  }

  // Get user's purchased carbon credits
  getUserCredits(userId: string): CarbonCredit[] {
    return this.userCredits[userId] || [];
  }

  // Get user's carbon footprint
  getUserFootprint(userId: string): CarbonFootprint | undefined {
    const userFootprints = this.userFootprints[userId] || [];
    // Get the most recent footprint calculation
    return userFootprints.sort(
      (a, b) => b.calculationDate.getTime() - a.calculationDate.getTime()
    )[0];
  }

  // Calculate user's carbon footprint
  calculateUserFootprint(userId: string, data: {
    transportKm: number;
    energyKwh: number;
    meatConsumption: 'high' | 'medium' | 'low' | 'none';
    flightsPerYear: number;
  }): CarbonFootprint {
    // Basic calculation formulas (simplified for demo)
    const transportEmissions = data.transportKm * 0.12; // kg CO2 per km
    const energyEmissions = data.energyKwh * 0.5; // kg CO2 per kWh
    
    // Meat consumption factors
    const meatFactors = {
      high: 1000,
      medium: 600,
      low: 300,
      none: 100
    };
    const foodEmissions = meatFactors[data.meatConsumption];
    
    // Flight emissions
    const flightEmissions = data.flightsPerYear * 700; // kg CO2 per flight (average)
    
    // Calculate goods and services (simplified)
    const goodsEmissions = 1200; // kg CO2 baseline for goods and services
    
    // Total in tons
    const totalEmissionsKg = transportEmissions + energyEmissions + foodEmissions + flightEmissions + goodsEmissions;
    const totalEmissions = totalEmissionsKg / 1000; // Convert to tons
    
    // Calculate offset from user's purchases
    const userPurchases = this.getUserCredits(userId);
    const offsetCredits = userPurchases.reduce((total, credit) => total + credit.amount, 0);
    
    const footprint: CarbonFootprint = {
      id: uuidv4(),
      userId,
      calculationDate: new Date(),
      transportEmissions: transportEmissions / 1000, // to tons
      energyEmissions: energyEmissions / 1000, // to tons
      foodEmissions: foodEmissions / 1000, // to tons
      goodsEmissions: (flightEmissions + goodsEmissions) / 1000, // to tons
      totalEmissions,
      offsetCredits,
      remainingFootprint: Math.max(0, totalEmissions - offsetCredits)
    };
    
    // Save user's footprint
    if (!this.userFootprints[userId]) {
      this.userFootprints[userId] = [];
    }
    this.userFootprints[userId].push(footprint);
    
    return footprint;
  }

  // Purchase carbon credits
  purchaseCredits(userId: string, projectId: string, amount: number): CarbonCredit | null {
    const project = this.getProjectById(projectId);
    
    if (!project || project.availableCredits < amount || project.status !== 'active') {
      return null;
    }
    
    const totalCost = amount * project.pricePerCredit;
    
    // Create the purchase record
    const creditPurchase: CarbonCredit = {
      id: uuidv4(),
      projectId,
      userId,
      amount,
      totalCost,
      transactionDate: new Date(),
      status: 'completed',
      certificateId: `CERT-${Math.floor(Math.random() * 1000000)}`,
      blockchainTxHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
    };
    
    // Update available credits
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      this.projects[projectIndex] = {
        ...project,
        availableCredits: project.availableCredits - amount
      };
    }
    
    // Save to user's credits
    if (!this.userCredits[userId]) {
      this.userCredits[userId] = [];
    }
    this.userCredits[userId].push(creditPurchase);
    
    return creditPurchase;
  }

  // Get impact statistics
  getImpactStatistics() {
    return {
      totalProjects: this.projects.length,
      totalCarbonReduction: this.projects.reduce((total, project) => 
        total + (project.totalCredits - project.availableCredits), 0),
      activeProjects: this.projects.filter(p => p.status === 'active').length,
      averagePricePerCredit: this.projects.reduce((sum, project) => 
        sum + project.pricePerCredit, 0) / this.projects.length
    };
  }
}

// Export a singleton instance
export const carbonCreditService = new CarbonCreditService();
