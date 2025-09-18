// Comprehensive mock data for financial planning dashboard

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'prospect' | 'inactive' | 'former';
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  portfolioValue: number;
  lastReview: string;
  nextReview: string;
  annualIncome?: number;
  netWorth?: number;
  objectives?: string[];
  address?: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  employmentStatus?: string;
  employer?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  dependents?: Array<{ name: string; age: number; relationship: string }>;
  notes?: string;
}

export interface Portfolio {
  id: string;
  clientId: string;
  name: string;
  value: number;
  allocation: {
    equities: number;
    bonds: number;
    cash: number;
    alternatives: number;
    property?: number;
  };
  performance: {
    ytd: number;
    oneYear: number;
    threeYear: number;
    fiveYear?: number;
  };
  accountType: string;
  provider: string;
  benchmark: string;
  lastUpdated: string;
}

export interface Household {
  id: string;
  name: string;
  primaryClientId: string;
  members: string[]; // client IDs
  jointIncome: number;
  jointNetWorth: number;
  created: string;
}

// Mock Clients Data
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+44 7700 900123',
    status: 'active',
    riskProfile: 'aggressive',
    portfolioValue: 850000,
    lastReview: '2024-11-20',
    nextReview: '2025-05-20',
    annualIncome: 85000,
    netWorth: 1200000,
    objectives: [
      'Retire at 55 with £2M portfolio',
      'Purchase second property in next 3 years',
      'Children education fund £200k'
    ],
    address: {
      street: '42 Richmond Avenue',
      city: 'London',
      postcode: 'SW14 8RE',
      country: 'United Kingdom'
    },
    employmentStatus: 'employed',
    employer: 'Goldman Sachs',
    dateOfBirth: '1985-03-15',
    maritalStatus: 'married',
    dependents: [
      { name: 'Emma Mitchell', age: 8, relationship: 'daughter' },
      { name: 'James Mitchell', age: 6, relationship: 'son' }
    ],
    notes: 'High earner with aggressive growth strategy. Risk-tolerant professional.'
  },
  {
    id: '2',
    name: 'David Thompson',
    email: 'david.thompson@email.com',
    phone: '+44 7700 900124',
    status: 'active',
    riskProfile: 'moderate',
    portfolioValue: 650000,
    lastReview: '2024-12-01',
    nextReview: '2025-06-01',
    annualIncome: 72000,
    netWorth: 890000,
    objectives: [
      'Retirement planning for age 65',
      'House purchase within 2 years',
      'Emergency fund 6 months expenses'
    ],
    address: {
      street: '18 Oak Gardens',
      city: 'Manchester',
      postcode: 'M20 2AA',
      country: 'United Kingdom'
    },
    employmentStatus: 'employed',
    employer: 'Barclays Bank',
    dateOfBirth: '1978-08-22',
    maritalStatus: 'single',
    notes: 'Steady performer, moderate risk tolerance. Focus on diversification.'
  },
  {
    id: '3',
    name: 'Emma Richardson',
    email: 'emma.richardson@email.com',
    phone: '+44 7700 900125',
    status: 'active',
    riskProfile: 'conservative',
    portfolioValue: 420000,
    lastReview: '2024-11-30',
    nextReview: '2025-05-30',
    annualIncome: 48000,
    netWorth: 520000,
    objectives: [
      'Capital preservation',
      'Income generation for retirement',
      'Inheritance planning for children'
    ],
    address: {
      street: '7 The Close',
      city: 'Bath',
      postcode: 'BA1 3DZ',
      country: 'United Kingdom'
    },
    employmentStatus: 'retired',
    employer: 'Former NHS Trust Manager',
    dateOfBirth: '1962-11-12',
    maritalStatus: 'widowed',
    dependents: [
      { name: 'Sophie Richardson', age: 32, relationship: 'daughter' },
      { name: 'Michael Richardson', age: 29, relationship: 'son' }
    ],
    notes: 'Conservative investor focused on capital preservation and income.'
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '+44 7700 900126',
    status: 'prospect',
    riskProfile: 'moderate',
    portfolioValue: 0,
    lastReview: '2024-12-10',
    nextReview: '2024-12-20',
    annualIncome: 95000,
    netWorth: 150000,
    objectives: [
      'Start investment portfolio',
      'Save for house deposit',
      'Build emergency fund'
    ],
    address: {
      street: '156 High Street',
      city: 'Edinburgh',
      postcode: 'EH1 1QS',
      country: 'United Kingdom'
    },
    employmentStatus: 'self-employed',
    employer: 'Wilson Consulting Ltd',
    dateOfBirth: '1988-06-30',
    maritalStatus: 'married',
    notes: 'New prospect, high earning potential. Ready to start investing.'
  },
  {
    id: '5',
    name: 'Lisa Chen',
    email: 'lisa.chen@email.com',
    phone: '+44 7700 900127',
    status: 'active',
    riskProfile: 'aggressive',
    portfolioValue: 1200000,
    lastReview: '2024-11-25',
    nextReview: '2025-05-25',
    annualIncome: 120000,
    netWorth: 1800000,
    objectives: [
      'Early retirement at 50',
      'Property investment portfolio',
      'International diversification'
    ],
    address: {
      street: '88 Canary Wharf',
      city: 'London',
      postcode: 'E14 5AB',
      country: 'United Kingdom'
    },
    employmentStatus: 'employed',
    employer: 'JP Morgan',
    dateOfBirth: '1983-01-20',
    maritalStatus: 'single',
    notes: 'Tech executive with high risk tolerance. International investment focus.'
  }
];

