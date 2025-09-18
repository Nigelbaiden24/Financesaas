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
  googleAuth, 
  facebookAuth, 
  emailSignUp, 
  emailSignIn, 
  logout, 
  getCurrentUser, 
  requireAuth,
  type AuthRequest 
} from "./auth";

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
  app.post("/api/auth/google", googleAuth);
  app.post("/api/auth/facebook", facebookAuth);
  app.post("/api/auth/signup", emailSignUp);
  app.post("/api/auth/signin", emailSignIn);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/user", getCurrentUser);

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

  // Protected Documents API
  app.get("/api/documents", requireAuth, async (req: AuthRequest, res) => {
    try {
      const documents = await storage.getDocuments(req.user!.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user owns the document
      if (document.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", requireAuth, async (req: AuthRequest, res) => {
    try {
      // Check usage limits
      const user = req.user!;
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
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Document creation error:", error);
      res.status(400).json({ message: "Invalid document data" });
    }
  });

  app.put("/api/documents/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user owns the document
      if (document.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedDocument = await storage.updateDocument(req.params.id, req.body);
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user owns the document
      if (document.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const deleted = await storage.deleteDocument(req.params.id);
      if (deleted) {
        res.json({ message: "Document deleted successfully" });
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // AI Generation endpoint
  app.post("/api/generate", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { prompt, serviceType, templateId } = req.body;
      
      if (!prompt || !serviceType) {
        return res.status(400).json({ message: "Prompt and service type are required" });
      }

      // Check usage limits
      const user = req.user!;
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

      // Detect sector from prompt keywords
      const sectorKeywords = {
        marketing: ['marketing', 'campaign', 'brand', 'advertising', 'promotion', 'social media'],
        finance: ['financial', 'budget', 'revenue', 'investment', 'profit', 'accounting'],
        technology: ['tech', 'software', 'digital', 'AI', 'development', 'innovation'],
        real_estate: ['property', 'real estate', 'housing', 'rental', 'mortgage', 'development']
      };
      
      let detectedSector = 'general';
      const promptLower = prompt.toLowerCase();
      
      for (const [sector, keywords] of Object.entries(sectorKeywords)) {
        if (keywords.some(keyword => promptLower.includes(keyword))) {
          detectedSector = sector;
          break;
        }
      }

      // Generate content using OpenAI
      const systemPrompt = `You are an expert ${serviceType} creator with specialization in ${detectedSector} sector. 
      Create professional, industry-specific content based on the user's prompt. 
      Return structured JSON data that can be used to populate a ${serviceType} template.
      Focus on ${detectedSector === 'general' ? 'professional business' : detectedSector} industry standards and best practices.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const generatedContent = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Create document with generated content
      const document = await storage.createDocument({
        userId: user.id,
        templateId: templateId || 'default',
        title: generatedContent.title || `Generated ${serviceType}`,
        content: generatedContent,
        originalPrompt: prompt,
        serviceType,
        thumbnailUrl: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=300&h=200&fit=crop`,
        detectedSector,
        status: 'completed'
      });

      // Update user usage
      await storage.updateUserUsage(user.id, 1);

      res.json({
        document,
        detectedSector,
        usage: {
          current: user.monthlyUsage + 1,
          limit: currentLimit
        }
      });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // User dashboard stats
  app.get("/api/user/stats", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const documents = await storage.getDocuments(user.id);
      
      const planLimits = {
        starter: 8,
        pro: 40,
        agency: Infinity
      };
      
      const stats = {
        currentPlan: user.currentPlan,
        monthlyUsage: user.monthlyUsage,
        planLimit: planLimits[user.currentPlan as keyof typeof planLimits] || 8,
        totalDesigns: documents.length,
        completedDesigns: documents.filter(doc => doc.status === 'completed').length,
        recentDesigns: documents
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Chat system (simplified for now)
  app.post("/api/chat/sessions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse({
        userId: req.user!.id,
        isActive: true
      });
      
      const session = await storage.createChatSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Failed to create chat session" });
    }
  });

  app.get("/api/chat/sessions/:id/messages", requireAuth, async (req: AuthRequest, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/messages", requireAuth, async (req: AuthRequest, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.addChatMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}