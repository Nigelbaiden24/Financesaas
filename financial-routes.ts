import type { Express } from "express";
import { z } from 'zod';
import { authenticate, authorize, requireOrganization, AuthenticatedRequest } from './financial-auth';
import { AuthAdapter, createAdminUser } from './auth-adapter';
import { FinancialDatabaseStorage, type IFinancialStorage } from './financial-storage';
import { insertComplianceTaskSchema } from '@shared/schema';

// Temporary storage for financial planning data (will be replaced with proper DB)
const tempStorage = {
  clients: new Map(),
  portfolios: new Map(),
  holdings: new Map(),
  scenarios: new Map(),
  complianceTasks: new Map(),
  meetings: new Map(),
};

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Sample data for demonstration
const sampleClients = [
  {
    id: 'client-1',
    organizationId: 'temp-org-admin',
    adviserId: 'admin',
    clientNumber: 'CL001',
    firstName: 'John',
    lastName: 'Anderson',
    email: 'john.anderson@email.com',
    phone: '07700 900123',
    dateOfBirth: '1978-05-15',
    employmentStatus: 'employed',
    annualIncome: 75000,
    netWorth: 485000,
    riskTolerance: 'moderate',
    status: 'active',
    lastReviewDate: '2024-11-15',
    nextReviewDate: '2025-05-15',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'client-2',
    organizationId: 'temp-org-admin',
    adviserId: 'admin',
    clientNumber: 'CL002',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@email.com',
    phone: '07700 900124',
    dateOfBirth: '1985-08-22',
    employmentStatus: 'self-employed',
    annualIncome: 95000,
    netWorth: 750000,
    riskTolerance: 'aggressive',
    status: 'active',
    lastReviewDate: '2024-12-01',
    nextReviewDate: '2025-06-01',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'client-3',
    organizationId: 'temp-org-admin',
    adviserId: 'admin',
    clientNumber: 'CL003',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    phone: '07700 900125',
    dateOfBirth: '1965-12-10',
    employmentStatus: 'retired',
    annualIncome: 25000,
    netWorth: 320000,
    riskTolerance: 'conservative',
    status: 'prospect',
    lastReviewDate: '2024-12-10',
    nextReviewDate: '2025-01-10',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const samplePortfolios = [
  {
    id: 'portfolio-1',
    clientId: 'client-1',
    name: 'Growth Portfolio',
    accountType: 'General Investment',
    provider: 'Interactive Investor',
    totalValue: 485000,
    currency: 'GBP',
    assetAllocation: { equities: 65, bonds: 25, cash: 5, alternatives: 5 },
    performance: { ytd: 8.2, oneYear: 12.5, threeYear: 7.8 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'portfolio-2',
    clientId: 'client-2',
    name: 'Aggressive Growth',
    accountType: 'ISA',
    provider: 'Hargreaves Lansdown',
    totalValue: 750000,
    currency: 'GBP',
    assetAllocation: { equities: 80, bonds: 10, cash: 5, alternatives: 5 },
    performance: { ytd: 15.1, oneYear: 18.7, threeYear: 11.2 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const sampleComplianceTasks = [
  {
    id: 'task-1',
    organizationId: 'temp-org-admin',
    clientId: 'client-1',
    assignedTo: 'admin',
    createdBy: 'admin',
    type: 'annual_review',
    category: 'compliance',
    title: 'Portfolio Suitability Assessment',
    description: 'Annual review of portfolio suitability and risk tolerance',
    priority: 'medium',
    status: 'pending',
    dueDate: '2024-12-20',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-2',
    organizationId: 'temp-org-admin',
    clientId: 'client-2',
    assignedTo: 'admin',
    createdBy: 'admin',
    type: 'kyc',
    category: 'compliance',
    title: 'Customer Due Diligence Refresh',
    description: 'Update KYC documentation and verify client information',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2024-12-25',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Initialize sample data
sampleClients.forEach(client => tempStorage.clients.set(client.id, client));
samplePortfolios.forEach(portfolio => tempStorage.portfolios.set(portfolio.id, portfolio));
sampleComplianceTasks.forEach(task => tempStorage.complianceTasks.set(task.id, task));

// Initialize Financial Database Storage
const financialStorage = new FinancialDatabaseStorage();

// Sample holdings data with comprehensive market data
const sampleHoldings = [
  // John Anderson's Growth Portfolio Holdings
  {
    id: 'holding-1',
    portfolioId: 'portfolio-1',
    symbol: 'VWRL',
    name: 'Vanguard FTSE All-World UCITS ETF',
    assetClass: 'equity',
    sector: 'Global Equity',
    region: 'Global',
    quantity: 450,
    averageCost: 95.50,
    currentPrice: 108.75,
    marketValue: 48937.50,
    unrealizedGainLoss: 5962.50,
    weight: 10.09,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-2',
    portfolioId: 'portfolio-1',
    symbol: 'VUSA',
    name: 'Vanguard S&P 500 UCITS ETF',
    assetClass: 'equity',
    sector: 'US Equity',
    region: 'North America',
    quantity: 200,
    averageCost: 78.20,
    currentPrice: 89.45,
    marketValue: 17890.00,
    unrealizedGainLoss: 2250.00,
    weight: 3.69,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-3',
    portfolioId: 'portfolio-1',
    symbol: 'VEVE',
    name: 'Vanguard FTSE Developed Europe UCITS ETF',
    assetClass: 'equity',
    sector: 'European Equity',
    region: 'Europe',
    quantity: 300,
    averageCost: 52.30,
    currentPrice: 58.90,
    marketValue: 17670.00,
    unrealizedGainLoss: 1980.00,
    weight: 3.64,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-4',
    portfolioId: 'portfolio-1',
    symbol: 'VGOV',
    name: 'Vanguard UK Government Bond UCITS ETF',
    assetClass: 'bond',
    sector: 'Government Bonds',
    region: 'UK',
    quantity: 800,
    averageCost: 51.75,
    currentPrice: 49.20,
    marketValue: 39360.00,
    unrealizedGainLoss: -2040.00,
    weight: 8.12,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-5',
    portfolioId: 'portfolio-1',
    symbol: 'CORP',
    name: 'iShares Core £ Corporate Bond UCITS ETF',
    assetClass: 'bond',
    sector: 'Corporate Bonds',
    region: 'UK',
    quantity: 600,
    averageCost: 55.80,
    currentPrice: 54.15,
    marketValue: 32490.00,
    unrealizedGainLoss: -990.00,
    weight: 6.70,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-6',
    portfolioId: 'portfolio-1',
    symbol: 'CASH',
    name: 'Cash - GBP',
    assetClass: 'cash',
    sector: 'Cash',
    region: 'UK',
    quantity: 24252.50,
    averageCost: 1.00,
    currentPrice: 1.00,
    marketValue: 24252.50,
    unrealizedGainLoss: 0,
    weight: 5.00,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  // Sarah Williams' Aggressive Growth Portfolio Holdings
  {
    id: 'holding-7',
    portfolioId: 'portfolio-2',
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    assetClass: 'equity',
    sector: 'Technology',
    region: 'North America',
    quantity: 180,
    averageCost: 320.50,
    currentPrice: 385.75,
    marketValue: 69435.00,
    unrealizedGainLoss: 11745.00,
    weight: 9.26,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-8',
    portfolioId: 'portfolio-2',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    assetClass: 'equity',
    sector: 'Technology',
    region: 'North America',
    quantity: 120,
    averageCost: 280.20,
    currentPrice: 378.85,
    marketValue: 45462.00,
    unrealizedGainLoss: 11838.00,
    weight: 6.06,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-9',
    portfolioId: 'portfolio-2',
    symbol: 'GOOGL',
    name: 'Alphabet Inc. Class A',
    assetClass: 'equity',
    sector: 'Technology',
    region: 'North America',
    quantity: 250,
    averageCost: 145.30,
    currentPrice: 167.95,
    marketValue: 41987.50,
    unrealizedGainLoss: 5662.50,
    weight: 5.60,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-10',
    portfolioId: 'portfolio-2',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    assetClass: 'equity',
    sector: 'Consumer Discretionary',
    region: 'North America',
    quantity: 85,
    averageCost: 195.80,
    currentPrice: 248.50,
    marketValue: 21122.50,
    unrealizedGainLoss: 4479.50,
    weight: 2.82,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-11',
    portfolioId: 'portfolio-2',
    symbol: 'ARKK',
    name: 'ARK Innovation ETF',
    assetClass: 'equity',
    sector: 'Growth',
    region: 'North America',
    quantity: 400,
    averageCost: 62.75,
    currentPrice: 45.80,
    marketValue: 18320.00,
    unrealizedGainLoss: -6780.00,
    weight: 2.44,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-12',
    portfolioId: 'portfolio-2',
    symbol: 'BTC-ETF',
    name: 'Bitcoin Strategy ETF',
    assetClass: 'alternative',
    sector: 'Cryptocurrency',
    region: 'Global',
    quantity: 150,
    averageCost: 45.20,
    currentPrice: 62.85,
    marketValue: 9427.50,
    unrealizedGainLoss: 2647.50,
    weight: 1.26,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'holding-13',
    portfolioId: 'portfolio-2',
    symbol: 'CASH',
    name: 'Cash - GBP',
    assetClass: 'cash',
    sector: 'Cash',
    region: 'UK',
    quantity: 37500.00,
    averageCost: 1.00,
    currentPrice: 1.00,
    marketValue: 37500.00,
    unrealizedGainLoss: 0,
    weight: 5.00,
    lastUpdated: new Date(),
    createdAt: new Date(),
  }
];

// Initialize sample holdings data
sampleHoldings.forEach(holding => tempStorage.holdings.set(holding.id, holding));

export function registerFinancialRoutes(app: Express) {
  // Authentication routes
  app.post('/api/financial/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }

      const result = await AuthAdapter.loginUser(email, password);
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/financial/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const result = await AuthAdapter.registerUser({ email, password, firstName, lastName, role });
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  app.get('/api/financial/auth/user', authenticate, (req: AuthenticatedRequest, res) => {
    res.json({
      user: req.user,
    });
  });

  // Dashboard overview
  app.get('/api/financial/dashboard', authenticate, requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const dashboardStats = await financialStorage.getDashboardStats(req.user!.organizationId!);
      
      const recentActivity = [
        {
          type: 'portfolio_rebalanced',
          client: 'Sarah Williams',
          description: 'Portfolio rebalanced',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          type: 'report_generated',
          client: 'John Anderson',
          description: 'Suitability report generated',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          type: 'consultation_completed',
          client: 'Michael Brown',
          description: 'Initial consultation completed',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        }
      ];
      
      res.json({
        stats: dashboardStats,
        recentActivity
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
    }
  });

  // Client management routes
  app.get('/api/financial/clients', authenticate, authorize('clients:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const clients = await financialStorage.getClients(req.user!.organizationId!);
      res.json(clients);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ message: 'Failed to fetch clients', error: error.message });
    }
  });

  app.post('/api/financial/clients', authenticate, authorize('clients:create'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      // Get current client count for numbering
      const existingClients = await financialStorage.getClients(req.user!.organizationId!);
      
      const clientData = {
        organizationId: req.user!.organizationId!,
        adviserId: req.user!.id,
        clientNumber: `CL${String(existingClients.length + 1).padStart(3, '0')}`,
        ...req.body,
        status: req.body.status || 'prospect',
      };
      
      // Log the creation request for audit purposes
      await financialStorage.logAction({
        organizationId: req.user!.organizationId!,
        userId: req.user!.id,
        action: 'create',
        resourceType: 'client',
        newValues: clientData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      const newClient = await financialStorage.createClient(clientData);
      res.status(201).json(newClient);
    } catch (error: any) {
      console.error('Error creating client:', error);
      res.status(500).json({ message: 'Failed to create client', error: error.message });
    }
  });

  app.get('/api/financial/clients/:id', authenticate, authorize('clients:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const client = await financialStorage.getClient(req.params.id, req.user!.organizationId!);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      res.json(client);
    } catch (error: any) {
      console.error('Error fetching client:', error);
      res.status(500).json({ message: 'Failed to fetch client', error: error.message });
    }
  });

  app.put('/api/financial/clients/:id', authenticate, authorize('clients:edit'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      // Log the update request for audit purposes
      await financialStorage.logAction({
        organizationId: req.user!.organizationId!,
        userId: req.user!.id,
        action: 'update',
        resourceType: 'client',
        resourceId: req.params.id,
        newValues: req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      const updatedClient = await financialStorage.updateClient(
        req.params.id, 
        req.user!.organizationId!, 
        req.body
      );
      
      if (!updatedClient) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      res.json(updatedClient);
    } catch (error: any) {
      console.error('Error updating client:', error);
      res.status(500).json({ message: 'Failed to update client', error: error.message });
    }
  });

  // Portfolio management routes
  app.get('/api/financial/portfolios', authenticate, authorize('portfolios:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const portfolios = await financialStorage.getPortfolios(req.user!.organizationId!);
      res.json(portfolios);
    } catch (error: any) {
      console.error('Error fetching portfolios:', error);
      res.status(500).json({ message: 'Failed to fetch portfolios', error: error.message });
    }
  });

  app.get('/api/financial/clients/:clientId/portfolios', authenticate, authorize('portfolios:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const portfolios = await financialStorage.getPortfoliosByClient(req.params.clientId, req.user!.organizationId!);
      res.json(portfolios);
    } catch (error: any) {
      console.error('Error fetching client portfolios:', error);
      res.status(500).json({ message: 'Failed to fetch client portfolios', error: error.message });
    }
  });

  // Holdings management routes with comprehensive CRUD operations
  
  // Zod validation schema for holdings
  const holdingInputSchema = z.object({
    symbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol too long'),
    name: z.string().min(1, 'Asset name is required').max(100, 'Name too long'),
    assetClass: z.enum(['equity', 'bond', 'cash', 'property', 'commodity', 'alternative'], {
      errorMap: () => ({ message: 'Invalid asset class' })
    }),
    sector: z.string().optional(),
    region: z.string().optional(),
    quantity: z.number().positive('Quantity must be positive'),
    averageCost: z.number().positive('Average cost must be positive').optional(),
    currentPrice: z.number().positive('Current price must be positive'),
  });

  // Get all holdings for a portfolio
  app.get('/api/financial/portfolios/:portfolioId/holdings', authenticate, authorize('portfolios:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const holdings = await financialStorage.getHoldingsByPortfolio(req.params.portfolioId, req.user!.organizationId!);
      
      // Calculate portfolio totals and weights
      const totalMarketValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
      const holdingsWithWeights = holdings.map(holding => ({
        ...holding,
        weight: totalMarketValue > 0 ? Math.round((holding.marketValue / totalMarketValue) * 10000) / 100 : 0
      }));

      res.json({
        holdings: holdingsWithWeights,
        summary: {
          totalValue: totalMarketValue,
          totalUnrealizedGainLoss: holdings.reduce((sum, holding) => sum + (holding.unrealizedGainLoss || 0), 0),
          holdingCount: holdings.length,
          assetClassBreakdown: getAssetClassBreakdown(holdings, totalMarketValue)
        }
      });
    } catch (error: any) {
      console.error('Error fetching portfolio holdings:', error);
      res.status(500).json({ message: 'Failed to fetch portfolio holdings', error: error.message });
    }
  });

  // Add new holding to portfolio
  app.post('/api/financial/portfolios/:portfolioId/holdings', authenticate, authorize('portfolios:edit'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const portfolio = await financialStorage.getPortfolio(req.params.portfolioId, req.user!.organizationId!);
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

      // Validate input
      const validatedInput = holdingInputSchema.parse(req.body);
      const { symbol, name, assetClass, sector, region, quantity, averageCost, currentPrice } = validatedInput;

      // Check for duplicate holdings in the same portfolio
      const existingHoldings = await financialStorage.getHoldings(req.params.portfolioId, req.user!.organizationId!);
      const existingHolding = existingHoldings.find(holding => holding.symbol === symbol);
      
      if (existingHolding) {
        return res.status(400).json({ message: 'A holding with this symbol already exists in the portfolio' });
      }

      const marketValue = quantity * currentPrice;
      const unrealizedGainLoss = averageCost ? quantity * (currentPrice - averageCost) : 0;

      const newHolding = await financialStorage.createHolding({
        portfolioId: req.params.portfolioId,
        symbol,
        name,
        assetClass,
        sector: sector || null,
        region: region || null,
        quantity,
        averageCost: averageCost || currentPrice,
        currentPrice,
        marketValue,
        unrealizedGainLoss,
      });
      
      // Update portfolio total value
      const allPortfolioHoldings = await financialStorage.getHoldings(req.params.portfolioId, req.user!.organizationId!);
      const newTotalValue = allPortfolioHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
      
      await financialStorage.updatePortfolio(req.params.portfolioId, req.user!.organizationId!, {
        totalValue: newTotalValue,
        updatedAt: new Date(),
      });

      res.status(201).json(newHolding);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`) 
        });
      }
      console.error('Error creating holding:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update existing holding
  app.put('/api/financial/portfolios/:portfolioId/holdings/:holdingId', authenticate, authorize('portfolios:edit'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const portfolio = tempStorage.portfolios.get(req.params.portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

      // Verify portfolio belongs to user's organization
      const client = tempStorage.clients.get(portfolio.clientId);
      if (!client || client.organizationId !== req.user!.organizationId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const holding = tempStorage.holdings.get(req.params.holdingId);
      if (!holding || holding.portfolioId !== req.params.portfolioId) {
        return res.status(404).json({ message: 'Holding not found' });
      }

      // Validate input
      const validatedInput = holdingInputSchema.partial().parse(req.body);

      // Check for symbol conflicts if symbol is being changed
      if (validatedInput.symbol && validatedInput.symbol !== holding.symbol) {
        const existingHolding = holdings.find(h => h.symbol === validatedInput.symbol && h.id !== req.params.holdingId);
        
        if (existingHolding) {
          return res.status(400).json({ message: 'A holding with this symbol already exists in the portfolio' });
        }
      }

      // Prepare updated data with recalculated fields
      const updateData: any = { ...validatedInput };
      
      // Recalculate derived fields
      if (validatedInput.quantity !== undefined || validatedInput.currentPrice !== undefined) {
        const newQuantity = validatedInput.quantity ?? holding.quantity;
        const newPrice = validatedInput.currentPrice ?? holding.currentPrice;
        updateData.marketValue = newQuantity * newPrice;
        const avgCost = validatedInput.averageCost ?? holding.averageCost;
        if (avgCost) {
          updateData.unrealizedGainLoss = newQuantity * (newPrice - avgCost);
        }
      }
      
      updateData.lastUpdated = new Date();

      const updatedHolding = await financialStorage.updateHolding(req.params.holdingId, req.user!.organizationId!, updateData);
      if (!updatedHolding) {
        return res.status(404).json({ message: 'Failed to update holding' });
      }
      
      // Update portfolio total value
      const allPortfolioHoldings = await financialStorage.getHoldings(req.params.portfolioId, req.user!.organizationId!);
      const newTotalValue = allPortfolioHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
      
      await financialStorage.updatePortfolio(req.params.portfolioId, req.user!.organizationId!, {
        totalValue: newTotalValue,
        updatedAt: new Date(),
      });

      res.json(updatedHolding);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`) 
        });
      }
      console.error('Error updating holding:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Delete holding
  app.delete('/api/financial/portfolios/:portfolioId/holdings/:holdingId', authenticate, authorize('portfolios:edit'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const portfolio = await financialStorage.getPortfolio(req.params.portfolioId, req.user!.organizationId!);
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

      const holdings = await financialStorage.getHoldings(req.params.portfolioId, req.user!.organizationId!);
      const holding = holdings.find(h => h.id === req.params.holdingId);
      if (!holding) {
        return res.status(404).json({ message: 'Holding not found' });
      }

      // Delete the holding using the storage method (if available)
      // For now, we'll update it to inactive or mark as deleted
      await financialStorage.updateHolding(req.params.holdingId, req.user!.organizationId!, { 
        marketValue: 0, 
        quantity: 0 
      });
    
      // Update portfolio total value
      const allPortfolioHoldings = await financialStorage.getHoldings(req.params.portfolioId, req.user!.organizationId!);
      const newTotalValue = allPortfolioHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
      
      await financialStorage.updatePortfolio(req.params.portfolioId, req.user!.organizationId!, {
        totalValue: newTotalValue,
        updatedAt: new Date(),
      });

      res.json({ message: 'Holding deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting holding:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get single holding details
  app.get('/api/financial/portfolios/:portfolioId/holdings/:holdingId', authenticate, authorize('portfolios:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const portfolio = await financialStorage.getPortfolio(req.params.portfolioId, req.user!.organizationId!);
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

      const holdings = await financialStorage.getHoldings(req.params.portfolioId, req.user!.organizationId!);
      const holding = holdings.find(h => h.id === req.params.holdingId);
      if (!holding || holding.portfolioId !== req.params.portfolioId) {
        return res.status(404).json({ message: 'Holding not found' });
      }

      res.json(holding);
    } catch (error: any) {
      console.error('Error fetching holding:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Helper function to calculate asset class breakdown
  function getAssetClassBreakdown(holdings: any[], totalValue: number) {
    const breakdown = holdings.reduce((acc, holding) => {
      const assetClass = holding.assetClass;
      if (!acc[assetClass]) {
        acc[assetClass] = { value: 0, percentage: 0 };
      }
      acc[assetClass].value += holding.marketValue;
      return acc;
    }, {} as Record<string, { value: number; percentage: number }>);

    // Calculate percentages
    Object.keys(breakdown).forEach(assetClass => {
      breakdown[assetClass].percentage = totalValue > 0 
        ? Math.round((breakdown[assetClass].value / totalValue) * 10000) / 100 
        : 0;
    });

    return breakdown;
  }

  // Zod validation schema for scenario inputs
  const scenarioInputSchema = z.object({
    currentAge: z.number().min(18, 'Current age must be at least 18').max(65, 'Current age cannot exceed 65'),
    retirementAge: z.number().min(50, 'Retirement age must be at least 50').max(80, 'Retirement age cannot exceed 80'),
    monthlyContribution: z.number().min(50, 'Monthly contribution must be at least £50').max(10000, 'Monthly contribution cannot exceed £10,000'),
    expectedReturn: z.number().min(0.1, 'Expected return must be at least 0.1%').max(20, 'Expected return cannot exceed 20%'),
    inflationRate: z.number().min(1, 'Inflation rate must be at least 1%').max(10, 'Inflation rate cannot exceed 10%').default(2.5),
    currentSavings: z.number().min(0, 'Current savings cannot be negative').default(0),
    clientId: z.string().optional()
  }).refine(data => data.currentAge < data.retirementAge, {
    message: 'Current age must be less than retirement age',
    path: ['currentAge']
  }).refine(data => (data.retirementAge - data.currentAge) <= 50, {
    message: 'Retirement period cannot exceed 50 years',
    path: ['retirementAge']
  });

  // Advanced Scenario Modelling Engine
  app.post('/api/financial/scenarios/run', authenticate, authorize('planning:view'), requireOrganization, (req: AuthenticatedRequest, res) => {
    try {
      // Validate input using Zod schema
      const validatedInput = scenarioInputSchema.parse(req.body);
      const { currentAge, retirementAge, monthlyContribution, expectedReturn, inflationRate, currentSavings, clientId } = validatedInput;
    
    const yearsToRetirement = retirementAge - currentAge;
    const totalMonths = yearsToRetirement * 12;
    const totalContributions = monthlyContribution * 12 * yearsToRetirement;
    
    // Calculate scenarios for different return rates
    const calculateScenario = (returnRate: number, label: string) => {
      const monthlyReturn = returnRate / 100 / 12;
      const futureValueCurrentSavings = currentSavings * Math.pow(1 + returnRate / 100, yearsToRetirement);
      const futureValueContributions = monthlyContribution * 
        ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
      
      const totalProjectedValue = futureValueCurrentSavings + futureValueContributions;
      const projectedIncome = totalProjectedValue * 0.04 / 12;
      const inflationAdjustedValue = totalProjectedValue / Math.pow(1 + inflationRate / 100, yearsToRetirement);
      const inflationAdjustedIncome = projectedIncome / Math.pow(1 + inflationRate / 100, yearsToRetirement);
      
      // Generate year-by-year projections
      const yearlyProjections = [];
      for (let year = 0; year <= yearsToRetirement; year++) {
        const months = year * 12;
        const currentSavingsValue = year === 0 ? currentSavings : currentSavings * Math.pow(1 + returnRate / 100, year);
        const contributionsValue = year === 0 ? 0 : monthlyContribution * 
          ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
        
        yearlyProjections.push({
          age: currentAge + year,
          year: new Date().getFullYear() + year,
          totalValue: Math.round(currentSavingsValue + contributionsValue),
          contributions: Math.round(monthlyContribution * 12 * year),
          growth: Math.round(currentSavingsValue + contributionsValue - (currentSavings + monthlyContribution * 12 * year))
        });
      }
      
      return {
        scenario: label,
        returnRate,
        projectedValue: Math.round(totalProjectedValue),
        inflationAdjustedValue: Math.round(inflationAdjustedValue),
        projectedIncome: Math.round(projectedIncome),
        inflationAdjustedIncome: Math.round(inflationAdjustedIncome),
        totalGrowth: Math.round(totalProjectedValue - totalContributions - currentSavings),
        yearlyProjections
      };
    };
    
    // Calculate three scenarios
    const conservativeScenario = calculateScenario(4, 'Conservative');
    const moderateScenario = calculateScenario(expectedReturn, 'Moderate');
    const aggressiveScenario = calculateScenario(10, 'Aggressive');
    
    // Create comprehensive scenario response
    const scenarioResult = {
      id: generateId(),
      organizationId: req.user!.organizationId,
      adviserId: req.user!.id,
      clientId: clientId || null,
      timestamp: new Date(),
      inputs: {
        currentAge,
        retirementAge,
        monthlyContribution,
        expectedReturn,
        inflationRate,
        currentSavings,
        yearsToRetirement
      },
      summary: {
        totalContributions: Math.round(totalContributions),
        yearsTillRetirement: yearsToRetirement,
        inflationImpact: Math.round((1 - (1 / Math.pow(1 + inflationRate / 100, yearsToRetirement))) * 100)
      },
      scenarios: {
        conservative: conservativeScenario,
        moderate: moderateScenario,
        aggressive: aggressiveScenario
      },
      comparison: {
        valueDifference: {
          moderateVsConservative: moderateScenario.projectedValue - conservativeScenario.projectedValue,
          aggressiveVsModerate: aggressiveScenario.projectedValue - moderateScenario.projectedValue,
          aggressiveVsConservative: aggressiveScenario.projectedValue - conservativeScenario.projectedValue
        },
        incomeDifference: {
          moderateVsConservative: moderateScenario.projectedIncome - conservativeScenario.projectedIncome,
          aggressiveVsModerate: aggressiveScenario.projectedIncome - moderateScenario.projectedIncome,
          aggressiveVsConservative: aggressiveScenario.projectedIncome - conservativeScenario.projectedIncome
        }
      },
      recommendations: [
        yearsToRetirement > 20 ? 'Long investment horizon allows for higher risk tolerance' : 'Shorter timeline suggests more conservative approach',
        monthlyContribution < 1000 ? 'Consider increasing monthly contributions for better retirement outcomes' : 'Current contribution level is strong',
        expectedReturn > 8 ? 'High return expectations - ensure risk tolerance aligns' : 'Conservative return assumptions provide realistic projections',
        inflationRate > 3 ? 'Higher inflation assumption - consider inflation-protected investments' : 'Standard inflation expectations'
      ]
    };
    
      // Store in temporary storage
      tempStorage.scenarios.set(scenarioResult.id, scenarioResult);
      
      res.json(scenarioResult);
    } catch (error) {
      console.error('Scenario calculation error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid input parameters',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      res.status(500).json({
        message: 'Internal server error during scenario calculation',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Calculation failed'
      });
    }
  });

  // ===================== COMPLIANCE TASK MANAGEMENT ENDPOINTS =====================
  
  // Get all compliance tasks with filtering and search
  app.get('/api/financial/tasks', authenticate, authorize('compliance:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { clientId, assignedTo, status, type, overdue, search } = req.query;
      
      const filters: any = {};
      if (clientId) filters.clientId = clientId as string;
      if (assignedTo) filters.assignedTo = assignedTo as string;
      if (status) filters.status = status as string;
      if (type) filters.type = type as string;
      if (overdue === 'true') filters.overdue = true;

      const tasks = await financialStorage.getComplianceTasks(req.user!.organizationId!, filters);
      
      // Apply search filter if provided
      let filteredTasks = tasks;
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredTasks = tasks.filter(task => 
          task.title.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm) ||
          task.client?.firstName.toLowerCase().includes(searchTerm) ||
          task.client?.lastName.toLowerCase().includes(searchTerm)
        );
      }
      
      res.json(filteredTasks);
    } catch (error: any) {
      console.error('Error fetching compliance tasks:', error);
      res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
    }
  });

  // Get single compliance task with checklists
  app.get('/api/financial/tasks/:id', authenticate, authorize('compliance:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const task = await financialStorage.getComplianceTask(req.params.id, req.user!.organizationId!);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Get task checklists
      const checklists = await financialStorage.getTaskChecklists(req.params.id);
      const taskWithChecklists = { ...task, checklists };

      res.json(taskWithChecklists);
    } catch (error: any) {
      console.error('Error fetching compliance task:', error);
      res.status(500).json({ message: 'Failed to fetch task', error: error.message });
    }
  });

  // Create new compliance task
  app.post('/api/financial/tasks', authenticate, authorize('compliance:manage'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const taskData = insertComplianceTaskSchema.parse({
        organizationId: req.user!.organizationId,
        createdBy: req.user!.id,
        assignedTo: req.body.assignedTo || req.user!.id,
        ...req.body,
        status: req.body.status || 'pending',
      });

      // Log the request for audit purposes
      await financialStorage.logAction({
        organizationId: req.user!.organizationId!,
        userId: req.user!.id,
        action: 'create',
        resourceType: 'compliance_task_request',
        newValues: taskData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const task = await financialStorage.createComplianceTask(taskData);
      res.status(201).json(task);
    } catch (error: any) {
      console.error('Error creating compliance task:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Invalid task data', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Failed to create task', error: error.message });
    }
  });

  // Update compliance task
  app.put('/api/financial/tasks/:id', authenticate, authorize('compliance:manage'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const updates = { ...req.body };
      
      // If completing task, set completion data
      if (updates.status === 'completed') {
        updates.completedAt = new Date();
        updates.completedBy = req.user!.id;
      }

      // Log the update request for audit purposes
      await financialStorage.logAction({
        organizationId: req.user!.organizationId!,
        userId: req.user!.id,
        action: 'update',
        resourceType: 'compliance_task_request',
        resourceId: req.params.id,
        newValues: updates,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const updatedTask = await financialStorage.updateComplianceTask(
        req.params.id, 
        req.user!.organizationId!, 
        updates
      );

      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(updatedTask);
    } catch (error: any) {
      console.error('Error updating compliance task:', error);
      res.status(500).json({ message: 'Failed to update task', error: error.message });
    }
  });

  // Delete/Cancel compliance task
  app.delete('/api/financial/tasks/:id', authenticate, authorize('compliance:manage'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      // Log the delete request for audit purposes
      await financialStorage.logAction({
        organizationId: req.user!.organizationId!,
        userId: req.user!.id,
        action: 'delete',
        resourceType: 'compliance_task_request',
        resourceId: req.params.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const deleted = await financialStorage.deleteComplianceTask(req.params.id, req.user!.organizationId!);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json({ message: 'Task cancelled successfully' });
    } catch (error: any) {
      console.error('Error deleting compliance task:', error);
      res.status(500).json({ message: 'Failed to delete task', error: error.message });
    }
  });

  // Update task checklist item
  app.put('/api/financial/tasks/:taskId/checklist/:checklistId', authenticate, authorize('compliance:manage'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { completed } = req.body;
      
      const updatedChecklist = await financialStorage.updateTaskChecklist(
        req.params.taskId, 
        req.params.checklistId, 
        completed, 
        completed ? req.user!.id : undefined
      );

      if (!updatedChecklist) {
        return res.status(404).json({ message: 'Checklist item not found' });
      }

      // Log checklist update
      await financialStorage.logAction({
        organizationId: req.user!.organizationId!,
        userId: req.user!.id,
        action: 'update',
        resourceType: 'task_checklist',
        resourceId: req.params.checklistId,
        newValues: { completed, taskId: req.params.taskId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(updatedChecklist);
    } catch (error: any) {
      console.error('Error updating checklist item:', error);
      res.status(500).json({ message: 'Failed to update checklist', error: error.message });
    }
  });

  // Get task templates
  app.get('/api/financial/task-templates', authenticate, requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const templates = await financialStorage.getTaskTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error('Error fetching task templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates', error: error.message });
    }
  });

  // Create task from template
  app.post('/api/financial/task-templates/:templateId/create', authenticate, authorize('compliance:manage'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { clientId, assignedTo, dueDate } = req.body;
      
      if (!clientId) {
        return res.status(400).json({ message: 'Client ID is required' });
      }

      const task = await financialStorage.createTaskFromTemplate(
        req.params.templateId,
        clientId,
        assignedTo || req.user!.id,
        req.user!.organizationId!,
        dueDate
      );

      // Log template usage
      await financialStorage.logAction({
        organizationId: req.user!.organizationId!,
        userId: req.user!.id,
        action: 'create',
        resourceType: 'task_from_template',
        resourceId: task.id,
        newValues: { templateId: req.params.templateId, clientId, assignedTo },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json(task);
    } catch (error: any) {
      console.error('Error creating task from template:', error);
      res.status(500).json({ message: 'Failed to create task from template', error: error.message });
    }
  });

  // Get overdue tasks
  app.get('/api/financial/tasks/overdue', authenticate, authorize('compliance:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const overdueTasks = await financialStorage.getOverdueTasks(req.user!.organizationId!);
      res.json(overdueTasks);
    } catch (error: any) {
      console.error('Error fetching overdue tasks:', error);
      res.status(500).json({ message: 'Failed to fetch overdue tasks', error: error.message });
    }
  });

  // ===================== AUDIT LOG MANAGEMENT ENDPOINTS =====================

  // Get audit logs with filtering and search
  app.get('/api/financial/audit', authenticate, authorize('compliance:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, resourceType, resourceId, action, from, to, limit, offset } = req.query;
      
      const filters: any = {};
      if (userId) filters.userId = userId as string;
      if (resourceType) filters.resourceType = resourceType as string;
      if (resourceId) filters.resourceId = resourceId as string;
      if (action) filters.action = action as string;
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);

      const auditLogs = await financialStorage.getAuditLogs(req.user!.organizationId!, filters);
      
      // Apply pagination if provided
      const limitNum = limit ? parseInt(limit as string) : 50;
      const offsetNum = offset ? parseInt(offset as string) : 0;
      const paginatedLogs = auditLogs.slice(offsetNum, offsetNum + limitNum);
      
      res.json({
        logs: paginatedLogs,
        total: auditLogs.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < auditLogs.length
      });
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs', error: error.message });
    }
  });

  // Get audit logs for specific resource
  app.get('/api/financial/audit/resource/:type/:id', authenticate, authorize('compliance:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { type, id } = req.params;
      
      const auditLogs = await financialStorage.getAuditLogs(req.user!.organizationId!, {
        resourceType: type,
        resourceId: id
      });
      
      res.json(auditLogs);
    } catch (error: any) {
      console.error('Error fetching resource audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch resource audit logs', error: error.message });
    }
  });

  // Get audit logs for specific user
  app.get('/api/financial/audit/user/:userId', authenticate, authorize('compliance:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.params;
      const { from, to } = req.query;
      
      const filters: any = { userId };
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);

      const auditLogs = await financialStorage.getAuditLogs(req.user!.organizationId!, filters);
      
      res.json(auditLogs);
    } catch (error: any) {
      console.error('Error fetching user audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch user audit logs', error: error.message });
    }
  });

  // Export audit logs (CSV format)
  app.get('/api/financial/audit/export', authenticate, authorize('compliance:view'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { from, to } = req.query;
      
      const filters: any = {};
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);

      const auditLogs = await financialStorage.getAuditLogs(req.user!.organizationId!, filters);
      
      // Generate CSV content
      const csvHeaders = ['Date', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'Changes'];
      const csvRows = auditLogs.map(log => [
        log.createdAt.toISOString(),
        log.userId || 'System',
        log.action,
        log.resourceType,
        log.resourceId || '',
        log.ipAddress || '',
        JSON.stringify({ old: log.oldValues, new: log.newValues })
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } catch (error: any) {
      console.error('Error exporting audit logs:', error);
      res.status(500).json({ message: 'Failed to export audit logs', error: error.message });
    }
  });

  // ===================== WORKFLOW AUTOMATION ENDPOINTS =====================

  // Create client onboarding tasks
  app.post('/api/financial/workflow/onboard-client/:clientId', authenticate, authorize('compliance:manage'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { clientId } = req.params;
      
      // Verify client exists and belongs to organization
      const client = await financialStorage.getClient(clientId, req.user!.organizationId!);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }

      const tasks = await financialStorage.createClientOnboardingTasks(
        clientId, 
        req.user!.organizationId!, 
        req.user!.id
      );

      // Log workflow automation
      await financialStorage.logAction({
        organizationId: req.user!.organizationId!,
        userId: req.user!.id,
        action: 'create',
        resourceType: 'workflow_automation',
        resourceId: clientId,
        newValues: { type: 'client_onboarding', tasksCreated: tasks.length },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json({
        message: `Created ${tasks.length} onboarding tasks for client`,
        tasks
      });
    } catch (error: any) {
      console.error('Error creating onboarding tasks:', error);
      res.status(500).json({ message: 'Failed to create onboarding tasks', error: error.message });
    }
  });

  // Update task status with workflow progression
  app.put('/api/financial/workflow/task/:taskId/status', authenticate, authorize('compliance:manage'), requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { taskId } = req.params;
      const { status, notes } = req.body;

      const updatedTask = await financialStorage.updateTaskStatus(
        taskId,
        req.user!.organizationId!,
        status,
        req.user!.id
      );

      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // If task completed, check for dependent tasks or next workflow steps
      if (status === 'completed') {
        // Log workflow completion
        await financialStorage.logAction({
          organizationId: req.user!.organizationId!,
          userId: req.user!.id,
          action: 'complete',
          resourceType: 'workflow_task',
          resourceId: taskId,
          newValues: { status, completedBy: req.user!.id },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }

      res.json(updatedTask);
    } catch (error: any) {
      console.error('Error updating task status:', error);
      res.status(500).json({ message: 'Failed to update task status', error: error.message });
    }
  });

  // Reports generation
  app.post('/api/financial/reports/suitability', authenticate, authorize('reports:create'), requireOrganization, (req: AuthenticatedRequest, res) => {
    const { clientId, portfolioId } = req.body;
    
    const client = tempStorage.clients.get(clientId);
    if (!client || client.organizationId !== req.user!.organizationId) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const portfolio = tempStorage.portfolios.get(portfolioId);
    if (!portfolio || portfolio.clientId !== clientId) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Generate suitability report (mock)
    const report = {
      id: generateId(),
      clientName: `${client.firstName} ${client.lastName}`,
      portfolioName: portfolio.name,
      riskProfile: client.riskTolerance,
      recommendedAllocation: portfolio.assetAllocation,
      suitabilityScore: Math.floor(Math.random() * 20) + 80, // 80-100%
      recommendations: [
        'Current allocation aligns with risk tolerance',
        'Consider annual rebalancing to maintain target allocation',
        'Review risk profile during next annual meeting'
      ],
      generatedAt: new Date(),
      generatedBy: `${req.user!.email}`,
    };

    res.json(report);
  });

  app.post('/api/financial/reports/portfolio', authenticate, authorize('reports:create'), requireOrganization, (req: AuthenticatedRequest, res) => {
    const { portfolioId, period } = req.body;
    
    const portfolio = tempStorage.portfolios.get(portfolioId);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const client = tempStorage.clients.get(portfolio.clientId);
    if (!client || client.organizationId !== req.user!.organizationId) {
      return res.status(404).json({ message: 'Portfolio not accessible' });
    }

    // Generate portfolio report (mock)
    const report = {
      id: generateId(),
      portfolioName: portfolio.name,
      clientName: `${client.firstName} ${client.lastName}`,
      period,
      value: portfolio.totalValue,
      performance: portfolio.performance,
      allocation: portfolio.assetAllocation,
      benchmark: {
        ytd: portfolio.performance.ytd - 1.2,
        oneYear: portfolio.performance.oneYear - 0.8,
        threeYear: portfolio.performance.threeYear - 0.5,
      },
      holdings: [
        { name: 'Vanguard Global All Cap', value: portfolio.totalValue * 0.4, weight: 40 },
        { name: 'iShares Core UK Gilts', value: portfolio.totalValue * 0.25, weight: 25 },
        { name: 'Vanguard FTSE UK All Share', value: portfolio.totalValue * 0.2, weight: 20 },
        { name: 'Cash', value: portfolio.totalValue * 0.15, weight: 15 },
      ],
      generatedAt: new Date(),
      generatedBy: `${req.user!.email}`,
    };

    res.json(report);
  });

  // === ENHANCED DASHBOARD ENDPOINTS ===

  // Pipeline Management Routes
  app.get('/api/financial/pipeline/stages', authenticate, requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      let stages = await financialStorage.getPipelineStages(req.user!.organizationId!);
      
      // If no stages exist, create default ones
      if (stages.length === 0) {
        const defaultStages = [
          { organizationId: req.user!.organizationId!, name: 'Data Collection', description: 'Initial fact finding and document gathering', position: 1, color: '#3B82F6' },
          { organizationId: req.user!.organizationId!, name: 'Modelling', description: 'Financial planning and scenario analysis', position: 2, color: '#F59E0B' },
          { organizationId: req.user!.organizationId!, name: 'Report', description: 'Suitability report generation and review', position: 3, color: '#10B981' },
          { organizationId: req.user!.organizationId!, name: 'Compliance', description: 'Final compliance checks and documentation', position: 4, color: '#8B5CF6' }
        ];

        for (const stage of defaultStages) {
          await financialStorage.createPipelineStage(stage);
        }
        
        stages = await financialStorage.getPipelineStages(req.user!.organizationId!);
      }
      
      res.json(stages);
    } catch (error: any) {
      console.error('Error fetching pipeline stages:', error);
      res.status(500).json({ message: 'Failed to fetch pipeline stages', error: error.message });
    }
  });

  app.get('/api/financial/pipeline/overview', authenticate, requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const stages = await financialStorage.getPipelineStages(req.user!.organizationId!);
      const clientPipeline = await financialStorage.getClientPipeline(req.user!.organizationId!);
      const clients = await financialStorage.getClients(req.user!.organizationId!);
      
      // Group clients by stage
      const pipelineData = stages.map(stage => {
        const stageClients = clientPipeline
          .filter(cp => cp.stageId === stage.id)
          .map(cp => {
            const client = clients.find(c => c.id === cp.clientId);
            return {
              id: cp.clientId,
              name: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
              enteredAt: cp.enteredAt,
              expectedCompletion: cp.expectedCompletionDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              completionPercentage: cp.completionPercentage || 0,
              priority: cp.priority || 'medium',
              assignedTo: cp.assignedTo || req.user!.id,
              notes: cp.notes || '',
              portfolioValue: Number(client?.netWorth || 0)
            };
          });

        return {
          stageId: stage.id,
          stageName: stage.name,
          stageColor: stage.color,
          clients: stageClients
        };
      });

      // Calculate metrics
      const totalPipelineValue = clientPipeline.reduce((sum, cp) => {
        const client = clients.find(c => c.id === cp.clientId);
        return sum + Number(client?.netWorth || 0);
      }, 0);

      const avgDaysInPipeline = clientPipeline.length > 0 
        ? clientPipeline.reduce((sum, cp) => {
            const daysInStage = Math.floor((new Date().getTime() - cp.enteredAt.getTime()) / (1000 * 60 * 60 * 24));
            return sum + daysInStage;
          }, 0) / clientPipeline.length 
        : 0;

      const metrics = {
        totalPipelineValue,
        avgDaysInPipeline: Math.round(avgDaysInPipeline),
        completionRate: 85, // This could be calculated from historical data
        activeClients: clientPipeline.length
      };

      res.json({ stages: pipelineData, metrics });
    } catch (error: any) {
      console.error('Error fetching pipeline overview:', error);
      res.status(500).json({ message: 'Failed to fetch pipeline overview', error: error.message });
    }
  });

  app.put('/api/financial/pipeline/client/:clientId/stage', authenticate, requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { clientId } = req.params;
      const { stageId, notes, priority, expectedCompletionDate } = req.body;

      // Validation schema
      const updateSchema = z.object({
        stageId: z.string().min(1, "Stage ID is required"),
        notes: z.string().optional(),
        priority: z.enum(['high', 'medium', 'low']).optional(),
        expectedCompletionDate: z.string().optional()
      });

      const validated = updateSchema.parse({ stageId, notes, priority, expectedCompletionDate });

      // Update the client pipeline stage
      const updatedPipeline = await financialStorage.updateClientPipelineStage(
        clientId, 
        validated.stageId, 
        req.user!.organizationId!,
        {
          notes: validated.notes,
          priority: validated.priority || 'medium',
          assignedTo: req.user!.id,
          expectedCompletionDate: validated.expectedCompletionDate ? new Date(validated.expectedCompletionDate) : undefined
        }
      );

      if (!updatedPipeline) {
        return res.status(404).json({ message: 'Client not found or update failed' });
      }

      // Create notification for pipeline stage change
      await financialStorage.createNotification({
        organizationId: req.user!.organizationId!,
        userId: req.user!.id,
        title: 'Pipeline Update',
        message: `Client has moved to a new pipeline stage`,
        type: 'pipeline_update',
        category: 'info',
        priority: 'medium',
        relatedResourceType: 'client',
        relatedResourceId: clientId,
        actionUrl: '/dashboard?tab=planning&view=pipeline',
        actionLabel: 'View Pipeline'
      });

      res.json(updatedPipeline);
    } catch (error: any) {
      console.error('Error updating client stage:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update client stage', error: error.message });
    }
  });

  // Enhanced Notifications Routes
  app.get('/api/financial/notifications', authenticate, requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { unreadOnly, limit } = req.query;
      
      const filters: any = {};
      
      if (unreadOnly === 'true') {
        filters.isRead = false;
      }
      
      if (limit) {
        filters.limit = parseInt(limit as string, 10) || 20;
      }

      const notifications = await financialStorage.getNotifications(
        req.user!.organizationId!,
        req.user!.id,
        filters
      );

      res.json(notifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
  });

  app.put('/api/financial/notifications/:id/read', authenticate, requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      const updatedNotification = await financialStorage.markNotificationRead(
        id, 
        req.user!.id, 
        req.user!.organizationId!
      );

      if (!updatedNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json(updatedNotification);
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
    }
  });

  app.put('/api/financial/notifications/mark-all-read', authenticate, requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await financialStorage.markAllNotificationsRead(
        req.user!.id,
        req.user!.organizationId!
      );

      if (!success) {
        return res.status(400).json({ message: 'Failed to mark all notifications as read' });
      }

      res.json({
        success: true,
        updatedAt: new Date()
      });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
    }
  });

  // KPI Metrics Routes
  app.get('/api/financial/kpi/historical', authenticate, requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      const { metric, period = '6months' } = req.query;

      // Get historical KPI data from storage
      const historicalData = await financialStorage.getKpiHistorical(
        req.user!.organizationId!,
        metric as string || 'aum',
        period as string
      );

      res.json(historicalData);
    } catch (error: any) {
      console.error('Error fetching historical KPI data:', error);
      res.status(500).json({ message: 'Failed to fetch historical KPI data', error: error.message });
    }
  });

  app.get('/api/financial/kpi/summary', authenticate, requireOrganization, async (req: AuthenticatedRequest, res) => {
    try {
      // Get real KPI data from storage
      const kpiSummary = await financialStorage.getKpiSummary(req.user!.organizationId!);
      
      // Get dashboard stats for additional context
      const dashboardStats = await financialStorage.getDashboardStats(req.user!.organizationId!);
      
      // Enhance with dashboard data and default values if KPI data is empty
      const enhancedSummary = {
        totalClients: kpiSummary.totalClients.value > 0 ? kpiSummary.totalClients : {
          value: dashboardStats.totalClients,
          change: 0,
          trend: 'neutral' as const,
          sparklineData: [dashboardStats.totalClients, dashboardStats.totalClients]
        },
        totalAUM: kpiSummary.totalAUM.value > 0 ? kpiSummary.totalAUM : {
          value: dashboardStats.totalAUM,
          change: 0,
          trend: 'neutral' as const,
          sparklineData: [dashboardStats.totalAUM, dashboardStats.totalAUM]
        },
        avgPerformance: kpiSummary.averageReturn.value > 0 ? kpiSummary.averageReturn : {
          value: dashboardStats.avgPerformance,
          change: 0,
          trend: 'neutral' as const,
          sparklineData: [dashboardStats.avgPerformance, dashboardStats.avgPerformance]
        },
        pendingTasks: {
          value: dashboardStats.pendingTasks,
          previousValue: dashboardStats.pendingTasks,
          change: 0,
          trend: 'neutral' as const,
          sparklineData: [dashboardStats.pendingTasks, dashboardStats.pendingTasks]
        },
        activePortfolios: kpiSummary.activePortfolios.value > 0 ? kpiSummary.activePortfolios : {
          value: 0,
          change: 0,
          trend: 'neutral' as const,
          sparklineData: [0, 0]
        },
        newClients: kpiSummary.newClients.value >= 0 ? kpiSummary.newClients : {
          value: 0,
          change: 0,
          trend: 'neutral' as const,
          sparklineData: [0, 0]
        }
      };

      res.json(enhancedSummary);
    } catch (error: any) {
      console.error('Error fetching KPI summary:', error);
      res.status(500).json({ message: 'Failed to fetch KPI summary', error: error.message });
    }
  });
}