// Mock Portfolios Data
export const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    clientId: '1',
    name: 'Growth Portfolio',
    value: 850000,
    allocation: {
      equities: 70,
      bonds: 20,
      cash: 5,
      alternatives: 5
    },
    performance: {
      ytd: 12.8,
      oneYear: 15.2,
      threeYear: 8.9,
      fiveYear: 11.2
    },
    accountType: 'ISA & General Investment',
    provider: 'Charles Stanley',
    benchmark: 'MSCI World Index',
    lastUpdated: '2024-12-15'
  },
  {
    id: '2',
    clientId: '2',
    name: 'Balanced Portfolio',
    value: 650000,
    allocation: {
      equities: 60,
      bonds: 30,
      cash: 5,
      alternatives: 5
    },
    performance: {
      ytd: 8.5,
      oneYear: 10.7,
      threeYear: 6.8,
      fiveYear: 8.4
    },
    accountType: 'SIPP & ISA',
    provider: 'AJ Bell',
    benchmark: 'Balanced Index',
    lastUpdated: '2024-12-15'
  },
  {
    id: '3',
    clientId: '3',
    name: 'Income Portfolio',
    value: 420000,
    allocation: {
      equities: 40,
      bonds: 50,
      cash: 8,
      alternatives: 2
    },
    performance: {
      ytd: 5.2,
      oneYear: 6.8,
      threeYear: 4.9,
      fiveYear: 5.6
    },
    accountType: 'General Investment Account',
    provider: 'Hargreaves Lansdown',
    benchmark: 'UK Income Index',
    lastUpdated: '2024-12-15'
  },
  {
    id: '4',
    clientId: '5',
    name: 'Aggressive Growth',
    value: 1200000,
    allocation: {
      equities: 85,
      bonds: 5,
      cash: 5,
      alternatives: 5
    },
    performance: {
      ytd: 18.9,
      oneYear: 22.1,
      threeYear: 12.5,
      fiveYear: 14.8
    },
    accountType: 'ISA & General Investment',
    provider: 'Interactive Investor',
    benchmark: 'NASDAQ Composite',
    lastUpdated: '2024-12-15'
  }
];

// Mock Households Data
export const mockHouseholds: Household[] = [
  {
    id: '1',
    name: 'Mitchell Family',
    primaryClientId: '1',
    members: ['1'],
    jointIncome: 85000,
    jointNetWorth: 1200000,
    created: '2023-05-15'
  },
  {
    id: '2',
    name: 'Wilson Household',
    primaryClientId: '4',
    members: ['4'],
    jointIncome: 95000,
    jointNetWorth: 150000,
    created: '2024-12-10'
  }
];

// Performance data for charts
export const mockPerformanceData = [
  { date: '2024-01', portfolio: 2.1, benchmark: 1.8, target: 2.0 },
  { date: '2024-02', portfolio: 1.9, benchmark: 2.2, target: 2.0 },
  { date: '2024-03', portfolio: 4.2, benchmark: 3.8, target: 2.0 },
  { date: '2024-04', portfolio: 3.1, benchmark: 2.9, target: 2.0 },
  { date: '2024-05', portfolio: 2.8, benchmark: 3.1, target: 2.0 },
  { date: '2024-06', portfolio: 5.2, benchmark: 4.8, target: 2.0 },
  { date: '2024-07', portfolio: 6.8, benchmark: 6.2, target: 2.0 },
  { date: '2024-08', portfolio: 4.9, benchmark: 5.1, target: 2.0 },
  { date: '2024-09', portfolio: 7.2, benchmark: 6.8, target: 2.0 },
  { date: '2024-10', portfolio: 8.9, benchmark: 8.2, target: 2.0 },
  { date: '2024-11', portfolio: 10.5, benchmark: 9.8, target: 2.0 },
  { date: '2024-12', portfolio: 12.8, benchmark: 11.9, target: 2.0 }
];

