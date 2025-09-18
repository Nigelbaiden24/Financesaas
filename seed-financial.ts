import { db } from "./db.js";
import { 
  organizations, 
  users, 
  clients, 
  households, 
  householdMembers,
  portfolios, 
  holdings,
  portfolioTransactions,
  scenarios,
  financialGoals,
  complianceTasks,
  meetings,
  reports,
  enhancedNotifications,
  clientPipelineStages,
  clientPipeline,
  kpiMetrics,
  auditLog
} from "@shared/schema";
import bcrypt from "bcrypt";

// Utility functions
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const randomChoice = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const randomChoices = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// UK-specific data
const ukStreetNames = [
  'High Street', 'Victoria Road', 'Church Lane', 'The Green', 'Mill Lane',
  'Station Road', 'Queen Street', 'King Street', 'Main Street', 'Park Road',
  'Alexandra Avenue', 'Richmond Terrace', 'Oxford Street', 'Cambridge Road',
  'Windsor Close', 'Elm Grove', 'Oak Avenue', 'Maple Drive', 'Cedar Way',
  'Willow Gardens', 'Rose Court', 'Holly Park', 'Ivy Lane', 'Pine Close'
];

const ukCities = [
  { city: 'London', postcodes: ['SW1A 1AA', 'E14 5AB', 'SW14 8RE', 'NW3 2QG', 'SE1 9RT'] },
  { city: 'Manchester', postcodes: ['M1 1AA', 'M20 2AA', 'M15 4FN', 'M4 3TR', 'M13 9PL'] },
  { city: 'Birmingham', postcodes: ['B1 1AA', 'B15 2TT', 'B29 6BD', 'B38 8DA', 'B46 1AL'] },
  { city: 'Liverpool', postcodes: ['L1 8JQ', 'L15 3HE', 'L25 2RF', 'L31 1HX', 'L69 3BX'] },
  { city: 'Leeds', postcodes: ['LS1 1AA', 'LS6 2UE', 'LS17 8SA', 'LS25 1LX', 'LS29 9ET'] },
  { city: 'Edinburgh', postcodes: ['EH1 1QS', 'EH3 9DR', 'EH8 9YL', 'EH16 5UY', 'EH20 9FH'] },
  { city: 'Bristol', postcodes: ['BS1 4DJ', 'BS8 1TH', 'BS16 1QY', 'BS20 7JH', 'BS35 4AT'] },
  { city: 'Cardiff', postcodes: ['CF10 1EP', 'CF14 3UZ', 'CF23 9AE', 'CF31 1SP', 'CF83 1BL'] },
  { city: 'Glasgow', postcodes: ['G1 1RE', 'G12 8LX', 'G20 6AD', 'G32 0JG', 'G73 1AA'] },
  { city: 'Sheffield', postcodes: ['S1 2HE', 'S6 3BR', 'S11 8YA', 'S17 3GD', 'S25 2QJ'] }
];

const ukFirstNames = [
  // Male names
  'James', 'John', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher',
  'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Kenneth', 'Paul', 'Joshua',
  'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  
  // Female names
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle',
  'Laura', 'Sarah', 'Kimberly', 'Deborah', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen',
  'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia', 'Harper', 'Evelyn'
];

const ukLastNames = [
  'Smith', 'Jones', 'Taylor', 'Williams', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts',
  'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright',
  'Green', 'Harris', 'Cooper', 'King', 'Lee', 'Martin', 'Clarke', 'James', 'Morgan', 'Hughes',
  'Edwards', 'Hill', 'Moore', 'Clark', 'Harrison', 'Scott', 'Young', 'Morris', 'Hall', 'Ward',
  'Turner', 'Carter', 'Phillips', 'Mitchell', 'Patel', 'Adams', 'Campbell', 'Anderson', 'Allen', 'Cook'
];

const ukEmployers = [
  // Financial Services
  'Barclays Bank', 'HSBC', 'Lloyds Banking Group', 'NatWest Group', 'Standard Chartered',
  'JP Morgan', 'Goldman Sachs', 'Morgan Stanley', 'BlackRock', 'Schroders',
  
  // Technology
  'BT Group', 'Vodafone', 'ARM Holdings', 'Sage Group', 'Aveva',
  'DeepMind', 'Revolut', 'Monzo', 'Wise', 'Deliveroo',
  
  // Healthcare & Pharmaceuticals
  'AstraZeneca', 'GSK', 'NHS Trust', 'Bupa', 'KPMG Healthcare',
  
  // Retail & Consumer
  'Tesco', 'Sainsbury\'s', 'Marks & Spencer', 'John Lewis Partnership', 'Next',
  'ASOS', 'Ocado', 'Burberry', 'Rolls-Royce', 'British Airways',
  
  // Energy & Utilities
  'BP', 'Shell', 'National Grid', 'SSE', 'Centrica',
  
  // Professional Services
  'Deloitte', 'PwC', 'EY', 'KPMG', 'McKinsey & Company',
  'BCG', 'Bain & Company', 'Clifford Chance', 'Allen & Overy', 'Linklaters',
  
  // Government & Public Sector
  'HM Treasury', 'Cabinet Office', 'Ministry of Defence', 'Home Office', 'Foreign Office',
  
  // Self-employed/Consulting
  'Self-employed Consultant', 'Freelance Professional', 'Independent Contractor'
];

const ukJobTitles = [
  // Executive
  'Chief Executive Officer', 'Chief Financial Officer', 'Chief Technology Officer', 'Managing Director',
  'Executive Director', 'Senior Partner', 'Head of Operations', 'Head of Strategy',
  
  // Finance
  'Investment Manager', 'Portfolio Manager', 'Financial Analyst', 'Risk Manager',
  'Treasury Manager', 'Credit Analyst', 'Compliance Officer', 'Audit Manager',
  
  // Technology
  'Software Engineer', 'Data Scientist', 'Product Manager', 'Technical Director',
  'Solutions Architect', 'DevOps Engineer', 'Security Specialist', 'IT Manager',
  
  // Healthcare
  'Consultant', 'GP', 'Surgeon', 'Specialist Registrar', 'Healthcare Manager',
  'Clinical Director', 'Medical Director', 'Nurse Manager',
  
  // Legal
  'Solicitor', 'Barrister', 'Legal Counsel', 'Partner', 'Associate',
  
  // Sales & Marketing
  'Sales Director', 'Marketing Manager', 'Business Development Manager', 'Account Manager',
  'Regional Manager', 'Client Relationship Manager',
  
  // Operations
  'Operations Manager', 'Project Manager', 'Programme Manager', 'Supply Chain Manager',
  'Quality Manager', 'HR Director', 'Learning & Development Manager'
];

// UK Investment Holdings Data
const ukEquityHoldings = [
  // UK Large Cap
  { symbol: 'SHEL', name: 'Shell plc', sector: 'Energy', region: 'UK', priceRange: [25.50, 28.75] },
  { symbol: 'AZN', name: 'AstraZeneca PLC', sector: 'Healthcare', region: 'UK', priceRange: [110.20, 125.80] },
  { symbol: 'LSEG', name: 'London Stock Exchange Group', sector: 'Financial Services', region: 'UK', priceRange: [95.40, 105.60] },
  { symbol: 'ULVR', name: 'Unilever PLC', sector: 'Consumer Goods', region: 'UK', priceRange: [42.15, 46.85] },
  { symbol: 'DGE', name: 'Diageo plc', sector: 'Consumer Goods', region: 'UK', priceRange: [35.20, 39.80] },
  { symbol: 'BP', name: 'BP p.l.c.', sector: 'Energy', region: 'UK', priceRange: [4.85, 5.45] },
  { symbol: 'GSK', name: 'GSK plc', sector: 'Healthcare', region: 'UK', priceRange: [15.25, 17.80] },
  { symbol: 'BARC', name: 'Barclays PLC', sector: 'Financial Services', region: 'UK', priceRange: [2.15, 2.55] },
  { symbol: 'LLOY', name: 'Lloyds Banking Group plc', sector: 'Financial Services', region: 'UK', priceRange: [0.55, 0.65] },
  { symbol: 'TSCO', name: 'Tesco PLC', sector: 'Consumer Services', region: 'UK', priceRange: [3.05, 3.45] },
  
  // UK ETFs
  { symbol: 'VUKE', name: 'Vanguard FTSE 100 UCITS ETF', sector: 'UK Equity', region: 'UK', priceRange: [32.50, 35.80] },
  { symbol: 'ISF', name: 'iShares Core FTSE 100 UCITS ETF', sector: 'UK Equity', region: 'UK', priceRange: [7.85, 8.25] },
  { symbol: 'VMID', name: 'Vanguard FTSE 250 UCITS ETF', sector: 'UK Equity', region: 'UK', priceRange: [18.90, 21.40] },
  
  // Global ETFs
  { symbol: 'VWRL', name: 'Vanguard FTSE All-World UCITS ETF', sector: 'Global Equity', region: 'Global', priceRange: [102.40, 108.75] },
  { symbol: 'VUSA', name: 'Vanguard S&P 500 UCITS ETF', sector: 'US Equity', region: 'North America', priceRange: [85.20, 92.45] },
  { symbol: 'VEVE', name: 'Vanguard FTSE Developed Europe UCITS ETF', sector: 'European Equity', region: 'Europe', priceRange: [55.30, 61.90] },
  { symbol: 'VFEM', name: 'Vanguard FTSE Emerging Markets UCITS ETF', sector: 'Emerging Markets', region: 'Emerging Markets', priceRange: [45.80, 52.20] },
  
  // Sector ETFs
  { symbol: 'IUKP', name: 'iShares Core FTSE 100 UCITS ETF', sector: 'UK Equity', region: 'UK', priceRange: [7.85, 8.25] },
  { symbol: 'CNDX', name: 'iShares Core S&P 500 UCITS ETF', sector: 'US Equity', region: 'North America', priceRange: [385.40, 420.80] },
];

