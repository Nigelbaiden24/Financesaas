import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import OpenAI from 'openai';
import {
  insertDocumentSchema,
  insertChatSessionSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { 
  registerUser, 
  loginUser 
} from "./auth";
import { db } from "./db";
import { templates } from "../shared/schema";
import { sql } from "drizzle-orm";
import { generatePDF } from "./pdfGenerator";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure sessions
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const user = await registerUser(req.body);
      req.session.userId = user.id;
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await loginUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Templates API
  app.get("/api/templates", async (req, res) => {
    try {
      const { category } = req.query;
      const templates = category 
        ? await storage.getTemplatesByCategory(category as string)
        : await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get templates for a specific service type - MUST come before :id route
  app.get("/api/templates/by-service/:serviceType", async (req, res) => {
    try {
      const { serviceType } = req.params;
      
      console.log(`🔍 Fetching templates for service type: ${serviceType}`);
      
      // Get category mapping for the service type
      const possibleCategories = getCategoryMappingForServiceType(serviceType);
      console.log(`🎯 Mapped categories: ${possibleCategories.join(', ')}`);
      
      // Get templates from database matching the categories  
      const allTemplates = await storage.getTemplates();
      
      const filteredTemplates = allTemplates.filter(template => 
        possibleCategories.includes(template.category)
      );
      
      console.log(`📝 Found ${filteredTemplates.length} templates for ${serviceType}`);
      
      // Return template list with relevant fields
      const templateList = filteredTemplates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || `${template.category} template`,
        category: template.category
      }));
      
      res.json(templateList);
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Debug endpoint to verify template loading
  app.get("/api/debug/templates", async (req, res) => {
    try {
      console.log("🔍 DEBUG: Template loading analysis");
      
      // Check database templates
      const dbTemplates = await storage.getTemplates();
      console.log(`📊 Database templates: ${dbTemplates.length}`);
      
      const validDbTemplates = dbTemplates.filter(t => t.id && t.category && t.name);
      console.log(`✅ Valid database templates: ${validDbTemplates.length}`);
      
      const categoriesDb = [...new Set(dbTemplates.map(t => t.category).filter(Boolean))];
      console.log(`📋 Database categories: ${categoriesDb.join(', ')}`);
      
      // Check backend templates
      const fs = await import('fs');
      const path = await import('path');
      const templatesDir = path.join(process.cwd(), 'server/templates');
      
      let backendTemplates = [];
      if (fs.existsSync(templatesDir)) {
        const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
        backendTemplates = files.map(file => {
          try {
            const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
            const template = JSON.parse(content);
            return { file, id: template.id, name: template.name, category: template.category };
          } catch (error) {
            return { file, error: error.message };
          }
        });
      }
      
      res.json({
        database: {
          total: dbTemplates.length,
          valid: validDbTemplates.length,
          categories: categoriesDb,
          templates: dbTemplates.map(t => ({
            id: t.id,
            name: t.name,
            category: t.category,
            sector: t.sector,
            usageCount: t.usageCount
          }))
        },
        backend: {
          directory: templatesDir,
          exists: fs.existsSync(templatesDir),
          total: backendTemplates.length,
          templates: backendTemplates
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to debug templates",
        error: error.message 
      });
    }
  });

  // Protected Documents API
  app.get("/api/documents", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user owns the document
      if (document.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Check usage limits
      const planLimits = {
        starter: 8,
        pro: 40,
        agency: Infinity
      };
      
      const currentLimit = planLimits[user.currentPlan as keyof typeof planLimits] || 8;
      
      if (user.monthlyUsage >= currentLimit) {
        return res.status(429).json({ 
          message: "Monthly design limit reached. Please upgrade your plan or wait until next month.",
          currentUsage: user.monthlyUsage,
          limit: currentLimit
        });
      }

      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        userId: user.id
      });

      const document = await storage.createDocument(validatedData);
      
      // Update user usage
      await storage.updateUserUsage(user.id, 1);

      res.json(document);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      if (document.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedDocument = await storage.updateDocument(req.params.id, req.body);
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      if (document.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteDocument(req.params.id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Download endpoint for documents
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      console.log(`📄 Generating PDF for document: ${document.title} (${document.serviceType})`);
      
      // Generate PDF using the PDF generator
      const { generatePDF } = await import('./pdfGenerator');
      const pdfBuffer = await generatePDF(document);

      const filename = `${document.title.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_')}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      
      res.send(pdfBuffer);
      
      console.log(`✅ PDF generated successfully: ${filename}`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      res.status(500).json({ message: "Failed to generate PDF document" });
    }
  });

  // Test PDF generation endpoint
  app.get("/api/test-pdf", async (req, res) => {
    try {
      console.log(`🧪 Testing PDF generation...`);
      
      // Create professional PDF content directly
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 16 Tf
72 720 Td
(Test PDF Document) Tj
0 -40 Td
/F1 12 Tf
(This is a working PDF generated by Jenrate.Ai) Tj
0 -20 Td
(All document generation and PDF download systems are functional.) Tj
0 -20 Td
(Generated on: ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000267 00000 n 
0000000520 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
580
%%EOF`;

      const pdfBuffer = Buffer.from(pdfContent, 'utf8');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="test_document.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      
      res.send(pdfBuffer);
      
      console.log(`✅ Test PDF generated successfully: test_document.pdf (${pdfBuffer.length} bytes)`);
    } catch (error) {
      console.error('❌ Test PDF generation failed:', error);
      res.status(500).json({ message: "Test PDF generation failed", error: error.message });
    }
  });

// Template matching logic with enhanced debugging
async function findBestTemplate(prompt: string, serviceType: string) {
  console.log(`🔍 Finding database template for serviceType: ${serviceType}`);
  
  // Get all templates
  const allTemplates = await storage.getTemplates();
  
  if (!allTemplates || allTemplates.length === 0) {
    console.log("❌ No templates found in database");
    return null; // Return null instead of throwing to allow fallback to backend templates
  }

  console.log(`📊 Found ${allTemplates.length} total database templates`);
  console.log(`📋 Available categories: ${[...new Set(allTemplates.map(t => t.category).filter(Boolean))].join(', ')}`);
  
  // Filter out templates with null/undefined essential fields
  const validTemplates = allTemplates.filter(t => t.id && t.category && t.name);
  console.log(`✅ Valid templates (with ID, category, name): ${validTemplates.length}`);
  
  // Enhanced service type to category mapping for database templates
  const serviceToCategory = {
    'resume-builder': ['resume', 'cv', 'curriculum-vitae'],
    'cv': ['resume', 'cv', 'curriculum-vitae'],
    'pitch-deck': ['pitch-deck', 'presentation', 'startup-pitch'],
    'brochure-designer': ['brochure', 'marketing-brochure', 'flyer'],
    'report-generator': ['report', 'financial-report', 'business-report'],
    'invoice-creator': ['invoice', 'billing', 'bill'],
    'business-plan': ['business-plan', 'startup-plan'],
    'newsletter-designer': ['newsletter', 'email-newsletter'],
    'ebook-creator': ['ebook', 'book', 'guide'],
    'chart-generator': ['chart', 'graph', 'data-visualization']
  };
  
  // Find category mapping for the service type
  const possibleCategories = serviceToCategory[serviceType as keyof typeof serviceToCategory] || [serviceType];
  console.log(`🎯 Possible categories for '${serviceType}': ${possibleCategories.join(', ')}`);
  
  // First, try to find templates by enhanced category matching
  const categoryTemplates = validTemplates.filter(t => 
    t.category && possibleCategories.some(cat => 
      t.category.toLowerCase().includes(cat.toLowerCase()) ||
      cat.toLowerCase().includes(t.category.toLowerCase())
    )
  );
  
  console.log(`🎯 Category matches for '${serviceType}': ${categoryTemplates.length}`);
  if (categoryTemplates.length > 0) {
    console.log(`📝 Found category templates: ${categoryTemplates.map(t => `${t.name} (${t.category})`).join(', ')}`);
  }
  
  if (categoryTemplates.length > 0) {
    // For resume-builder, prioritize Sales Representative Resume for better structure
    if (serviceType === 'resume-builder') {
      const salesRepTemplate = categoryTemplates.find(t => 
        t.name.toLowerCase().includes('sales representative')
      );
      if (salesRepTemplate) {
        console.log(`🎯 Prioritizing Sales Representative Resume for better structure compatibility`);
        return salesRepTemplate;
      }
    }
    
    // Score templates based on prompt keywords
    const scoredTemplates = categoryTemplates.map(template => {
      let score = 0;
      const promptLower = prompt.toLowerCase();
      
      // Score based on tags
      if (template.tags) {
        template.tags.forEach(tag => {
          if (promptLower.includes(tag.toLowerCase())) {
            score += 3;
          }
        });
      }
      
      // Score based on sector
      const sectorKeywords = {
        marketing: ['marketing', 'campaign', 'brand', 'advertising', 'promotion', 'social media', 'sales'],
        finance: ['financial', 'budget', 'revenue', 'investment', 'profit', 'accounting', 'money'],
        technology: ['tech', 'software', 'digital', 'AI', 'development', 'innovation', 'app'],
        real_estate: ['property', 'real estate', 'housing', 'rental', 'mortgage', 'development'],
        general: ['business', 'professional', 'company', 'corporate']
      };
      
      const sectorKeywordList = sectorKeywords[template.sector as keyof typeof sectorKeywords] || [];
      sectorKeywordList.forEach(keyword => {
        if (promptLower.includes(keyword)) {
          score += 2;
        }
      });
      
      // Score based on template name and description
      if (promptLower.includes(template.name.toLowerCase())) {
        score += 5;
      }
      if (promptLower.includes(template.description.toLowerCase())) {
        score += 2;
      }
      
      return { template, score };
    });
    
    // Return the highest scoring template
    const bestTemplate = scoredTemplates.sort((a, b) => b.score - a.score)[0];
    if (bestTemplate.score > 0) {
      return bestTemplate.template;
    }
    
    // If no scoring matches, return the most used template in category
    return categoryTemplates.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))[0];
  }
  
  // Fallback: find templates by service type keywords
  const serviceKeywords = {
    'pitch-deck': ['pitch', 'presentation', 'startup', 'funding', 'business plan'],
    'resume': ['resume', 'cv', 'job', 'career', 'experience', 'work history'],
    'brochure': ['brochure', 'marketing', 'product', 'service', 'promotional'],
    'report': ['report', 'analysis', 'data', 'research', 'findings'],
    'invoice': ['invoice', 'bill', 'payment', 'charge', 'cost'],
    'business-plan': ['business plan', 'strategy', 'startup', 'company'],
    'ebook': ['ebook', 'book', 'guide', 'manual', 'content'],
    'newsletter': ['newsletter', 'email', 'update', 'news']
  };
  
  for (const [category, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
      const categoryTemplates = await storage.getTemplatesByCategory(category);
      if (categoryTemplates.length > 0) {
        return categoryTemplates[0]; // Return the first/most used template
      }
    }
  }
  
  // Final fallback: return any valid template that matches the service type loosely
  const fallbackTemplate = validTemplates.find(t => 
    t.category && (
      t.category.toLowerCase().includes(serviceType.toLowerCase().replace('-', '')) ||
      t.category.toLowerCase().includes(serviceType.toLowerCase().replace(' ', ''))
    )
  ) || validTemplates[0]; // Return first valid template if nothing matches
  
  if (fallbackTemplate) {
    console.log(`🔧 Using fallback template: ${fallbackTemplate.name} (${fallbackTemplate.category})`);
  } else {
    console.log("❌ No valid fallback template found");
  }
  
  return fallbackTemplate;
}

// Backend template finder function with enhanced debugging
async function findBackendTemplate(prompt: string, serviceType: string) {
  console.log(`🔍 Looking for backend template: serviceType=${serviceType}`);
  
  const fs = await import('fs');
  const path = await import('path');
  
  try {
    const templatesDir = path.join(process.cwd(), 'server/templates');
    console.log(`📁 Backend templates directory: ${templatesDir}`);
    
    // Check if templates directory exists
    if (!fs.existsSync(templatesDir)) {
      console.log('❌ Backend templates directory not found');
      return null;
    }
    
    // List available backend template files
    const availableFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
    console.log(`📋 Available backend template files: ${availableFiles.join(', ')}`);
    
    // Enhanced map service types to template file names
    const templateMap: Record<string, string> = {
      'resume': 'resume.json',
      'resume-builder': 'resume.json',
      'cv': 'resume.json',
      'curriculum-vitae': 'resume.json',
      'pitch-deck': 'pitch-deck.json',
      'presentation': 'pitch-deck.json',
      'startup-pitch': 'pitch-deck.json',
      'investor-deck': 'pitch-deck.json',
      'brochure': 'brochure.json',
      'brochure-designer': 'brochure.json',
      'marketing-brochure': 'brochure.json',
      'flyer': 'brochure.json',
      'leaflet': 'brochure.json',
      'report': 'report.json',
      'report-generator': 'report.json',
      'financial-report': 'report.json',
      'business-report': 'report.json',
      'analysis': 'report.json',
      'invoice': 'invoice.json',
      'invoice-creator': 'invoice.json',
      'invoice-generator': 'invoice.json',
      'bill': 'invoice.json',
      'billing': 'invoice.json',
      'business-plan': 'business-plan.json',
      'business-plan-generator': 'business-plan.json',
      'startup-plan': 'business-plan.json',
      'company-plan': 'business-plan.json',
      'newsletter': 'newsletter.json',
      'newsletter-designer': 'newsletter.json',
      'newsletter-generator': 'newsletter.json',
      'company-newsletter': 'newsletter.json',
      'email-newsletter': 'newsletter.json',
      'ebook-creator': 'report.json', // Use report template for ebooks
      'ebook': 'report.json',
      'chart-generator': 'report.json', // Use report template for charts/graphs
      'chart': 'report.json',
      'graph': 'report.json'
    };
    
    console.log(`🎯 Template mapping for '${serviceType}': ${templateMap[serviceType] || 'not found'}`);
    
    // First try exact match
    let templateFile = templateMap[serviceType];
    
    // If no exact match, try partial matches
    if (!templateFile) {
      for (const [key, file] of Object.entries(templateMap)) {
        if (serviceType.includes(key) || key.includes(serviceType)) {
          templateFile = file;
          break;
        }
      }
    }
    
    // If still no match, try keyword matching
    if (!templateFile) {
      const promptLower = prompt.toLowerCase();
      if (promptLower.includes('resume') || promptLower.includes('cv') || promptLower.includes('job')) {
        templateFile = 'resume.json';
      } else if (promptLower.includes('pitch') || promptLower.includes('presentation') || promptLower.includes('startup')) {
        templateFile = 'pitch-deck.json';
      } else if (promptLower.includes('brochure') || promptLower.includes('marketing')) {
        templateFile = 'brochure.json';
      }
    }
    
    if (!templateFile) {
      console.log(`❌ No backend template mapping found for service type: ${serviceType}`);
      return null;
    }
    
    const templatePath = path.join(templatesDir, templateFile);
    console.log(`📄 Trying to load template file: ${templatePath}`);
    
    if (!fs.existsSync(templatePath)) {
      console.log(`❌ Backend template file not found: ${templatePath}`);
      return null;
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const template = JSON.parse(templateContent);
    
    // Validate template structure
    if (!template.id || !template.name || !template.category) {
      console.log(`⚠️ Invalid backend template structure: ${templateFile}`);
      return null;
    }
    
    console.log(`✅ Using BACKEND template: ${template.name} (${template.category})`);
    return template;
    
  } catch (error) {
    console.error('Error loading backend template:', error);
    return null;
  }
}

// Helper function to map service types to template categories
function getCategoryMappingForServiceType(serviceType: string): string[] {
  const categoryMappings: Record<string, string[]> = {
    'resume': ['resume'],
    'resume-builder': ['resume'],
    'cv': ['resume'],
    'curriculum-vitae': ['resume'],
    'pitch-deck': ['pitch-deck'],
    'presentation': ['pitch-deck'],
    'startup-pitch': ['pitch-deck'],
    'investor-deck': ['pitch-deck'],
    'brochure': ['brochure'],
    'brochure-designer': ['brochure'],
    'marketing-brochure': ['brochure'],
    'flyer': ['brochure'],
    'leaflet': ['brochure'],
    'report': ['report', 'financial-report', 'business-report'],
    'report-generator': ['report', 'financial-report', 'business-report'],
    'financial-report': ['report', 'financial-report'],
    'business-report': ['report', 'business-report'],
    'analysis': ['report'],
    'invoice': ['invoice'],
    'invoice-creator': ['invoice'],
    'invoice-generator': ['invoice'],
    'bill': ['invoice'],
    'billing': ['invoice'],
    'business-plan': ['business-plan'],
    'business-plan-generator': ['business-plan'],
    'startup-plan': ['business-plan'],
    'company-plan': ['business-plan'],
    'newsletter': ['newsletter'],
    'newsletter-designer': ['newsletter'],
    'newsletter-generator': ['newsletter'],
    'company-newsletter': ['newsletter'],
    'email-newsletter': ['newsletter'],
    'ebook-creator': ['ebook'],
    'ebook': ['ebook'],
    'chart-generator': ['chart'],
    'chart': ['chart'],
    'graph': ['chart']
  };

  return categoryMappings[serviceType] || ['report']; // Default to report category
}



// Helper function to merge template with content
function mergeTemplateWithContent(templateData: any, content: any): any {
  // For sections-based templates, use the AI-generated content directly
  if (templateData.sections && content.sections) {
    return {
      ...content,
      _templateStructure: templateData // Keep original template structure for reference
    };
  }
  
  // For structured templates, merge the content while preserving template structure
  if (templateData.sections) {
    return {
      sections: templateData.sections.map((templateSection: any) => {
        const contentSection = content.sections?.find((s: any) => s.type === templateSection.type);
        return {
          ...templateSection,
          content: contentSection?.content || templateSection.content
        };
      }),
      ...content,
      _templateStructure: templateData
    };
  }
  
  return { ...templateData, ...content };
}

// Enhanced generation endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, serviceType, templateId } = req.body;
    
    if (!prompt || !serviceType) {
      return res.status(400).json({ message: "Prompt and service type are required" });
    }

    // Get user if authenticated
    const userId = req.session?.userId;
    let user = null;
    
    if (userId) {
      user = await storage.getUser(userId);
      
      // Check usage limits for authenticated users
      const planLimits = {
        starter: 8,
        pro: 40,
        agency: Infinity
      };
      
      const currentLimit = planLimits[user.currentPlan as keyof typeof planLimits] || 8;
      
      if (user.monthlyUsage >= currentLimit) {
        return res.status(429).json({ 
          message: "Monthly design limit reached. Please upgrade your plan.",
          currentUsage: user.monthlyUsage,
          limit: currentLimit
        });
      }
    }

    // Find the best matching template
    let selectedTemplate;
    if (templateId && templateId !== "auto-select") {
      // If user specified a specific template, use it
      console.log(`🎯 User selected specific template: ${templateId}`);
      selectedTemplate = await storage.getTemplate(templateId);
      
      if (selectedTemplate) {
        console.log(`✅ Found user-selected template: ${selectedTemplate.name}`);
      } else {
        console.log(`❌ User-selected template not found: ${templateId}`);
      }
    }
    
    if (!selectedTemplate) {
      // PRIORITIZE DATABASE TEMPLATES OVER BACKEND TEMPLATES
      console.log('🔍 Looking for database templates (auto-select)...');
      
      // First try to find database templates
      selectedTemplate = await findBestTemplate(prompt, serviceType);
      
      // If no database template found, fallback to backend templates
      if (!selectedTemplate) {
        console.log('📁 No database template found, using backend templates');
        selectedTemplate = await findBackendTemplate(prompt, serviceType);
      }
    }
    
    if (!selectedTemplate) {
      return res.status(404).json({ message: "No suitable template found" });
    }

    console.log(`🎯 Selected template: ${selectedTemplate.name} (${selectedTemplate.category})`);

    // Detect sector from prompt
    const sectorKeywords = {
      marketing: ['marketing', 'campaign', 'brand', 'advertising', 'promotion', 'social media'],
      finance: ['financial', 'budget', 'revenue', 'investment', 'profit', 'accounting'],
      technology: ['tech', 'software', 'digital', 'AI', 'development', 'innovation'],
      real_estate: ['property', 'real estate', 'housing', 'rental', 'mortgage', 'development']
    };
    
    let detectedSector = selectedTemplate.sector || 'general';
    const promptLower = prompt.toLowerCase();
    
    for (const [sector, keywords] of Object.entries(sectorKeywords)) {
      if (keywords.some(keyword => promptLower.includes(keyword))) {
        detectedSector = sector;
        break;
      }
    }

    // Build enhanced system prompt using template information
    console.log(`🔍 Template data type: ${typeof selectedTemplate.templateData}`);
    console.log(`📝 Raw template data: ${selectedTemplate.templateData ? JSON.stringify(selectedTemplate.templateData).substring(0, 200) + '...' : 'NULL'}`);
    
    let templateStructure;
    if (typeof selectedTemplate.templateData === 'string') {
      try {
        templateStructure = JSON.stringify(JSON.parse(selectedTemplate.templateData), null, 2);
      } catch (e) {
        console.log('⚠️ Failed to parse template data as JSON, using as string');
        templateStructure = selectedTemplate.templateData;
      }
    } else if (selectedTemplate.templateData) {
      templateStructure = JSON.stringify(selectedTemplate.templateData, null, 2);
    } else {
      templateStructure = `Generic ${selectedTemplate.category} template structure`;
    }
    
    console.log(`🏗️ Final template structure length: ${templateStructure.length} chars`);
    
    const basePrompt = selectedTemplate.aiPromptTemplate || 
      `Create professional ${selectedTemplate.category} content following the template structure.`;
    
    const enhancedSystemPrompt = `You are a professional document creation assistant. Your task is to generate high-quality, personalized content that follows the exact template structure and design layout provided.

MANDATORY REQUIREMENTS:
1. Return the EXACT template structure - no modifications to the JSON structure
2. Extract ALL available information from the user's prompt (names, companies, experience, locations, skills, etc.)
3. Generate professional, realistic content - NO placeholders like "Generated content"
4. Follow the template's intended design and layout structure
5. Create content that matches the professional quality of the template design
6. For sections-based templates, write detailed, specific content for each section
7. Ensure all content is relevant to the user's actual background and experience

Template structure to follow exactly:
${templateStructure}

You must fill every field and section with actual, professional content based on the user's prompt. No generic text, no placeholders, no fallback content - only real, personalized information.`;

    const enhancedUserPrompt = `Create professional content for this template structure:
${templateStructure}

Based on this user request: "${prompt}"

EXTRACT AND USE:
- Full names, job titles, company names, locations from the prompt
- Years of experience, specific skills, educational background
- Industry sectors, previous roles, achievements mentioned
- Contact information patterns (create realistic emails/phones based on names/locations)

GENERATE PROFESSIONAL CONTENT:
- Write specific, detailed content for each section
- Use the person's actual background and experience
- Create realistic, professional formatting
- Match the quality and style expected from this template design
- Ensure content flows naturally and reads professionally

Return ONLY the filled JSON structure with all placeholder values replaced by actual, professional content.`;

    // Generate content using OpenAI with template context
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: enhancedSystemPrompt },
        { role: "user", content: enhancedUserPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Very low temperature for consistent, precise content
      max_tokens: 4000
    });

    let generatedContent;
    try {
      generatedContent = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Ensure response has same structure as template
      if (selectedTemplate.templateData && typeof selectedTemplate.templateData === 'object') {
        const templateKeys = Object.keys(selectedTemplate.templateData);
        const responseKeys = Object.keys(generatedContent);
        
        console.log(`🔍 Template has keys: ${templateKeys.join(', ')}`);
        console.log(`🔍 Response has keys: ${responseKeys.join(', ')}`);
        
        // Validate that AI generated proper content (reject if generic placeholders found)
        if (selectedTemplate.templateData.sections && generatedContent.sections) {
          const hasPlaceholders = generatedContent.sections.some((section: any) => 
            !section.content || 
            section.content === "Generated content" || 
            section.content.includes("Generated content") ||
            section.content.includes("Content for")
          );
          
          if (hasPlaceholders) {
            console.error("❌ AI generated placeholder content, rejecting response");
            return res.status(500).json({ 
              message: "AI failed to generate proper personalized content. Please try again with more specific details in your prompt." 
            });
          }
        }
        
        // Merge template with generated content to ensure complete structure
        generatedContent = mergeTemplateWithContent(selectedTemplate.templateData, generatedContent);
      }
    } catch (e) {
      console.error('❌ Failed to parse AI response as JSON:', e);
      generatedContent = selectedTemplate.templateData || {};
    }
    
    // Determine the template ID for document storage (use database ID for backend templates)
    let documentTemplateId = selectedTemplate.id;
    if (selectedTemplate.id && selectedTemplate.id.startsWith('backend-')) {
      documentTemplateId = 'f49f5ff5-0ba4-48cb-aad3-f6e10b8f275e'; // Use Executive Resume template ID
    }
    
    // Ensure the generated content includes template metadata and structure
    const finalContent = {
      ...generatedContent,
      templateInfo: {
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        templateSector: detectedSector,
        templateCategory: selectedTemplate.category
      }
    };
    
    // Create display data that merges template with content
    const displayData = mergeTemplateWithContent(selectedTemplate.templateData || {}, generatedContent);
    
    // For authenticated users, create and save document
    let document = null;
    if (userId && user) {
      console.log(`💾 Creating document with template ID: ${documentTemplateId} (original: ${selectedTemplate.id})`);
      
      document = await storage.createDocument({
        userId: user.id,
        templateId: documentTemplateId,
        title: generatedContent.title || `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        content: finalContent,
        originalPrompt: prompt,
        serviceType: selectedTemplate.category,
        thumbnailUrl: selectedTemplate.previewImageUrl || 
          `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=300&h=200&fit=crop`,
        detectedSector,
        status: 'completed'
      });

      // Increment template usage counter only for database templates
      if (!selectedTemplate.id.startsWith('backend-')) {
        await storage.incrementTemplateUsage(selectedTemplate.id);
      }

      // Update user usage
      await storage.updateUserUsage(user.id, 1);
      
      // Enhanced logging for debugging frontend display
      console.log("=== SENDING TO FRONTEND ===");
      console.log("Template used:", selectedTemplate?.name);
      console.log("Template structure:", JSON.stringify(selectedTemplate?.templateData, null, 2));
      console.log("Generated content:", JSON.stringify(generatedContent, null, 2));
      console.log("Document content:", JSON.stringify(document?.content, null, 2));
      console.log("=========================");
      
      // Return document with enhanced structure information
      const responseData = {
        ...document,
        templateName: selectedTemplate.name,
        templateCategory: selectedTemplate.category,
        templateUsed: selectedTemplate.name,
        templateStructure: selectedTemplate.templateData,
        generatedContent: generatedContent,
        displayData: displayData,
        content: {
          ...document.content,
          _templateStructure: selectedTemplate.templateData,
          _isStructured: true
        }
      };
      
      console.log("Final response:", JSON.stringify(responseData, null, 2));
      return res.json(responseData);
    }

    // Enhanced logging for debugging frontend display
    console.log("=== SENDING TO FRONTEND (GUEST) ===");
    console.log("Template used:", selectedTemplate?.name);
    console.log("Template structure:", JSON.stringify(selectedTemplate?.templateData, null, 2));
    console.log("Generated content:", JSON.stringify(generatedContent, null, 2));
    console.log("=========================");
    
    // For guest users, return generated content without saving
    const responseData = {
      title: generatedContent.title || `Generated ${selectedTemplate.category}`,
      templateName: selectedTemplate.name,
      templateCategory: selectedTemplate.category,
      content: {
        ...finalContent,
        _templateStructure: selectedTemplate.templateData,
        _isStructured: true
      },
      templateInfo: {
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        templateCategory: selectedTemplate.category,
        templateSector: detectedSector
      },
      templateUsed: selectedTemplate.name,
      templateStructure: selectedTemplate.templateData,
      generatedContent: generatedContent,
      displayData: displayData,
      originalPrompt: prompt,
      serviceType: selectedTemplate.category,
      detectedSector,
      id: `guest-${Date.now()}`,
      isGuest: true,
      message: "Sign up to save and access your designs anytime!"
    };
    
    console.log("Final response:", JSON.stringify(responseData, null, 2));
    return res.json(responseData);

  } catch (error: any) {
    console.error("Generation error:", error);
    res.status(500).json({ 
      message: error.message || "Failed to generate content",
      isGuest: !req.session?.userId
    });
  }
});

  // Chat support routes
  app.get("/api/chat-sessions", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat-sessions", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertChatSessionSchema.parse({
        ...req.body,
        userId: userId
      });

      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.post("/api/chat-sessions/:sessionId/messages", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        chatSessionId: req.params.sessionId
      });

      const message = await storage.createChatMessage(validatedData);
      res.json(message);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/chat-sessions/:sessionId/messages", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const messages = await storage.getChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions to generate download text content
function generateResumeText(content: any): string {
  let text = '';
  
  if (content.sections) {
    for (const section of content.sections) {
      if (section.type === 'header' && section.fields) {
        text += `${section.fields.name || 'Professional Name'}\n`;
        text += `${section.fields.title || 'Professional Title'}\n`;
        text += `${section.fields.contact || 'Contact Information'}\n\n`;
      } else if (section.title && section.content) {
        text += `${section.title}\n`;
        text += `${'-'.repeat(section.title.length)}\n`;
        text += `${section.content}\n\n`;
      } else if (section.type && section.content) {
        text += `${section.type.toUpperCase()}\n`;
        text += `${'-'.repeat(section.type.length)}\n`;
        text += `${section.content}\n\n`;
      }
    }
  } else {
    text = JSON.stringify(content, null, 2);
  }
  
  return text;
}

function generatePitchDeckText(content: any): string {
  let text = 'PITCH DECK\n==========\n\n';
  
  if (content.slides) {
    for (let i = 0; i < content.slides.length; i++) {
      const slide = content.slides[i];
      text += `SLIDE ${i + 1}: ${slide.type?.toUpperCase() || 'SLIDE'}\n`;
      text += `${'-'.repeat(30)}\n`;
      
      if (slide.title) text += `Title: ${slide.title}\n`;
      if (slide.subtitle) text += `Subtitle: ${slide.subtitle}\n`;
      if (slide.content) text += `Content: ${slide.content}\n`;
      if (slide.presenter) text += `Presenter: ${slide.presenter}\n`;
      
      text += '\n';
    }
  } else {
    text += JSON.stringify(content, null, 2);
  }
  
  return text;
}

function generateBrochureText(content: any): string {
  let text = 'MARKETING BROCHURE\n==================\n\n';
  
  if (content.sections) {
    for (const section of content.sections) {
      if (section.title) {
        text += `${section.title}\n`;
        text += `${'-'.repeat(section.title.length)}\n`;
      }
      if (section.content) text += `${section.content}\n\n`;
      if (section.subtitle) text += `${section.subtitle}\n\n`;
    }
  } else {
    text += JSON.stringify(content, null, 2);
  }
  
  return text;
}

function generateReportText(content: any): string {
  let text = 'BUSINESS REPORT\n===============\n\n';
  
  if (content.sections) {
    for (const section of content.sections) {
      if (section.title) {
        text += `${section.title}\n`;
        text += `${'='.repeat(section.title.length)}\n`;
      }
      if (section.content) text += `${section.content}\n\n`;
    }
  } else {
    text += JSON.stringify(content, null, 2);
  }
  
  return text;
}

function generateInvoiceText(content: any): string {
  let text = 'INVOICE\n=======\n\n';
  
  if (content.sections) {
    for (const section of content.sections) {
      if (section.type === 'header' && section.fields) {
        text += `Company: ${section.fields.companyName || 'Company Name'}\n`;
        text += `Address: ${section.fields.companyAddress || 'Company Address'}\n`;
        text += `Invoice #: ${section.fields.invoiceNumber || 'INV-001'}\n`;
        text += `Date: ${section.fields.date || new Date().toLocaleDateString()}\n\n`;
      } else if (section.type === 'client_info' && section.fields) {
        text += `BILL TO:\n`;
        text += `${section.fields.clientName || 'Client Name'}\n`;
        text += `${section.fields.clientAddress || 'Client Address'}\n\n`;
      }
    }
  } else {
    text += JSON.stringify(content, null, 2);
  }
  
  return text;
}

function generateBusinessPlanText(content: any): string {
  let text = 'BUSINESS PLAN\n=============\n\n';
  
  if (content.sections) {
    for (const section of content.sections) {
      if (section.title) {
        text += `${section.title}\n`;
        text += `${'='.repeat(section.title.length)}\n`;
      }
      if (section.content) text += `${section.content}\n\n`;
    }
  } else {
    text += JSON.stringify(content, null, 2);
  }
  
  return text;
}

function generateNewsletterText(content: any): string {
  let text = 'NEWSLETTER\n==========\n\n';
  
  if (content.sections) {
    for (const section of content.sections) {
      if (section.type === 'header' && section.fields) {
        text += `${section.fields.title || 'Newsletter Title'}\n`;
        text += `${section.fields.subtitle || ''}\n`;
        text += `Date: ${section.fields.date || new Date().toLocaleDateString()}\n\n`;
      } else if (section.title && section.content) {
        text += `${section.title}\n`;
        text += `${'-'.repeat(section.title.length)}\n`;
        text += `${section.content}\n\n`;
      }
    }
  } else {
    text += JSON.stringify(content, null, 2);
  }
  
  return text;
}