// Allocation data for pie charts
export const mockAllocationData = [
  { name: 'Equities', value: 65, color: '#3b82f6', actualValue: 552500 },
  { name: 'Bonds', value: 25, color: '#10b981', actualValue: 212500 },
  { name: 'Cash', value: 6, color: '#f59e0b', actualValue: 51000 },
  { name: 'Alternatives', value: 4, color: '#8b5cf6', actualValue: 34000 }
];

// Dashboard statistics
export const mockDashboardStats = {
  totalClients: mockClients.length,
  totalAUM: mockPortfolios.reduce((sum, p) => sum + p.value, 0),
  avgPerformance: 10.2,
  pendingTasks: 5,
  activeClients: mockClients.filter(c => c.status === 'active').length,
  prospects: mockClients.filter(c => c.status === 'prospect').length,
  portfoliosUnderManagement: mockPortfolios.length,
  averagePortfolioSize: mockPortfolios.reduce((sum, p) => sum + p.value, 0) / mockPortfolios.length
};

// Recent activity data
export const mockRecentActivity = [
  {
    id: '1',
    type: 'portfolio_rebalance',
    client: 'Sarah Mitchell',
    description: 'Portfolio rebalanced - equity allocation increased to 70%',
    timestamp: '2024-12-15T14:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'client_meeting',
    client: 'David Thompson',
    description: 'Annual review meeting scheduled',
    timestamp: '2024-12-15T10:15:00Z',
    status: 'scheduled'
  },
  {
    id: '3',
    type: 'report_generated',
    client: 'Emma Richardson',
    description: 'Quarterly performance report generated',
    timestamp: '2024-12-14T16:45:00Z',
    status: 'completed'
  },
  {
    id: '4',
    type: 'new_client',
    client: 'James Wilson',
    description: 'Initial consultation completed',
    timestamp: '2024-12-10T11:30:00Z',
    status: 'completed'
  }
];

// Compliance tasks
export const mockComplianceTasks = [
  {
    id: '1',
    client: 'Sarah Mitchell',
    type: 'Annual Review',
    title: 'Portfolio Suitability Assessment 2024',
    status: 'pending' as const,
    dueDate: '2025-01-20',
    assignedTo: 'You',
    priority: 'high'
  },
  {
    id: '2',
    client: 'David Thompson',
    type: 'KYC Update',
    title: 'Customer Due Diligence Refresh',
    status: 'in_progress' as const,
    dueDate: '2024-12-25',
    assignedTo: 'You',
    priority: 'medium'
  },
  {
    id: '3',
    client: 'Emma Richardson',
    type: 'Risk Assessment',
    title: 'Annual Risk Profile Review',
    status: 'completed' as const,
    dueDate: '2024-11-30',
    assignedTo: 'You',
    priority: 'medium'
  },
  {
    id: '4',
    client: 'James Wilson',
    type: 'Fact Find',
    title: 'Initial Client Fact Find',
    status: 'pending' as const,
    dueDate: '2024-12-20',
    assignedTo: 'You',
    priority: 'high'
  },
  {
    id: '5',
    client: 'Lisa Chen',
    type: 'Suitability Report',
    title: 'Investment Strategy Suitability',
    status: 'overdue' as const,
    dueDate: '2024-12-10',
    assignedTo: 'You',
    priority: 'urgent'
  }
];

// Financial scenarios data
export const mockScenarios = [
  {
    id: '1',
    clientId: '1',
    name: 'Early Retirement at 55',
    type: 'retirement',
    currentAge: 39,
    targetAge: 55,
    currentSavings: 850000,
    monthlyContribution: 3000,
    expectedReturn: 8.5,
    projectedValue: 2100000,
    projectedIncome: 7000,
    probability: 85
  },
  {
    id: '2',
    clientId: '2',
    name: 'Standard Retirement at 65',
    type: 'retirement',
    currentAge: 46,
    targetAge: 65,
    currentSavings: 650000,
    monthlyContribution: 2000,
    expectedReturn: 7.0,
    projectedValue: 1650000,
    projectedIncome: 5500,
    probability: 92
  }
];