const ukBondHoldings = [
  { symbol: 'VGOV', name: 'Vanguard UK Government Bond UCITS ETF', sector: 'Government Bonds', region: 'UK', priceRange: [47.20, 51.75] },
  { symbol: 'CORP', name: 'iShares Core £ Corporate Bond UCITS ETF', sector: 'Corporate Bonds', region: 'UK', priceRange: [52.15, 57.80] },
  { symbol: 'IGLT', name: 'iShares Core UK Gilts UCITS ETF', sector: 'Government Bonds', region: 'UK', priceRange: [67.40, 72.90] },
  { symbol: 'SLXX', name: 'iShares Core Global Aggregate Bond UCITS ETF', sector: 'Global Bonds', region: 'Global', priceRange: [95.80, 102.30] },
  { symbol: 'SAAA', name: 'Xtrackers II EUR Corporate Bond UCITS ETF', sector: 'Corporate Bonds', region: 'Europe', priceRange: [128.50, 135.20] },
];

async function seedFinancialData() {
  console.log("🏦 Starting comprehensive financial data seeding...");

  try {
    // Check if financial data already exists
    const existingOrgs = await db.select().from(organizations).limit(1);
    if (existingOrgs.length > 0) {
      console.log("📋 Financial organizations already exist, skipping seed");
      return;
    }

    // 1. Create Advisory Firm Organization - Using current database structure
    const orgId = 'wealthy-advisors-ltd';
    const organization = {
      id: orgId,
      name: 'Wealthy Advisors Ltd',
      slug: 'wealthy-advisors-ltd',
      domain: 'wealthyadvisors.co.uk',
      plan: 'agency',
      isActive: true
    };

    await db.insert(organizations).values(organization);
    console.log(`✅ Created organization: ${organization.name}`);

    // 2. Create Users (Advisers)
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const advisers = [
      {
        id: 'admin-user',
        organizationId: orgId,
        email: 'admin@wealthyadvisors.co.uk',
        password: hashedPassword,
        firstName: 'James',
        lastName: 'Wellington',
        role: 'admin',
        title: 'Managing Director',
        department: 'Management',
        phone: '+44 20 7946 0959',
        permissions: ['client_management', 'portfolio_management', 'reporting', 'compliance', 'admin'],
        emailVerified: true,
        isActive: true
      },
      {
        id: 'senior-adviser-1',
        organizationId: orgId,
        email: 'sarah.mitchell@wealthyadvisors.co.uk',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Mitchell',
        role: 'adviser',
        title: 'Senior Financial Adviser',
        department: 'Wealth Management',
        phone: '+44 20 7946 0960',
        permissions: ['client_management', 'portfolio_management', 'reporting', 'compliance'],
        emailVerified: true,
        isActive: true
      },
      {
        id: 'adviser-1',
        organizationId: orgId,
        email: 'david.thompson@wealthyadvisors.co.uk',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Thompson',
        role: 'adviser',
        title: 'Financial Adviser',
        department: 'Wealth Management',
        phone: '+44 20 7946 0961',
        permissions: ['client_management', 'portfolio_management', 'reporting'],
        emailVerified: true,
        isActive: true
      },
      {
        id: 'paraplanner-1',
        organizationId: orgId,
        email: 'emma.richardson@wealthyadvisors.co.uk',
        password: hashedPassword,
        firstName: 'Emma',
        lastName: 'Richardson',
        role: 'paraplanner',
        title: 'Senior Paraplanner',
        department: 'Operations',
        phone: '+44 20 7946 0962',
        permissions: ['portfolio_management', 'reporting', 'compliance'],
        emailVerified: true,
        isActive: true
      }
    ];

    for (const adviser of advisers) {
      await db.insert(users).values(adviser);
      console.log(`✅ Created user: ${adviser.firstName} ${adviser.lastName}`);
    }

    // 3. Create Comprehensive Client Data
    const clientData = [];
    const householdData = [];
    const householdMemberData = [];

    // High Net Worth Couples
    const hnwCouples = [
      {
        household: 'Wellington Family',
        primary: {
          firstName: 'Alexander', lastName: 'Wellington', email: 'alexander.wellington@email.com',
          dateOfBirth: new Date('1975-03-15'), employer: 'Goldman Sachs', jobTitle: 'Managing Director',
          annualIncome: 350000, netWorth: 2500000, riskTolerance: 'aggressive'
        },
        spouse: {
          firstName: 'Victoria', lastName: 'Wellington', email: 'victoria.wellington@email.com',
          dateOfBirth: new Date('1978-08-22'), employer: 'Clifford Chance', jobTitle: 'Partner',
          annualIncome: 280000, netWorth: 1200000, riskTolerance: 'moderate'
        },
        city: ukCities[0], // London
        dependents: [
          { name: 'Sophie Wellington', age: 12, relationship: 'daughter' },
          { name: 'Oliver Wellington', age: 9, relationship: 'son' }
        ],
        jointIncome: 630000,
        jointNetWorth: 3700000
      },
      {
        household: 'Harrison-Chen Family',
        primary: {
          firstName: 'Michael', lastName: 'Harrison', email: 'michael.harrison@email.com',
          dateOfBirth: new Date('1980-11-08'), employer: 'BlackRock', jobTitle: 'Portfolio Manager',
          annualIncome: 185000, netWorth: 1400000, riskTolerance: 'moderate'
        },
        spouse: {
          firstName: 'Li', lastName: 'Chen-Harrison', email: 'li.chen.harrison@email.com',
          dateOfBirth: new Date('1983-02-14'), employer: 'DeepMind', jobTitle: 'Senior Data Scientist',
          annualIncome: 165000, netWorth: 800000, riskTolerance: 'aggressive'
        },
        city: ukCities[0], // London
        dependents: [
          { name: 'Emma Harrison-Chen', age: 6, relationship: 'daughter' },
          { name: 'James Harrison-Chen', age: 3, relationship: 'son' }
        ],
        jointIncome: 350000,
        jointNetWorth: 2200000
      }
    ];

    // Mass Affluent Couples
    const massAffluentCouples = [
      {
        household: 'Thompson Family',
        primary: {
          firstName: 'Robert', lastName: 'Thompson', email: 'robert.thompson@email.com',
          dateOfBirth: new Date('1985-05-20'), employer: 'Barclays Bank', jobTitle: 'Senior Manager',
          annualIncome: 95000, netWorth: 750000, riskTolerance: 'moderate'
        },
        spouse: {
          firstName: 'Jennifer', lastName: 'Thompson', email: 'jennifer.thompson@email.com',
          dateOfBirth: new Date('1987-09-12'), employer: 'NHS Trust', jobTitle: 'Consultant',
          annualIncome: 85000, netWorth: 450000, riskTolerance: 'conservative'
        },
        city: ukCities[1], // Manchester
        dependents: [
          { name: 'Lucy Thompson', age: 8, relationship: 'daughter' },
          { name: 'Daniel Thompson', age: 5, relationship: 'son' }
        ],
        jointIncome: 180000,
        jointNetWorth: 1200000
      },
      {
        household: 'Wilson Family',
        primary: {
          firstName: 'James', lastName: 'Wilson', email: 'james.wilson@email.com',
          dateOfBirth: new Date('1982-12-03'), employer: 'Self-employed Consultant', jobTitle: 'IT Consultant',
          annualIncome: 78000, netWorth: 520000, riskTolerance: 'moderate'
        },
        spouse: {
          firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@email.com',
          dateOfBirth: new Date('1984-04-18'), employer: 'John Lewis Partnership', jobTitle: 'Marketing Manager',
          annualIncome: 52000, netWorth: 280000, riskTolerance: 'moderate'
        },
        city: ukCities[2], // Birmingham
        dependents: [
          { name: 'Katie Wilson', age: 10, relationship: 'daughter' }
        ],
        jointIncome: 130000,
        jointNetWorth: 800000
      }
    ];

    // Single High Earners
    const singleClients = [
      {
        firstName: 'Eleanor', lastName: 'Hartwell', email: 'eleanor.hartwell@email.com',
        dateOfBirth: new Date('1988-06-25'), employer: 'McKinsey & Company', jobTitle: 'Principal',
        annualIncome: 275000, netWorth: 1800000, riskTolerance: 'aggressive',
        maritalStatus: 'single', city: ukCities[0], // London
        objectives: ['Early retirement at 45', 'Property investment portfolio', 'International diversification']
      },
      {
        firstName: 'Thomas', lastName: 'Sterling', email: 'thomas.sterling@email.com',
        dateOfBirth: new Date('1979-01-12'), employer: 'ARM Holdings', jobTitle: 'VP Engineering',
        annualIncome: 145000, netWorth: 950000, riskTolerance: 'moderate',
        maritalStatus: 'divorced', city: ukCities[4], // Leeds
        objectives: ['Retirement at 60', 'Children\'s university funding', 'Emergency fund maintenance']
      },
      {
        firstName: 'Catherine', lastName: 'Ashworth', email: 'catherine.ashworth@email.com',
        dateOfBirth: new Date('1990-04-08'), employer: 'Revolut', jobTitle: 'Product Director',
        annualIncome: 120000, netWorth: 420000, riskTolerance: 'aggressive',
        maritalStatus: 'single', city: ukCities[0], // London
        objectives: ['First home purchase', 'Investment portfolio growth', 'Travel fund']
      }
    ];

    // Retirees
    const retirees = [
      {
        firstName: 'Margaret', lastName: 'Whitfield', email: 'margaret.whitfield@email.com',
        dateOfBirth: new Date('1955-09-30'), employer: 'Retired - Former Civil Servant', jobTitle: 'Former Permanent Secretary',
        annualIncome: 45000, netWorth: 1200000, riskTolerance: 'conservative',
        maritalStatus: 'widowed', city: ukCities[6], // Bristol
        objectives: ['Capital preservation', 'Income generation', 'Inheritance planning'],
        dependents: [
          { name: 'Richard Whitfield', age: 42, relationship: 'son' },
          { name: 'Helen Whitfield-Jones', age: 38, relationship: 'daughter' }
        ]
      },
      {
        firstName: 'Geoffrey', lastName: 'Pemberton', email: 'geoffrey.pemberton@email.com',
        dateOfBirth: new Date('1950-07-15'), employer: 'Retired - Former Bank Manager', jobTitle: 'Former Regional Director',
        annualIncome: 38000, netWorth: 850000, riskTolerance: 'conservative',
        maritalStatus: 'married', city: ukCities[5], // Edinburgh
        objectives: ['Income maximization', 'Healthcare provision', 'Legacy planning']
      }
    ];

    // Prospects (Pre-clients)
    const prospects = [
      {
        firstName: 'Daniel', lastName: 'Rodriguez', email: 'daniel.rodriguez@email.com',
        dateOfBirth: new Date('1992-03-20'), employer: 'Meta', jobTitle: 'Software Engineer',
        annualIncome: 95000, netWorth: 180000, riskTolerance: 'aggressive',
        maritalStatus: 'single', city: ukCities[0], // London
        status: 'prospect',
        objectives: ['Start investment portfolio', 'House deposit savings', 'Retirement planning']
      },
      {
        firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@email.com',
        dateOfBirth: new Date('1986-11-14'), employer: 'AstraZeneca', jobTitle: 'Research Director',
        annualIncome: 110000, netWorth: 320000, riskTolerance: 'moderate',
        maritalStatus: 'married', city: ukCities[7], // Cardiff
        status: 'prospect',
        objectives: ['Portfolio diversification', 'Tax-efficient investing', 'Children\'s education fund']
      }
    ];

    // Process all client types
    const allClientTypes = [
      ...hnwCouples,
      ...massAffluentCouples,
      ...singleClients.map(c => ({ ...c, household: null })),
      ...retirees.map(c => ({ ...c, household: null })),
      ...prospects.map(c => ({ ...c, household: null }))
    ];

    let clientCounter = 1;
    let householdCounter = 1;

    for (const clientGroup of allClientTypes) {
      if (clientGroup.household) {
        // Handle couples/families
        const householdId = `household-${householdCounter}`;
        const primaryClientId = `client-${clientCounter}`;
        const spouseClientId = `client-${clientCounter + 1}`;

        // Create household
        householdData.push({
          id: householdId,
          organizationId: orgId,
          name: clientGroup.household,
          primaryClientId: primaryClientId,
          jointIncome: clientGroup.jointIncome.toString(),
          jointNetWorth: clientGroup.jointNetWorth.toString()
        });

        // Create primary client
        const primaryClient = {
          id: primaryClientId,
          organizationId: orgId,
          adviserId: randomChoice(advisers).id,
          clientNumber: `CL${String(clientCounter).padStart(4, '0')}`,
          firstName: clientGroup.primary.firstName,
          lastName: clientGroup.primary.lastName,
          email: clientGroup.primary.email,
          phone: `+44 7700 90${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
          dateOfBirth: clientGroup.primary.dateOfBirth,
          nationality: 'British',
          address: {
            street: `${Math.floor(Math.random() * 200) + 1} ${randomChoice(ukStreetNames)}`,
            city: clientGroup.city.city,
            postcode: randomChoice(clientGroup.city.postcodes),
            country: 'United Kingdom'
          },
          maritalStatus: 'married',
          employmentStatus: 'employed',
          employer: clientGroup.primary.employer,
          jobTitle: clientGroup.primary.jobTitle,
          annualIncome: clientGroup.primary.annualIncome.toString(),
          netWorth: clientGroup.primary.netWorth.toString(),
          riskTolerance: clientGroup.primary.riskTolerance,
          investmentExperience: 'experienced',
          objectives: clientGroup.objectives || [
            'Retirement planning',
            'Wealth accumulation',
            'Tax efficiency'
          ],
          dependents: clientGroup.dependents || [],
          status: clientGroup.status || 'active',
          source: randomChoice(['Referral', 'Website', 'LinkedIn', 'Existing Client', 'Professional Network']),
          notes: `${clientGroup.primary.riskTolerance.charAt(0).toUpperCase() + clientGroup.primary.riskTolerance.slice(1)} investor. ${clientGroup.primary.employer} employee.`,
          lastReviewDate: randomDate(new Date('2024-06-01'), new Date('2024-12-01')),
          nextReviewDate: randomDate(new Date('2025-01-01'), new Date('2025-06-30'))
        };
        clientData.push(primaryClient);

        // Create spouse client (if exists)
        if (clientGroup.spouse) {
          const spouseClient = {
            id: spouseClientId,
            organizationId: orgId,
            adviserId: randomChoice(advisers).id,
            clientNumber: `CL${String(clientCounter + 1).padStart(4, '0')}`,
            firstName: clientGroup.spouse.firstName,
            lastName: clientGroup.spouse.lastName,
            email: clientGroup.spouse.email,
            phone: `+44 7700 90${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
            dateOfBirth: clientGroup.spouse.dateOfBirth,
            nationality: 'British',
            address: primaryClient.address, // Same address
            maritalStatus: 'married',
            employmentStatus: 'employed',
            employer: clientGroup.spouse.employer,
            jobTitle: clientGroup.spouse.jobTitle,
            annualIncome: clientGroup.spouse.annualIncome.toString(),
            netWorth: clientGroup.spouse.netWorth.toString(),
            riskTolerance: clientGroup.spouse.riskTolerance,
            investmentExperience: 'experienced',
            objectives: clientGroup.objectives || [
              'Joint retirement planning',
              'Family wealth building',
              'Education funding'
            ],
            dependents: clientGroup.dependents || [],
            status: clientGroup.status || 'active',
            source: 'Spouse referral',
            notes: `Spouse of ${primaryClient.firstName}. ${clientGroup.spouse.riskTolerance.charAt(0).toUpperCase() + clientGroup.spouse.riskTolerance.slice(1)} risk profile.`,
            lastReviewDate: primaryClient.lastReviewDate,
            nextReviewDate: primaryClient.nextReviewDate
          };
          clientData.push(spouseClient);

          // Link to household
          householdMemberData.push(
            {
              id: `hm-${clientCounter}`,
              householdId: householdId,
              clientId: primaryClientId,
              relationship: 'primary'
            },
            {
              id: `hm-${clientCounter + 1}`,
              householdId: householdId,
              clientId: spouseClientId,
              relationship: 'spouse'
            }
          );

          clientCounter += 2;
        } else {
          clientCounter += 1;
        }

        householdCounter += 1;
      } else {
        // Handle single clients
        const clientId = `client-${clientCounter}`;
        const city = clientGroup.city || randomChoice(ukCities);

        const client = {
          id: clientId,
          organizationId: orgId,
          adviserId: randomChoice(advisers).id,
          clientNumber: `CL${String(clientCounter).padStart(4, '0')}`,
          firstName: clientGroup.firstName,
          lastName: clientGroup.lastName,
          email: clientGroup.email,
          phone: `+44 7700 90${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
          dateOfBirth: clientGroup.dateOfBirth,
          nationality: 'British',
          address: {
            street: `${Math.floor(Math.random() * 200) + 1} ${randomChoice(ukStreetNames)}`,
            city: city.city,
            postcode: randomChoice(city.postcodes),
            country: 'United Kingdom'
          },
          maritalStatus: clientGroup.maritalStatus,
          employmentStatus: clientGroup.employmentStatus || 'employed',
          employer: clientGroup.employer,
          jobTitle: clientGroup.jobTitle,
          annualIncome: clientGroup.annualIncome.toString(),
          netWorth: clientGroup.netWorth.toString(),
          riskTolerance: clientGroup.riskTolerance,
          investmentExperience: 'experienced',
          objectives: clientGroup.objectives || [
            'Wealth accumulation',
            'Retirement planning',
            'Tax optimization'
          ],
          dependents: clientGroup.dependents || [],
          status: clientGroup.status || 'active',
          source: randomChoice(['Referral', 'Website', 'LinkedIn', 'Existing Client', 'Professional Network']),
          notes: `${clientGroup.riskTolerance.charAt(0).toUpperCase() + clientGroup.riskTolerance.slice(1)} investor. ${clientGroup.maritalStatus === 'single' ? 'Single' : clientGroup.maritalStatus.charAt(0).toUpperCase() + clientGroup.maritalStatus.slice(1)} client.`,
          lastReviewDate: randomDate(new Date('2024-06-01'), new Date('2024-12-01')),
          nextReviewDate: randomDate(new Date('2025-01-01'), new Date('2025-06-30'))
        };

        clientData.push(client);
        clientCounter += 1;
      }
    }

    // Insert all data
    for (const household of householdData) {
      await db.insert(households).values(household);
    }
    console.log(`✅ Created ${householdData.length} households`);

    for (const client of clientData) {
      await db.insert(clients).values(client);
    }
    console.log(`✅ Created ${clientData.length} clients`);

    for (const member of householdMemberData) {
      await db.insert(householdMembers).values(member);
    }
    console.log(`✅ Created ${householdMemberData.length} household relationships`);

    // 4. Create Portfolios for each Client
    const portfolioData = [];
    const holdingData = [];
    const transactionData = [];
    
    let portfolioCounter = 1;
    let holdingCounter = 1;
    let transactionCounter = 1;

    for (const client of clientData) {
      const clientAge = Math.floor((new Date().getTime() - new Date(client.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      const isRetired = clientAge >= 65;
      const netWorth = parseFloat(client.netWorth);
      
      // Determine number of portfolios based on wealth
      let numPortfolios = 1;
      if (netWorth > 1000000) numPortfolios = 3; // HNW: ISA, SIPP, General
      else if (netWorth > 500000) numPortfolios = 2; // Mass Affluent: ISA, SIPP or General
      
      const accountTypes = ['ISA', 'SIPP', 'General Investment'];
      const providers = ['Hargreaves Lansdown', 'AJ Bell', 'Interactive Investor', 'Charles Stanley', 'Vanguard Investor'];
      
      for (let i = 0; i < numPortfolios; i++) {
        const portfolioId = `portfolio-${portfolioCounter}`;
        const accountType = accountTypes[i];
        const portfolioValue = netWorth * (i === 0 ? 0.4 : i === 1 ? 0.35 : 0.25); // Split wealth across portfolios
        
        // Determine allocation based on age and risk tolerance
        let allocation;
        if (client.riskTolerance === 'conservative' || isRetired) {
          allocation = { equities: 30, bonds: 55, cash: 10, alternatives: 5 };
        } else if (client.riskTolerance === 'moderate') {
          allocation = { equities: 60, bonds: 30, cash: 5, alternatives: 5 };
        } else { // aggressive
          allocation = { equities: 80, bonds: 10, cash: 5, alternatives: 5 };
        }

        const portfolio = {
          id: portfolioId,
          clientId: client.id,
          name: `${accountType} Portfolio`,
          description: `${client.riskTolerance.charAt(0).toUpperCase() + client.riskTolerance.slice(1)} ${accountType} portfolio`,
          accountType: accountType,
          provider: randomChoice(providers),
          accountNumber: `AC${Math.floor(Math.random() * 10000000)}`,
          totalValue: Math.round(portfolioValue).toString(),
          currency: 'GBP',
          modelPortfolio: `${client.riskTolerance.charAt(0).toUpperCase() + client.riskTolerance.slice(1)} Growth`,
          assetAllocation: allocation,
          benchmarkIndex: client.riskTolerance === 'aggressive' ? 'MSCI World Index' : 
                          client.riskTolerance === 'moderate' ? '60/40 Balanced Index' : 'UK Income Index',
          isActive: true
        };
        
        portfolioData.push(portfolio);
        
        // Create holdings for this portfolio
        const equityValue = portfolioValue * (allocation.equities / 100);
        const bondValue = portfolioValue * (allocation.bonds / 100);
        const cashValue = portfolioValue * (allocation.cash / 100);
        const altValue = portfolioValue * (allocation.alternatives / 100);
        
        // Add equity holdings
        const numEquityHoldings = Math.min(6, Math.max(3, Math.floor(equityValue / 50000)));
        const selectedEquities = randomChoices(ukEquityHoldings, numEquityHoldings);
        
        let remainingEquityValue = equityValue;
        for (let j = 0; j < selectedEquities.length; j++) {
          const holding = selectedEquities[j];
          const isLastHolding = j === selectedEquities.length - 1;
          const holdingValue = isLastHolding ? remainingEquityValue : equityValue / numEquityHoldings;
          const currentPrice = randomBetween(holding.priceRange[0], holding.priceRange[1]);
          const quantity = holdingValue / currentPrice;
          const averageCost = currentPrice * randomBetween(0.85, 1.15); // Some profit/loss
          
          holdingData.push({
            id: `holding-${holdingCounter++}`,
            portfolioId: portfolioId,
            symbol: holding.symbol,
            name: holding.name,
            assetClass: 'equity',
            sector: holding.sector,
            region: holding.region,
            quantity: quantity.toFixed(6),
            averageCost: averageCost.toFixed(4),
            currentPrice: currentPrice.toFixed(4),
            marketValue: holdingValue.toFixed(2),
            unrealizedGainLoss: ((currentPrice - averageCost) * quantity).toFixed(2),
            weight: ((holdingValue / portfolioValue) * 100).toFixed(2),
            lastUpdated: new Date(),
            createdAt: new Date()
          });
          
          remainingEquityValue -= holdingValue;
        }
        
        // Add bond holdings
        if (bondValue > 10000) {
          const numBondHoldings = Math.min(3, Math.max(1, Math.floor(bondValue / 30000)));
          const selectedBonds = randomChoices(ukBondHoldings, numBondHoldings);
          
          let remainingBondValue = bondValue;
          for (let j = 0; j < selectedBonds.length; j++) {
            const bond = selectedBonds[j];
            const isLastHolding = j === selectedBonds.length - 1;
            const holdingValue = isLastHolding ? remainingBondValue : bondValue / numBondHoldings;
            const currentPrice = randomBetween(bond.priceRange[0], bond.priceRange[1]);
            const quantity = holdingValue / currentPrice;
            const averageCost = currentPrice * randomBetween(0.95, 1.05); // Less volatility for bonds
            
            holdingData.push({
              id: `holding-${holdingCounter++}`,
              portfolioId: portfolioId,
              symbol: bond.symbol,
              name: bond.name,
              assetClass: 'bond',
              sector: bond.sector,
              region: bond.region,
              quantity: quantity.toFixed(6),
              averageCost: averageCost.toFixed(4),
              currentPrice: currentPrice.toFixed(4),
              marketValue: holdingValue.toFixed(2),
              unrealizedGainLoss: ((currentPrice - averageCost) * quantity).toFixed(2),
              weight: ((holdingValue / portfolioValue) * 100).toFixed(2),
              lastUpdated: new Date(),
              createdAt: new Date()
            });
            
            remainingBondValue -= holdingValue;
          }
        }
        
        // Add cash holding
        if (cashValue > 1000) {
          holdingData.push({
            id: `holding-${holdingCounter++}`,
            portfolioId: portfolioId,
            symbol: 'CASH',
            name: 'Cash - GBP',
            assetClass: 'cash',
            sector: 'Cash',
            region: 'UK',
            quantity: cashValue.toFixed(6),
            averageCost: '1.0000',
            currentPrice: '1.0000',
            marketValue: cashValue.toFixed(2),
            unrealizedGainLoss: '0.00',
            weight: ((cashValue / portfolioValue) * 100).toFixed(2),
            lastUpdated: new Date(),
            createdAt: new Date()
          });
        }
        
        // Add some historical transactions for this portfolio
        const numTransactions = Math.floor(Math.random() * 20) + 5; // 5-25 transactions
        for (let k = 0; k < numTransactions; k++) {
          const transactionDate = randomDate(new Date('2024-01-01'), new Date('2024-12-15'));
          const transactionTypes = ['buy', 'sell', 'dividend', 'deposit', 'fee'];
          const transactionType = randomChoice(transactionTypes);
          
          let transaction;
          if (transactionType === 'dividend') {
            transaction = {
              id: `tx-${transactionCounter++}`,
              portfolioId: portfolioId,
              type: 'dividend',
              symbol: randomChoice(selectedEquities || ukEquityHoldings).symbol,
              quantity: null,
              price: null,
              amount: randomBetween(50, 500).toFixed(2),
              fees: '0.00',
              netAmount: randomBetween(50, 500).toFixed(2),
              tradeDate: transactionDate,
              settlementDate: new Date(transactionDate.getTime() + 2 * 24 * 60 * 60 * 1000), // T+2
              description: 'Dividend payment',
              reference: `DIV${Math.floor(Math.random() * 1000000)}`
            };
          } else if (transactionType === 'deposit') {
            transaction = {
              id: `tx-${transactionCounter++}`,
              portfolioId: portfolioId,
              type: 'deposit',
              symbol: null,
              quantity: null,
              price: null,
              amount: randomBetween(1000, 10000).toFixed(2),
              fees: '0.00',
              netAmount: randomBetween(1000, 10000).toFixed(2),
              tradeDate: transactionDate,
              settlementDate: transactionDate,
              description: 'Cash deposit',
              reference: `DEP${Math.floor(Math.random() * 1000000)}`
            };
          } else {
            const holding = randomChoice(selectedEquities || ukEquityHoldings);
            const tradeQuantity = randomBetween(10, 100);
            const tradePrice = randomBetween(holding.priceRange[0], holding.priceRange[1]);
            const grossAmount = tradeQuantity * tradePrice;
            const fees = grossAmount * 0.001; // 0.1% fee
            
            transaction = {
              id: `tx-${transactionCounter++}`,
              portfolioId: portfolioId,
              type: transactionType,
              symbol: holding.symbol,
              quantity: tradeQuantity.toFixed(6),
              price: tradePrice.toFixed(4),
              amount: grossAmount.toFixed(2),
              fees: fees.toFixed(2),
              netAmount: (transactionType === 'buy' ? grossAmount + fees : grossAmount - fees).toFixed(2),
              tradeDate: transactionDate,
              settlementDate: new Date(transactionDate.getTime() + 2 * 24 * 60 * 60 * 1000), // T+2
              description: `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} ${holding.name}`,
              reference: `TXN${Math.floor(Math.random() * 1000000)}`
            };
          }
          
          transactionData.push(transaction);
        }
        
        portfolioCounter++;
      }
    }

    // Insert portfolio data
    for (const portfolio of portfolioData) {
      await db.insert(portfolios).values(portfolio);
    }
    console.log(`✅ Created ${portfolioData.length} portfolios`);

    for (const holding of holdingData) {
      await db.insert(holdings).values(holding);
    }
    console.log(`✅ Created ${holdingData.length} holdings`);

    for (const transaction of transactionData) {
      await db.insert(portfolioTransactions).values(transaction);
    }
    console.log(`✅ Created ${transactionData.length} transactions`);

    // 5. Create Financial Scenarios for Clients
    const scenarioData = [];
    const goalData = [];
    
    let scenarioCounter = 1;
    let goalCounter = 1;

    for (const client of clientData) {
      const clientAge = Math.floor((new Date().getTime() - new Date(client.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      const annualIncome = parseFloat(client.annualIncome);
      const netWorth = parseFloat(client.netWorth);
      const hasChildren = client.dependents && client.dependents.length > 0;
      
      // Retirement scenario
      if (clientAge < 65) {
        const retirementAge = client.riskTolerance === 'aggressive' ? 55 : 
                             client.riskTolerance === 'moderate' ? 60 : 65;
        const currentSavings = netWorth * 0.8; // Assume 80% is investable
        const monthlyContribution = annualIncome * 0.15 / 12; // 15% savings rate
        const expectedReturn = client.riskTolerance === 'aggressive' ? 8.5 : 
                              client.riskTolerance === 'moderate' ? 7.0 : 5.5;
        
        // Simple compound interest calculation
        const yearsToRetirement = retirementAge - clientAge;
        const monthlyReturn = expectedReturn / 100 / 12;
        const projectedValue = currentSavings * Math.pow(1 + expectedReturn/100, yearsToRetirement) + 
                              monthlyContribution * (Math.pow(1 + monthlyReturn, yearsToRetirement * 12) - 1) / monthlyReturn;
        const projectedIncome = projectedValue * 0.04; // 4% withdrawal rule
        
        scenarioData.push({
          id: `scenario-${scenarioCounter++}`,
          clientId: client.id,
          name: `Retirement at ${retirementAge}`,
          description: `Retirement planning scenario targeting age ${retirementAge}`,
          type: 'retirement',
          currentAge: clientAge,
          targetAge: retirementAge,
          currentSavings: Math.round(currentSavings).toString(),
          monthlyContribution: Math.round(monthlyContribution).toString(),
          expectedReturn: expectedReturn.toFixed(2),
          inflationRate: '2.5',
          targetAmount: null,
          projectedValue: Math.round(projectedValue).toString(),
          projectedIncome: Math.round(projectedIncome/12).toString(), // Monthly income
          assumptions: {
            inflationRate: 2.5,
            withdrawalRate: 4.0,
            contributionIncreases: true,
            statepension: clientAge < 45 ? 0 : 9000 // Assume no state pension for younger people
          },
          results: {
            probability: client.riskTolerance === 'aggressive' ? 85 : 
                        client.riskTolerance === 'moderate' ? 90 : 92,
            shortfall: projectedIncome < annualIncome * 0.7 ? (annualIncome * 0.7 - projectedIncome) : 0
          },
          isActive: true
        });
      }
      
      // Children's education scenarios
      if (hasChildren) {
        for (const child of client.dependents) {
          if (child.relationship === 'daughter' || child.relationship === 'son') {
            const childAge = child.age;
            const yearsToUniversity = Math.max(0, 18 - childAge);
            
            if (yearsToUniversity > 0) {
              const educationCost = 75000; // £25k per year for 3 years
              const monthlyContribution = yearsToUniversity > 0 ? educationCost / (yearsToUniversity * 12) : 0;
              const expectedReturn = 6.0; // Conservative for education planning
              
              scenarioData.push({
                id: `scenario-${scenarioCounter++}`,
                clientId: client.id,
                name: `${child.name} University Fund`,
                description: `Education funding for ${child.name}`,
                type: 'education',
                currentAge: clientAge,
                targetAge: clientAge + yearsToUniversity,
                currentSavings: '0',
                monthlyContribution: Math.round(monthlyContribution).toString(),
                expectedReturn: expectedReturn.toFixed(2),
                inflationRate: '3.0', // Higher for education costs
                targetAmount: educationCost.toString(),
                projectedValue: Math.round(monthlyContribution * 12 * yearsToUniversity * 1.06).toString(),
                projectedIncome: null,
                assumptions: {
                  courseCost: 25000,
                  duration: 3,
                  inflationRate: 3.0,
                  accommodationCosts: 8000
                },
                results: {
                  probability: 95,
                  surplus: 0
                },
                isActive: true
              });
            }
          }
        }
      }
      
      // House purchase scenario for younger clients
      if (clientAge < 40 && client.maritalStatus !== 'divorced' && netWorth < 500000) {
        const housePrice = client.address.city === 'London' ? 750000 : 350000;
        const depositRequired = housePrice * 0.2; // 20% deposit
        const currentSavings = netWorth * 0.3; // Available for house deposit
        const monthlyContribution = annualIncome * 0.1 / 12; // 10% for house savings
        const yearsToTarget = Math.max(1, Math.ceil((depositRequired - currentSavings) / (monthlyContribution * 12)));
        
        scenarioData.push({
          id: `scenario-${scenarioCounter++}`,
          clientId: client.id,
          name: 'House Purchase',
          description: 'Saving for first home deposit',
          type: 'house_purchase',
          currentAge: clientAge,
          targetAge: clientAge + yearsToTarget,
          currentSavings: Math.round(currentSavings).toString(),
          monthlyContribution: Math.round(monthlyContribution).toString(),
          expectedReturn: '4.0', // Conservative for house deposits
          inflationRate: '2.5',
          targetAmount: Math.round(depositRequired).toString(),
          projectedValue: Math.round(currentSavings + monthlyContribution * 12 * yearsToTarget * 1.04).toString(),
          projectedIncome: null,
          assumptions: {
            housePrice: housePrice,
            depositPercentage: 20,
            mortgageRate: 5.5,
            stampDuty: housePrice > 500000 ? housePrice * 0.05 : housePrice * 0.02
          },
          results: {
            probability: 90,
            timeToTarget: yearsToTarget
          },
          isActive: true
        });
      }
      
      // Create financial goals
      for (const objective of client.objectives) {
        const targetAmount = objective.toLowerCase().includes('retirement') ? 1000000 :
                            objective.toLowerCase().includes('education') ? 75000 :
                            objective.toLowerCase().includes('house') || objective.toLowerCase().includes('property') ? 150000 :
                            objective.toLowerCase().includes('emergency') ? annualIncome * 0.5 : 100000;
        
        const targetYears = objective.toLowerCase().includes('retirement') ? (65 - clientAge) :
                           objective.toLowerCase().includes('education') ? 10 : 5;
        
        goalData.push({
          id: `goal-${goalCounter++}`,
          clientId: client.id,
          name: objective,
          description: `Financial goal: ${objective}`,
          targetAmount: Math.round(targetAmount).toString(),
          currentAmount: Math.round(targetAmount * Math.random() * 0.3).toString(), // 0-30% progress
          targetDate: new Date(new Date().getFullYear() + targetYears, 11, 31),
          priority: randomChoice(['high', 'medium', 'low']),
          status: randomChoice(['active', 'active', 'active', 'paused']) // Mostly active
        });
      }
    }

    // Insert scenario and goal data
    for (const scenario of scenarioData) {
      await db.insert(scenarios).values(scenario);
    }
    console.log(`✅ Created ${scenarioData.length} scenarios`);

    for (const goal of goalData) {
      await db.insert(financialGoals).values(goal);
    }
    console.log(`✅ Created ${goalData.length} financial goals`);

    // 6. Create Compliance Tasks, Meetings, and Additional Data
    const complianceTaskData = [];
    const meetingData = [];
    const reportData = [];
    const notificationData = [];
    const auditData = [];
    const pipelineStageData = [];
    const pipelineData = [];
    const kpiData = [];
    
    let taskCounter = 1;
    let meetingCounter = 1;
    let reportCounter = 1;
    let notificationCounter = 1;
    let auditCounter = 1;

    const taskTypes = ['kyc', 'suitability', 'annual_review', 'fact_find', 'risk_assessment', 'mifid_assessment', 'crs_reporting'];
    const taskCategories = ['compliance', 'client_service', 'regulatory', 'administrative'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['pending', 'in_progress', 'completed', 'overdue'];

    for (const client of clientData) {
      const clientAdviser = advisers.find(a => a.id === client.adviserId);
      
      // Create various compliance tasks per client
      const numTasks = Math.floor(Math.random() * 8) + 3; // 3-10 tasks per client
      
      for (let i = 0; i < numTasks; i++) {
        const taskType = randomChoice(taskTypes);
        const status = randomChoice(statuses);
        const priority = status === 'overdue' ? 'urgent' : randomChoice(priorities);
        
        const createdDate = randomDate(new Date('2024-01-01'), new Date('2024-11-01'));
        const dueDate = new Date(createdDate);
        dueDate.setDate(dueDate.getDate() + (taskType === 'annual_review' ? 365 : 
                                           taskType === 'kyc' ? 30 : 
                                           taskType === 'fact_find' ? 14 : 60));
        
        const isOverdue = status === 'overdue' || (new Date() > dueDate && status !== 'completed');
        
        complianceTaskData.push({
          id: `task-${taskCounter++}`,
          organizationId: orgId,
          clientId: client.id,
          assignedTo: clientAdviser?.id || advisers[0].id,
          createdBy: advisers[0].id, // Admin created
          type: taskType,
          category: randomChoice(taskCategories),
          title: getTaskTitle(taskType, client),
          description: getTaskDescription(taskType, client),
          priority: priority,
          status: isOverdue ? 'overdue' : status,
          dueDate: dueDate,
          completedAt: status === 'completed' ? randomDate(createdDate, new Date()) : null,
          completedBy: status === 'completed' ? (clientAdviser?.id || advisers[0].id) : null,
          notes: status === 'completed' ? 'Task completed successfully' : 
                 status === 'in_progress' ? 'Work in progress' : null,
          attachments: [],
          recurrenceRule: null,
          parentTaskId: null,
          createdAt: createdDate,
          updatedAt: status === 'completed' ? randomDate(createdDate, new Date()) : createdDate
        });
      }
      
      // Create meetings for active clients
      if (client.status === 'active') {
        const numMeetings = Math.floor(Math.random() * 4) + 1; // 1-4 meetings
        
        for (let i = 0; i < numMeetings; i++) {
          const meetingDate = randomDate(new Date('2024-06-01'), new Date('2025-03-31'));
          const isPast = meetingDate < new Date();
          
          meetingData.push({
            id: `meeting-${meetingCounter++}`,
            organizationId: orgId,
            clientId: client.id,
            adviserId: client.adviserId,
            title: randomChoice([
              'Annual Review Meeting',
              'Portfolio Review',
              'Financial Planning Discussion',
              'Investment Strategy Update',
              'Compliance Review'
            ]),
            description: 'Comprehensive review of client\'s financial situation and investment strategy',
            type: randomChoice(['annual_review', 'portfolio_review', 'ad_hoc', 'phone_call']),
            location: randomChoice(['Office', 'Client Location', 'Video Call', 'Phone']),
            scheduledAt: meetingDate,
            duration: randomChoice([30, 60, 90, 120]), // minutes
            status: isPast ? randomChoice(['completed', 'completed', 'completed', 'cancelled']) : 
                    meetingDate.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 ? 'completed' : 'scheduled',
            attendees: [client.adviserId],
            agenda: [
              'Review current portfolio performance',
              'Discuss any changes in circumstances',
              'Review financial goals and progress',
              'Consider rebalancing opportunities',
              'Next steps and action items'
            ],
            notes: isPast ? 'Meeting completed successfully. Client satisfied with portfolio performance.' : null,
            actionItems: isPast ? [
              'Send updated portfolio report',
              'Research ESG investment options',
              'Schedule next review in 6 months'
            ] : [],
            nextMeetingDate: isPast ? new Date(meetingDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000) : null, // 6 months later
            createdAt: new Date(meetingDate.getTime() - 14 * 24 * 60 * 60 * 1000), // Created 2 weeks before
            updatedAt: isPast ? meetingDate : new Date(meetingDate.getTime() - 14 * 24 * 60 * 60 * 1000)
          });
        }
      }
      
      // Create reports for clients
      if (client.status === 'active') {
        const numReports = Math.floor(Math.random() * 6) + 2; // 2-7 reports
        
        for (let i = 0; i < numReports; i++) {
          const reportDate = randomDate(new Date('2024-01-01'), new Date('2024-12-01'));
          
          reportData.push({
            id: `report-${reportCounter++}`,
            organizationId: orgId,
            clientId: client.id,
            createdBy: client.adviserId,
            type: randomChoice(['portfolio_review', 'financial_plan', 'suitability', 'compliance']),
            title: `${randomChoice(['Quarterly', 'Monthly', 'Annual'])} Portfolio Report - ${client.firstName} ${client.lastName}`,
            description: 'Comprehensive portfolio and performance analysis',
            templateId: null,
            data: {
              portfolioValue: parseFloat(client.netWorth) * randomBetween(0.95, 1.05),
              performance: {
                quarter: randomBetween(-5, 15),
                ytd: randomBetween(-10, 25),
                oneYear: randomBetween(-15, 30)
              },
              benchmark: {
                quarter: randomBetween(-3, 12),
                ytd: randomBetween(-8, 20),
                oneYear: randomBetween(-12, 25)
              }
            },
            settings: {
              includePerformance: true,
              includeHoldings: true,
              includeProjections: false
            },
            status: 'generated',
            filePath: `/reports/${client.id}/portfolio_report_${reportDate.getFullYear()}_${reportDate.getMonth() + 1}.pdf`,
            sentAt: reportDate,
            sentTo: [client.email],
            createdAt: reportDate,
            updatedAt: reportDate
          });
        }
      }
    }

    // 7. Create Pipeline Stages and Client Pipeline Data
    const pipelineStages = [
      { name: 'Data Collection', position: 1, color: '#EF4444', description: 'Gathering client information and documentation' },
      { name: 'Fact Finding', position: 2, color: '#F97316', description: 'Comprehensive fact find and objectives discussion' },
      { name: 'Modelling', position: 3, color: '#EAB308', description: 'Financial planning and investment modelling' },
      { name: 'Report Preparation', position: 4, color: '#22C55E', description: 'Preparing suitability and recommendation reports' },
      { name: 'Report Review', position: 5, color: '#3B82F6', description: 'Client review of recommendations' },
      { name: 'Implementation', position: 6, color: '#8B5CF6', description: 'Implementing agreed recommendations' },
      { name: 'Ongoing Review', position: 7, color: '#6B7280', description: 'Regular portfolio and goal reviews' }
    ];

    for (const stage of pipelineStages) {
      const stageId = `stage-${stage.position}`;
      pipelineStageData.push({
        id: stageId,
        organizationId: orgId,
        name: stage.name,
        description: stage.description,
        position: stage.position,
        color: stage.color,
        isActive: true
      });
    }

    // Create pipeline data for clients
    for (const client of clientData) {
      const clientStage = client.status === 'prospect' ? 
        randomChoice(pipelineStageData.slice(0, 3)) : // Prospects in early stages
        client.status === 'active' ? 
        randomChoice(pipelineStageData.slice(5)) : // Active clients in later stages
        randomChoice(pipelineStageData.slice(2, 5)); // Others in middle stages
      
      const stageEntryDate = randomDate(new Date('2024-06-01'), new Date());
      const completionPercentage = client.status === 'active' ? 
        randomBetween(80, 100) :
        client.status === 'prospect' ? 
        randomBetween(20, 60) : 
        randomBetween(40, 80);
      
      pipelineData.push({
        id: `pipeline-${client.id}`,
        organizationId: orgId,
        clientId: client.id,
        stageId: clientStage.id,
        enteredAt: stageEntryDate,
        expectedCompletionDate: client.status === 'prospect' ? 
          new Date(stageEntryDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days for prospects
        notes: client.status === 'prospect' ? 'New prospect in onboarding process' : 
               client.status === 'active' ? 'Long-term client with regular reviews' : 
               'Standard client workflow',
        assignedTo: client.adviserId,
        completionPercentage: Math.round(completionPercentage),
        priority: client.status === 'prospect' ? 'high' : 
                 completionPercentage < 50 ? 'medium' : 'low'
      });
    }

    // Create system notifications using enhancedNotifications schema
    for (const user of advisers) {
      const numNotifications = Math.floor(Math.random() * 10) + 5; // 5-15 notifications per user
      
      for (let i = 0; i < numNotifications; i++) {
        const notificationDate = randomDate(new Date('2024-11-01'), new Date());
        const isRead = Math.random() > 0.3; // 70% read rate
        const client = randomChoice(clientData);
        const notificationType = randomChoice(['task_due', 'review_reminder', 'system_update', 'pipeline_update']);
        
        notificationData.push({
          id: `notification-${notificationCounter++}`,
          organizationId: orgId,
          userId: user.id,
          title: getNotificationTitle(notificationType),
          message: getNotificationMessage(notificationType, client),
          type: notificationType,
          category: randomChoice(['urgent', 'important', 'info', 'success']),
          priority: randomChoice(priorities),
          relatedResourceType: 'client',
          relatedResourceId: client.id,
          actionUrl: getNotificationActionUrl(notificationType),
          actionLabel: getNotificationActionLabel(notificationType),
          isRead: isRead,
          isPinned: Math.random() > 0.9, // 10% pinned rate
          expiresAt: new Date(notificationDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
          metadata: {
            clientName: `${client.firstName} ${client.lastName}`,
            priority: randomChoice(priorities),
            source: 'system'
          },
          createdAt: notificationDate,
          readAt: isRead ? randomDate(notificationDate, new Date()) : null
        });
      }
    }

    // 8. Create Audit Logs for comprehensive tracking
    const auditActions = [
      'create', 'update', 'delete', 'login', 'logout', 'view', 'download', 'upload'
    ];
    const resourceTypes = [
      'client', 'portfolio', 'holding', 'scenario', 'task', 'meeting', 'report', 'user'
    ];

    for (let i = 0; i < 150; i++) { // 150 audit entries
      const auditDate = randomDate(new Date('2024-09-01'), new Date());
      const user = randomChoice(advisers);
      const client = Math.random() > 0.5 ? randomChoice(clientData) : null;
      const action = randomChoice(auditActions);
      const resourceType = randomChoice(resourceTypes);
      
      auditData.push({
        id: `audit-${auditCounter++}`,
        organizationId: orgId,
        userId: user.id,
        action: action,
        resourceType: resourceType,
        resourceId: client?.id || null,
        oldValues: action === 'update' ? { status: 'prospect', riskTolerance: 'moderate' } : null,
        newValues: action === 'update' ? { status: 'active', riskTolerance: 'aggressive' } : 
                   action === 'create' ? { name: client ? `${client.firstName} ${client.lastName}` : 'New Resource' } : null,
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: auditDate
      });
    }

    // 9. Create KPI Historical Data
    const kpiMetricTypes = [
      'total_clients', 'total_aum', 'avg_portfolio_performance', 'pipeline_value', 
      'completed_tasks', 'new_clients', 'revenue', 'client_satisfaction'
    ];
    
    const startDate = new Date('2024-01-01');
    const endDate = new Date();
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (const metricType of kpiMetricTypes) {
      for (let day = 0; day < daysDiff; day += 7) { // Weekly KPI data
        const recordDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
        const baseValue = getKpiBaseValue(metricType, clientData.length);
        const seasonalFactor = 1 + 0.1 * Math.sin((day / 365) * 2 * Math.PI); // Seasonal variation
        const randomFactor = 0.95 + Math.random() * 0.1; // Random variation ±5%
        const value = baseValue * seasonalFactor * randomFactor;
        const previousValue = day > 0 ? value * (0.95 + Math.random() * 0.1) : null;
        
        kpiData.push({
          id: `kpi-${metricType}-${day}`,
          organizationId: orgId,
          metricType: metricType,
          value: value.toFixed(2),
          previousValue: previousValue?.toFixed(2) || null,
          changePercentage: previousValue ? (((value - previousValue) / previousValue) * 100).toFixed(2) : null,
          period: 'weekly',
          recordDate: recordDate,
          metadata: {
            calculatedAt: recordDate,
            dataPoints: Math.floor(Math.random() * 50) + 10,
            confidence: 0.85 + Math.random() * 0.15
          }
        });
      }
    }

    // Insert all the remaining data
    for (const task of complianceTaskData) {
      await db.insert(complianceTasks).values(task);
    }
    console.log(`✅ Created ${complianceTaskData.length} compliance tasks`);

    for (const meeting of meetingData) {
      await db.insert(meetings).values(meeting);
    }
    console.log(`✅ Created ${meetingData.length} meetings`);

    for (const report of reportData) {
      await db.insert(reports).values(report);
    }
    console.log(`✅ Created ${reportData.length} reports`);

    // Insert pipeline stages first
    for (const stage of pipelineStageData) {
      await db.insert(clientPipelineStages).values(stage);
    }
    console.log(`✅ Created ${pipelineStageData.length} pipeline stages`);

    // Then pipeline data
    for (const pipeline of pipelineData) {
      await db.insert(clientPipeline).values(pipeline);
    }
    console.log(`✅ Created ${pipelineData.length} pipeline entries`);

    for (const notification of notificationData) {
      await db.insert(enhancedNotifications).values(notification);
    }
    console.log(`✅ Created ${notificationData.length} notifications`);

    for (const audit of auditData) {
      await db.insert(auditLog).values(audit);
    }
    console.log(`✅ Created ${auditData.length} audit log entries`);

    for (const kpi of kpiData) {
      await db.insert(kpiMetrics).values(kpi);
    }
    console.log(`✅ Created ${kpiData.length} KPI data points`);

    console.log("🎉 Comprehensive financial data seeding completed successfully!");
    console.log(`📊 Summary:
    - Organizations: 1
    - Users: ${advisers.length}
    - Clients: ${clientData.length}
    - Households: ${householdData.length}
    - Portfolios: ${portfolioData.length}
    - Holdings: ${holdingData.length}
    - Transactions: ${transactionData.length}
    - Scenarios: ${scenarioData.length}
    - Goals: ${goalData.length}
    - Tasks: ${complianceTaskData.length}
    - Meetings: ${meetingData.length}
    - Reports: ${reportData.length}
    - Notifications: ${notificationData.length}
    - Activities: ${activityData.length}`);

  } catch (error) {
    console.error("❌ Error seeding financial data:", error);
    throw error;
  }
}

// Helper functions
function getTaskTitle(taskType: string, client: any): string {
  const clientName = `${client.firstName} ${client.lastName}`;
  switch (taskType) {
    case 'kyc': return `KYC Review - ${clientName}`;
    case 'suitability': return `Suitability Assessment - ${clientName}`;
    case 'annual_review': return `Annual Review - ${clientName}`;
    case 'fact_find': return `Fact Find Update - ${clientName}`;
    case 'risk_assessment': return `Risk Profile Assessment - ${clientName}`;
    case 'mifid_assessment': return `MiFID II Assessment - ${clientName}`;
    case 'crs_reporting': return `CRS Reporting - ${clientName}`;
    default: return `Compliance Task - ${clientName}`;
  }
}

function getTaskDescription(taskType: string, client: any): string {
  switch (taskType) {
    case 'kyc': return 'Complete Know Your Customer review and update documentation';
    case 'suitability': return 'Assess investment suitability based on current circumstances';
    case 'annual_review': return 'Conduct comprehensive annual portfolio and goals review';
    case 'fact_find': return 'Update client fact find with current financial information';
    case 'risk_assessment': return 'Review and update client risk tolerance and capacity';
    case 'mifid_assessment': return 'Complete MiFID II client assessment and categorization';
    case 'crs_reporting': return 'Complete Common Reporting Standard documentation';
    default: return 'Complete required compliance task';
  }
}

function getTaskChecklist(taskType: string): any[] {
  const checklists = {
    kyc: [
      { item: 'Verify identity documents', completed: true },
      { item: 'Check address verification', completed: true },
      { item: 'Review source of funds', completed: false },
      { item: 'Update sanctions screening', completed: false }
    ],
    suitability: [
      { item: 'Review investment objectives', completed: true },
      { item: 'Assess risk tolerance', completed: true },
      { item: 'Evaluate investment experience', completed: false },
      { item: 'Document suitability decision', completed: false }
    ],
    annual_review: [
      { item: 'Review portfolio performance', completed: true },
      { item: 'Assess goal progress', completed: false },
      { item: 'Update financial circumstances', completed: false },
      { item: 'Document recommendations', completed: false },
      { item: 'Schedule next review', completed: false }
    ]
  };
  
  return checklists[taskType as keyof typeof checklists] || [
    { item: 'Complete task requirements', completed: false },
    { item: 'Document outcomes', completed: false }
  ];
}

function getTaskEstimatedHours(taskType: string): number {
  const hours = {
    kyc: 2,
    suitability: 3,
    annual_review: 4,
    fact_find: 1.5,
    risk_assessment: 2,
    mifid_assessment: 1,
    crs_reporting: 0.5
  };
  
  return hours[taskType as keyof typeof hours] || 2;
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'task_due': return 'Task Due Reminder';
    case 'review_reminder': return 'Client Review Due';
    case 'system_update': return 'System Update Available';
    case 'pipeline_update': return 'Pipeline Status Changed';
    default: return 'System Notification';
  }
}

function getNotificationMessage(type: string, client: any): string {
  const clientName = `${client.firstName} ${client.lastName}`;
  switch (type) {
    case 'task_due': return `Compliance task for ${clientName} is due within 3 days.`;
    case 'review_reminder': return `Annual review for ${clientName} is scheduled for next week.`;
    case 'system_update': return 'New platform features are available. Please review the updates.';
    case 'pipeline_update': return `${clientName} has progressed to the next pipeline stage.`;
    default: return 'This is a system-generated notification.';
  }
}

function getNotificationActionUrl(type: string): string {
  switch (type) {
    case 'task_due': return '/dashboard/tasks';
    case 'review_reminder': return '/dashboard/meetings';
    case 'system_update': return '/dashboard/settings';
    case 'pipeline_update': return '/dashboard/pipeline';
    default: return '/dashboard';
  }
}

function getNotificationActionLabel(type: string): string {
  switch (type) {
    case 'task_due': return 'View Tasks';
    case 'review_reminder': return 'Schedule Meeting';
    case 'system_update': return 'View Updates';
    case 'pipeline_update': return 'View Pipeline';
    default: return 'View Details';
  }
}

function getKpiBaseValue(metricType: string, clientCount: number): number {
  switch (metricType) {
    case 'total_clients': return clientCount;
    case 'total_aum': return clientCount * 650000; // Average portfolio value
    case 'avg_portfolio_performance': return 8.5; // 8.5% average return
    case 'pipeline_value': return clientCount * 25000; // Average pipeline value per client
    case 'completed_tasks': return clientCount * 2.5; // Tasks completed per week
    case 'new_clients': return Math.max(1, Math.floor(clientCount * 0.1)); // 10% new client growth
    case 'revenue': return clientCount * 8500; // Average revenue per client
    case 'client_satisfaction': return 4.2; // Out of 5
    default: return 100;
  }
}

// Export the function for use in other modules
export { seedFinancialData };

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFinancialData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding financial database:", error);
      process.exit(1);
    });
}