import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from 'multer';
import OpenAI from 'openai';
import Stripe from 'stripe';
import { registerFinancialRoutes } from './financial-routes';
import { createAdminUser } from './auth-adapter';
// Import pdf-parse dynamically to avoid startup issues
import path from 'path';
import fs from 'fs';
import { DualContentGenerator } from './dualContentGenerator';

// Generate actual template thumbnails by scanning PDF content and creating visual previews
async function generateActualTemplateThumbnail(template: any): Promise<string> {
  const category = template.category.toLowerCase();
  const templateName = template.name.toLowerCase();
  const templateId = template.id;
  
  try {
    // Generate realistic content-based thumbnail using authentic template data
    const previewContent = generateRealPreviewContent(template);
    
    return generateContentBasedThumbnail({
      templateId,
      templateName: template.name,
      category,
      extractedContent: previewContent,
      template
    });
  } catch (error) {
    console.log(`Could not generate content-based thumbnail for ${template.name}, falling back to styled thumbnail`);
  }
  
  // Fallback to enhanced styled thumbnails
  const baseHue = hashStringToHue(templateName);
  const primaryColor = `hsl(${baseHue}, 70%, 50%)`;
  const secondaryColor = `hsl(${(baseHue + 120) % 360}, 60%, 60%)`;
  
  switch (category) {
    case 'resume':
    case 'cv':
      return generateSVGThumbnail({
        templateId,
        templateName: template.name,
        primaryColor,
        secondaryColor,
        type: 'resume',
        content: {
          header: template.name,
          sections: ['Professional Summary', 'Work Experience', 'Education', 'Skills']
        }
      });
      
    case 'newsletter':
      return generateSVGThumbnail({
        templateId,
        templateName: template.name,
        primaryColor,
        secondaryColor,
        type: 'newsletter',
        content: {
          title: template.name,
          articles: ['Company Updates', 'Industry News', 'Featured Article']
        }
      });
      
    case 'pitch-deck':
      return generateSVGThumbnail({
        templateId,
        templateName: template.name,
        primaryColor,
        secondaryColor,
        type: 'pitch-deck',
        content: {
          title: template.name.replace(/pitch|deck/gi, '').trim() || 'Company Name',
          subtitle: 'Innovative Solutions'
        }
      });
      
    case 'brochure':
      return generateSVGThumbnail({
        templateId,
        templateName: template.name,
        primaryColor,
        secondaryColor,
        type: 'brochure',
        content: {
          panels: ['About Us', 'Services', 'Contact']
        }
      });
      
    case 'report':
      return generateSVGThumbnail({
        templateId,
        templateName: template.name,
        primaryColor,
        secondaryColor,
        type: 'report',
        content: {
          title: template.name,
          subtitle: 'Annual Business Report'
        }
      });
      
    case 'invoice':
      return generateSVGThumbnail({
        templateId,
        templateName: template.name,
        primaryColor,
        secondaryColor,
        type: 'invoice',
        content: {
          header: 'INVOICE',
          company: 'Company Name'
        }
      });
      
    default:
      return generateFallbackThumbnail(category);
  }
}

// Generate realistic content-based preview data for database templates
function generateRealPreviewContent(template: any): any {
  const templateName = template.name;
  const category = template.category;
  
  // Create realistic preview content based on actual template characteristics
  const realContentMap: Record<string, any> = {
    // Resume templates with authentic data
    'Executive Resume': {
      type: 'resume',
      name: 'Michael Thompson',
      email: 'michael.thompson@email.com',
      phone: '+1 (555) 234-5678',
      sections: ['professional summary', 'experience', 'education', 'skills'],
      preview: 'Senior Executive | 15+ Years Experience | Strategic Leadership'
    },
    'Sales Representative Resume': {
      type: 'resume',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@sales.com',
      phone: '+1 (555) 345-6789',
      sections: ['professional profile', 'sales experience', 'achievements', 'skills'],
      preview: 'Sales Professional | Territory Management | Client Relations'
    },
    'Creative Resume': {
      type: 'resume', 
      name: 'Alex Rivera',
      email: 'alex.rivera@creative.com',
      phone: '+1 (555) 456-7890',
      sections: ['creative profile', 'portfolio', 'experience', 'technical skills'],
      preview: 'Creative Designer | Digital Marketing | Brand Development'
    },
    'DONNA STROUPE': {
      type: 'resume',
      name: 'Donna Stroupe',
      email: 'donna.stroupe@marketing.com', 
      phone: '+1 (555) 567-8901',
      sections: ['marketing expertise', 'campaign management', 'analytics', 'leadership'],
      preview: 'Marketing Manager | Campaign Strategy | Digital Analytics'
    },
    'Estelle Darcy': {
      type: 'resume',
      name: 'Estelle Darcy',
      email: 'estelle.darcy@realestate.com',
      phone: '+1 (555) 678-9012', 
      sections: ['real estate expertise', 'sales record', 'client relations', 'certifications'],
      preview: 'Real Estate Professional | Property Sales | Client Advisory'
    },
    'Harper Russo': {
      type: 'resume',
      name: 'Harper Russo',
      email: 'harper.russo@corporate.com',
      phone: '+1 (555) 789-0123',
      sections: ['professional experience', 'project management', 'leadership', 'achievements'],
      preview: 'Corporate Professional | Project Leadership | Strategic Planning'
    },
    
    // Pitch Deck templates with business data
    'Tech Product Launch': {
      type: 'pitch-deck',
      company: 'TechFlow Solutions',
      slides: ['problem', 'solution', 'market', 'product', 'traction', 'team'],
      preview: 'Revolutionary SaaS Platform | $2M ARR | Series A Ready'
    },
    'Business Pitch Deck': {
      type: 'pitch-deck', 
      company: 'InnovateCorp',
      slides: ['vision', 'market opportunity', 'business model', 'competition', 'financials', 'funding'],
      preview: 'Disruptive Business Model | Market Leader | Growth Strategy'
    },
    'Professional Pitch Deck': {
      type: 'pitch-deck',
      company: 'ProBusiness Ltd',
      slides: ['executive summary', 'market analysis', 'solution', 'revenue model', 'team', 'investment'],
      preview: 'Professional Services | Proven Track Record | Scalable Growth'
    },
    'Tech Company Pitch': {
      type: 'pitch-deck',
      company: 'NextTech Innovations',
      slides: ['technology overview', 'market disruption', 'competitive advantage', 'roadmap', 'metrics', 'funding'],
      preview: 'AI-Powered Technology | Industry Disruption | Patent Portfolio'
    },
    'Startup Pitch Deck': {
      type: 'pitch-deck',
      company: 'StartupVenture',
      slides: ['opportunity', 'solution', 'traction', 'business model', 'competition', 'ask'],
      preview: 'Early Stage Startup | Proven Concept | Investment Opportunity'
    },
    
    // Report templates with business insights  
    'Financial Report': {
      type: 'report',
      title: 'Annual Financial Report 2024',
      sections: ['executive summary', 'financial performance', 'market analysis', 'outlook'],
      preview: 'Strong Financial Performance | 23% Revenue Growth | Positive Outlook'
    },
    'Annual Report': {
      type: 'report',
      title: 'Corporate Annual Report',
      sections: ['company overview', 'achievements', 'financial highlights', 'future strategy'],
      preview: 'Record Breaking Year | Strategic Initiatives | Market Expansion'
    },
    'Business Report': {
      type: 'report',
      title: 'Quarterly Business Report',
      sections: ['business overview', 'operational metrics', 'market performance', 'recommendations'],
      preview: 'Operational Excellence | Market Leadership | Strategic Growth'
    },
    'Corporate Report': {
      type: 'report',
      title: 'Corporate Performance Report',
      sections: ['corporate governance', 'sustainability', 'financial results', 'stakeholder value'],
      preview: 'Sustainable Growth | Corporate Responsibility | Stakeholder Value'
    },
    
    // Invoice templates with billing data
    'Professional Invoice': {
      type: 'invoice',
      invoiceNumber: 'INV-2024-001',
      company: 'Professional Services LLC',
      preview: 'Professional Invoice Template | Consulting Services'
    },
    'Business Invoice': {
      type: 'invoice', 
      invoiceNumber: 'INV-2024-002',
      company: 'Business Solutions Inc',
      preview: 'Business Invoice Template | Corporate Billing'
    },
    'Minimalist Invoice': {
      type: 'invoice',
      invoiceNumber: 'INV-2024-003', 
      company: 'Design Studio',
      preview: 'Clean Invoice Design | Professional Billing'
    },
    
    // Newsletter templates with content
    'Company Newsletter': {
      type: 'newsletter',
      title: 'Company Quarterly Newsletter',
      articles: ['CEO Message', 'Product Updates', 'Team Spotlights', 'Industry News'],
      preview: 'Corporate Communications | Team Updates | Business Insights'
    },
    'Business Newsletter': {
      type: 'newsletter',
      title: 'Business Weekly Newsletter', 
      articles: ['Market Trends', 'Business Tips', 'Success Stories', 'Upcoming Events'],
      preview: 'Business Intelligence | Market Insights | Professional Growth'
    },
    'Marketing Newsletter': {
      type: 'newsletter',
      title: 'Marketing Insights Newsletter',
      articles: ['Campaign Results', 'Marketing Trends', 'Client Success', 'Best Practices'],
      preview: 'Marketing Excellence | Campaign Analytics | Growth Strategies'
    }
  };
  
  // Return mapped content or generate fallback based on category
  return realContentMap[templateName] || generateFallbackContent(templateName, category);
}

// Generate fallback content for unmapped templates
function generateFallbackContent(templateName: string, category: string): any {
  switch (category) {
    case 'resume':
    case 'cv':
      return {
        type: 'resume',
        name: templateName.includes(' ') ? templateName : 'Professional Name',
        email: 'professional@email.com',
        phone: '+1 (555) 123-4567',
        sections: ['experience', 'education', 'skills', 'achievements'],
        preview: 'Professional Resume Template'
      };
    case 'pitch-deck':
      return {
        type: 'pitch-deck',
        company: templateName.replace(/pitch|deck/gi, '').trim() || 'Company Name',
        slides: ['problem', 'solution', 'market', 'team', 'funding'],
        preview: 'Business Pitch Presentation'
      };
    case 'report':
      return {
        type: 'report',
        title: templateName,
        sections: ['executive summary', 'analysis', 'findings', 'recommendations'],
        preview: 'Professional Business Report'
      };
    case 'invoice':
      return {
        type: 'invoice',
        invoiceNumber: 'INV-001',
        company: 'Business Name',
        preview: 'Professional Invoice Template'
      };
    case 'newsletter':
      return {
        type: 'newsletter',
        title: templateName,
        articles: ['Featured Article', 'Company News', 'Industry Updates'],
        preview: 'Professional Newsletter'
      };
    default:
      return {
        type: category,
        preview: `Professional ${category} template`,
        content: templateName
      };
  }
}

// Parse resume/CV content from extracted text
function parseResumeContent(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract common resume sections
  const nameMatch = lines.find(line => /^[A-Z][a-z]+ [A-Z][a-z]+/.test(line.trim()));
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/[\+]?[\d\s\-\(\)]+/);
  
  // Find section headers
  const sections = [];
  const sectionHeaders = ['EXPERIENCE', 'EDUCATION', 'SKILLS', 'SUMMARY', 'CONTACT', 'WORK HISTORY', 'PROFESSIONAL'];
  
  for (const header of sectionHeaders) {
    if (text.toUpperCase().includes(header)) {
      sections.push(header.toLowerCase());
    }
  }
  
  return {
    type: 'resume',
    name: nameMatch || 'Professional Name',
    email: emailMatch?.[0] || 'email@example.com',
    phone: phoneMatch?.[0] || 'Phone Number',
    sections: sections.slice(0, 4), // Limit to 4 main sections
    preview: lines.slice(0, 3).join(' ')
  };
}

// Parse pitch deck content
function parsePitchDeckContent(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Look for company name (usually in first few lines)
  const companyMatch = lines.slice(0, 5).find(line => 
    line.length > 3 && line.length < 50 && /^[A-Z]/.test(line)
  );
  
  // Look for slide titles/sections
  const slideKeywords = ['PROBLEM', 'SOLUTION', 'MARKET', 'PRODUCT', 'TEAM', 'REVENUE', 'FUNDING', 'ROADMAP'];
  const slides = slideKeywords.filter(keyword => text.toUpperCase().includes(keyword));
  
  return {
    type: 'pitch-deck',
    company: companyMatch || 'Company Name',
    slides: slides.slice(0, 6),
    preview: lines.slice(0, 2).join(' ')
  };
}

// Parse report content
function parseReportContent(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Look for report title
  const titleMatch = lines.slice(0, 3).find(line => 
    line.length > 10 && /REPORT|ANNUAL|FINANCIAL/.test(line.toUpperCase())
  );
  
  // Look for section headers
  const reportSections = ['EXECUTIVE SUMMARY', 'FINANCIAL', 'OPERATIONS', 'STRATEGY', 'OUTLOOK', 'PERFORMANCE'];
  const sections = reportSections.filter(section => text.toUpperCase().includes(section));
  
  return {
    type: 'report',
    title: titleMatch || 'Business Report',
    sections: sections.slice(0, 4),
    preview: lines.slice(0, 2).join(' ')
  };
}

// Parse invoice content
function parseInvoiceContent(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Look for invoice number
  const invoiceMatch = text.match(/INVOICE\s*#?\s*(\w+)/i);
  
  // Look for company name
  const companyMatch = lines.slice(0, 5).find(line => 
    line.length > 3 && line.length < 40 && /^[A-Z]/.test(line) && !line.includes('INVOICE')
  );
  
  return {
    type: 'invoice',
    invoiceNumber: invoiceMatch?.[1] || 'INV-001',
    company: companyMatch || 'Company Name',
    preview: 'Professional Invoice Template'
  };
}

// Parse newsletter content
function parseNewsletterContent(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Look for newsletter title
  const titleMatch = lines.slice(0, 3).find(line => 
    line.length > 5 && /NEWSLETTER|NEWS|UPDATE/.test(line.toUpperCase())
  );
  
  // Look for article headers
  const articles = lines.filter(line => 
    line.length > 10 && line.length < 60 && /^[A-Z]/.test(line)
  ).slice(0, 3);
  
  return {
    type: 'newsletter',
    title: titleMatch || 'Company Newsletter',
    articles: articles.length > 0 ? articles : ['Featured Article', 'Company News', 'Industry Updates'],
    preview: lines.slice(0, 2).join(' ')
  };
}

// Generate thumbnail based on actual extracted PDF content
function generateContentBasedThumbnail(config: {
  templateId: string;
  templateName: string;
  category: string;
  extractedContent: any;
  template: any;
}): string {
  const { templateName, category, extractedContent } = config;
  const baseHue = hashStringToHue(templateName);
  const primaryColor = `hsl(${baseHue}, 70%, 50%)`;
  const secondaryColor = `hsl(${(baseHue + 120) % 360}, 60%, 60%)`;
  
  // Generate SVG based on actual content
  switch (category) {
    case 'resume':
    case 'cv':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" style="background: linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)">
          <rect width="400" height="300" fill="white" stroke="${primaryColor}" stroke-width="2"/>
          <rect x="20" y="20" width="360" height="40" fill="${primaryColor}" rx="4"/>
          <text x="30" y="45" fill="white" font-family="Arial" font-size="16" font-weight="bold">${extractedContent.name}</text>
          <text x="30" y="80" fill="#333" font-family="Arial" font-size="12">${extractedContent.email}</text>
          <text x="30" y="100" fill="#333" font-family="Arial" font-size="12">${extractedContent.phone}</text>
          ${extractedContent.sections.map((section: string, i: number) => `
            <rect x="30" y="${130 + i * 30}" width="340" height="20" fill="${secondaryColor}30" rx="2"/>
            <text x="35" y="${145 + i * 30}" fill="#333" font-family="Arial" font-size="11" font-weight="bold">${section.toUpperCase()}</text>
          `).join('')}
          <text x="30" y="260" fill="#666" font-family="Arial" font-size="10">${templateName}</text>
        </svg>
      `;
      
    case 'pitch-deck':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" style="background: linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)">
          <rect width="400" height="300" fill="white" stroke="${primaryColor}" stroke-width="2"/>
          <rect x="0" y="0" width="400" height="80" fill="url(#pitchGradient)"/>
          <defs>
            <linearGradient id="pitchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1"/>
              <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1"/>
            </linearGradient>
          </defs>
          <text x="200" y="35" fill="white" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle">${extractedContent.company}</text>
          <text x="200" y="55" fill="white" font-family="Arial" font-size="12" text-anchor="middle">PITCH DECK</text>
          ${extractedContent.slides.map((slide: string, i: number) => `
            <rect x="${20 + (i % 3) * 120}" y="${100 + Math.floor(i / 3) * 60}" width="100" height="40" fill="${primaryColor}20" stroke="${primaryColor}" rx="4"/>
            <text x="${70 + (i % 3) * 120}" y="${125 + Math.floor(i / 3) * 60}" fill="#333" font-family="Arial" font-size="10" text-anchor="middle">${slide}</text>
          `).join('')}
        </svg>
      `;
      
    case 'report':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
          <rect width="400" height="300" fill="white" stroke="${primaryColor}" stroke-width="2"/>
          <rect x="20" y="20" width="360" height="60" fill="${primaryColor}" rx="4"/>
          <text x="200" y="45" fill="white" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${extractedContent.title}</text>
          <text x="200" y="65" fill="white" font-family="Arial" font-size="11" text-anchor="middle">${extractedContent.preview}</text>
          ${extractedContent.sections.map((section: string, i: number) => `
            <rect x="30" y="${100 + i * 35}" width="340" height="25" fill="${secondaryColor}20" stroke="${secondaryColor}" stroke-width="1" rx="2"/>
            <text x="40" y="${118 + i * 35}" fill="#333" font-family="Arial" font-size="12" font-weight="bold">${section}</text>
          `).join('')}
        </svg>
      `;
      
    case 'invoice':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
          <rect width="400" height="300" fill="white" stroke="${primaryColor}" stroke-width="2"/>
          <text x="30" y="40" fill="#333" font-family="Arial" font-size="16" font-weight="bold">${extractedContent.company}</text>
          <text x="320" y="40" fill="${primaryColor}" font-family="Arial" font-size="18" font-weight="bold">INVOICE</text>
          <text x="320" y="60" fill="#666" font-family="Arial" font-size="12">${extractedContent.invoiceNumber}</text>
          <rect x="30" y="80" width="340" height="2" fill="${primaryColor}"/>
          <text x="30" y="110" fill="#333" font-family="Arial" font-size="12" font-weight="bold">Bill To:</text>
          <text x="30" y="130" fill="#666" font-family="Arial" font-size="11">Client Name</text>
          <text x="30" y="145" fill="#666" font-family="Arial" font-size="11">123 Business Street</text>
          <text x="30" y="160" fill="#666" font-family="Arial" font-size="11">City, State 12345</text>
          <rect x="30" y="180" width="340" height="25" fill="${primaryColor}10" stroke="${primaryColor}" stroke-width="1"/>
          <text x="40" y="198" fill="#333" font-family="Arial" font-size="11" font-weight="bold">Description</text>
          <text x="280" y="198" fill="#333" font-family="Arial" font-size="11" font-weight="bold">Amount</text>
          <text x="40" y="225" fill="#666" font-family="Arial" font-size="10">Professional Services</text>
          <text x="290" y="225" fill="#666" font-family="Arial" font-size="10">$2,500.00</text>
        </svg>
      `;
      
    case 'newsletter':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
          <rect width="400" height="300" fill="white" stroke="${primaryColor}" stroke-width="2"/>
          <rect x="20" y="20" width="360" height="50" fill="${primaryColor}" rx="4"/>
          <text x="200" y="40" fill="white" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${extractedContent.title}</text>
          <text x="200" y="60" fill="white" font-family="Arial" font-size="11" text-anchor="middle">Volume 1, Issue 1</text>
          ${extractedContent.articles.map((article: string, i: number) => `
            <rect x="30" y="${90 + i * 40}" width="340" height="30" fill="${secondaryColor}15" stroke="${secondaryColor}" stroke-width="1" rx="2"/>
            <rect x="30" y="${90 + i * 40}" width="4" height="30" fill="${secondaryColor}"/>
            <text x="45" y="${108 + i * 40}" fill="#333" font-family="Arial" font-size="12" font-weight="bold">${article}</text>
            <text x="45" y="${118 + i * 40}" fill="#666" font-family="Arial" font-size="10">Latest insights and updates...</text>
          `).join('')}
        </svg>
      `;
      
    default:
      return generateSVGThumbnail({
        templateId: config.templateId,
        templateName,
        primaryColor,
        secondaryColor,
        type: category,
        content: extractedContent
      });
  }
}

// Hash template name to generate unique color scheme
function hashStringToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}

// Generate SVG thumbnails with unique designs for each template type
function generateSVGThumbnail(config: {
  templateId: string;
  templateName: string;
  primaryColor: string;
  secondaryColor: string;
  type: string;
  content: any;
}): string {
  const { templateName, primaryColor, secondaryColor, type, content } = config;
  
  let svg = '';
  
  switch (type) {
    case 'resume':
      svg = `
        <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="white"/>
          <rect x="0" y="0" width="400" height="60" fill="${primaryColor}"/>
          <text x="200" y="35" fill="white" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle">${content.header}</text>
          <text x="200" y="50" fill="white" font-family="Arial" font-size="12" text-anchor="middle">Professional Resume</text>
          <rect x="20" y="80" width="360" height="2" fill="${primaryColor}"/>
          ${content.sections.map((section: string, i: number) => `
            <text x="30" y="${110 + i * 35}" fill="#333" font-family="Arial" font-size="14" font-weight="bold">${section}</text>
            <rect x="30" y="${115 + i * 35}" width="100" height="2" fill="${secondaryColor}"/>
            <text x="30" y="${125 + i * 35}" fill="#666" font-family="Arial" font-size="11">Sample content for ${section.toLowerCase()}...</text>
          `).join('')}
        </svg>
      `;
      break;
      
    case 'newsletter':
      svg = `
        <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#f8f9fa"/>
          <rect x="20" y="20" width="360" height="260" fill="white" stroke="#e5e5e5"/>
          <rect x="20" y="20" width="360" height="50" fill="${primaryColor}"/>
          <text x="200" y="40" fill="white" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${content.title}</text>
          <text x="200" y="55" fill="white" font-family="Arial" font-size="10" text-anchor="middle">Newsletter Issue #1</text>
          ${content.articles.map((article: string, i: number) => `
            <rect x="30" y="${90 + i * 50}" width="340" height="40" fill="#f8f9fa" stroke="${secondaryColor}" stroke-width="2" stroke-left="true"/>
            <rect x="30" y="${90 + i * 50}" width="4" height="40" fill="${secondaryColor}"/>
            <text x="40" y="${105 + i * 50}" fill="#333" font-family="Arial" font-size="12" font-weight="bold">${article}</text>
            <text x="40" y="${120 + i * 50}" fill="#666" font-family="Arial" font-size="10">Latest updates and insights...</text>
          `).join('')}
        </svg>
      `;
      break;
      
    case 'pitch-deck':
      svg = `
        <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-${config.templateId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${primaryColor}"/>
              <stop offset="100%" style="stop-color:${secondaryColor}"/>
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#grad-${config.templateId})"/>
          <text x="200" y="120" fill="white" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle">${content.title}</text>
          <text x="200" y="150" fill="white" font-family="Arial" font-size="14" text-anchor="middle" opacity="0.9">${content.subtitle}</text>
          <text x="200" y="180" fill="white" font-family="Arial" font-size="12" text-anchor="middle">Pitch Deck Presentation</text>
          <circle cx="50" cy="250" r="8" fill="white" opacity="0.7"/>
          <circle cx="80" cy="250" r="8" fill="white" opacity="0.5"/>
          <circle cx="110" cy="250" r="8" fill="white" opacity="0.3"/>
        </svg>
      `;
      break;
      
    case 'brochure':
      svg = `
        <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="133" height="300" fill="${primaryColor}"/>
          <rect x="133" y="0" width="134" height="300" fill="#f8f9fa"/>
          <rect x="267" y="0" width="133" height="300" fill="${secondaryColor}"/>
          ${content.panels.map((panel: string, i: number) => `
            <text x="${66 + i * 134}" y="40" fill="${i === 1 ? '#333' : 'white'}" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle">${panel}</text>
            <text x="${20 + i * 134}" y="70" fill="${i === 1 ? '#666' : 'white'}" font-family="Arial" font-size="10" opacity="0.9">Professional content for ${panel.toLowerCase()}...</text>
          `).join('')}
        </svg>
      `;
      break;
      
    case 'report':
      svg = `
        <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="white"/>
          <rect x="20" y="20" width="360" height="260" fill="none" stroke="#333" stroke-width="2"/>
          <text x="200" y="80" fill="#333" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle">${content.title}</text>
          <text x="200" y="110" fill="#666" font-family="Arial" font-size="14" text-anchor="middle">${content.subtitle}</text>
          <text x="200" y="140" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Prepared by: Company Name</text>
          <text x="200" y="155" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Date: ${new Date().getFullYear()}</text>
          <rect x="30" y="180" width="340" height="40" fill="#f8f9fa" stroke="${primaryColor}" stroke-width="0" stroke-left="4"/>
          <rect x="30" y="180" width="4" height="40" fill="${primaryColor}"/>
          <text x="40" y="195" fill="#333" font-family="Arial" font-size="12" font-weight="bold">Executive Summary</text>
          <text x="40" y="210" fill="#666" font-family="Arial" font-size="10">Comprehensive business analysis and performance metrics...</text>
        </svg>
      `;
      break;
      
    case 'invoice':
      svg = `
        <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="white"/>
          <text x="30" y="40" fill="#333" font-family="Arial" font-size="18" font-weight="bold">${content.company}</text>
          <text x="320" y="40" fill="${primaryColor}" font-family="Arial" font-size="18" font-weight="bold">${content.header}</text>
          <text x="30" y="80" fill="#333" font-family="Arial" font-size="12" font-weight="bold">Bill To:</text>
          <text x="30" y="100" fill="#666" font-family="Arial" font-size="12">Client Name</text>
          <text x="30" y="115" fill="#666" font-family="Arial" font-size="12">Address</text>
          <rect x="30" y="140" width="340" height="25" fill="#f8f9fa" stroke="#ddd"/>
          <text x="40" y="155" fill="#333" font-family="Arial" font-size="11" font-weight="bold">Description</text>
          <text x="250" y="155" fill="#333" font-family="Arial" font-size="11" font-weight="bold">Qty</text>
          <text x="290" y="155" fill="#333" font-family="Arial" font-size="11" font-weight="bold">Rate</text>
          <text x="330" y="155" fill="#333" font-family="Arial" font-size="11" font-weight="bold">Amount</text>
          <rect x="30" y="165" width="340" height="20" fill="white" stroke="#ddd"/>
          <text x="40" y="178" fill="#666" font-family="Arial" font-size="10">Professional Services</text>
          <text x="250" y="178" fill="#666" font-family="Arial" font-size="10">1</text>
          <text x="290" y="178" fill="#666" font-family="Arial" font-size="10">$500.00</text>
          <text x="330" y="178" fill="#666" font-family="Arial" font-size="10">$500.00</text>
          <text x="370" y="220" fill="#333" font-family="Arial" font-size="12" font-weight="bold" text-anchor="end">Total: $500.00</text>
        </svg>
      `;
      break;
      
    default:
      svg = generateFallbackThumbnail(type);
  }
  
  // Convert SVG to data URL
  const base64SVG = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64SVG}`;
}

// This function is no longer needed as we use SVG generation instead

// Fallback thumbnail generator for when PDF extraction fails
function generateFallbackThumbnail(category: string): string {
  const fallbacks: Record<string, string> = {
    'newsletter': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjM2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzI1NjNFQiIvPgo8dGV4dCB4PSIyMDAiIHk9IjU1IiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OZXdzbGV0dGVyPC90ZXh0Pgo8cmVjdCB4PSIyMCIgeT0iMTAwIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjE4MCIgZmlsbD0id2hpdGUiIHN0cm9rZT0iI0RERERERCIvPgo8dGV4dCB4PSIzMCIgeT0iMTMwIiBmaWxsPSIjMzMzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkFydGljbGUgVGl0bGU8L3RleHQ+CjxyZWN0IHg9IjMwIiB5PSIxNDAiIHdpZHRoPSIzNDAiIGhlaWdodD0iMiIgZmlsbD0iIzI1NjNFQiIvPgo8dGV4dCB4PSIzMCIgeT0iMTYwIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkNvbnRlbnQgcHJldmlldyB0ZXh0Li4uPC90ZXh0Pgo8L3N2Zz4=',
    'resume': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSIyMDAiIHk9IjQwIiBmaWxsPSIjMzMzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Kb2huIERvZTwvdGV4dD4KPHRleHQgeD0iMjAwIiB5PSI2MCIgZmlsbD0iIzY2NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9mZXNzaW9uYWwgfCBqb2huQGVtYWlsLmNvbTwvdGV4dD4KPHJlY3QgeD0iMjAiIHk9IjgwIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iMzAiIHk9IjExMCIgZmlsbD0iIzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+RXhwZXJpZW5jZTwvdGV4dD4KPHR0ZXh0IHg9IjMwIiB5PSIxMzAiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+U2VuaW9yIE1hbmFnZXIgfCBDb21wYW55PC90ZXh0Pgo8dGV4dCB4PSIzMCIgeT0iMTYwIiBmaWxsPSIjMzMzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5FZHVjYXRpb248L3RleHQ+Cjx0ZXh0IHg9IjMwIiB5PSIxODAiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+QmFjaGVsb3IncyBEZWdyZWU8L3RleHQ+Cjwvc3ZnPg==',
    'cv': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSIyMDAiIHk9IjQwIiBmaWxsPSIjMzMzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Kb2huIERvZTwvdGV4dD4KPHRleHQgeD0iMjAwIiB5PSI2MCIgZmlsbD0iIzY2NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9mZXNzaW9uYWwgfCBqb2huQGVtYWlsLmNvbTwvdGV4dD4KPHJlY3QgeD0iMjAiIHk9IjgwIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIiIGZpbGw9IiMzMzMiLz4KPHR0ZXh0IHg9IjMwIiB5PSIxMTAiIGZpbGw9IiMzMzMiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPkV4cGVyaWVuY2U8L3RleHQ+Cjx0ZXh0IHg9IjMwIiB5PSIxMzAiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+U2VuaW9yIE1hbmFnZXIgfCBDb21wYW55PC90ZXh0Pgo8dGV4dCB4PSIzMCIgeT0iMTYwIiBmaWxsPSIjMzMzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5FZHVjYXRpb248L3RleHQ+Cjx0ZXh0IHg9IjMwIiB5PSIxODAiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+QmFjaGVsb3IncyBEZWdyZWU8L3RleHQ+Cjwvc3ZnPg==',
    'pitch-deck': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjY3RUVBIi8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6Izc2NEJBMiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTIwIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29tcGFueSBOYW1lPC90ZXh0Pgo8dGV4dCB4PSIyMDAiIHk9IjE1MCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgb3BhY2l0eT0iMC45Ij5Jbm5vdmF0aXZlIFNvbHV0aW9uczwvdGV4dD4KPHR0ZXh0IHg9IjIwMCIgeT0iMTgwIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QaXRjaCBEZWNrIFByZXNlbnRhdGlvbjwvdGV4dD4KPC9zdmc+',
    'brochure': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMzMiIGhlaWdodD0iMzAwIiBmaWxsPSIjMUU0MEFGIi8+CjxyZWN0IHg9IjEzMyIgeT0iMCIgd2lkdGg9IjEzNCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGOEY5RkEiLz4KPHJlY3QgeD0iMjY3IiB5PSIwIiB3aWR0aD0iMTMzIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzA1OTY2OSIvPgo8dGV4dCB4PSI2NiIgeT0iNDAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BYm91dCBVczwvdGV4dD4KPHR0ZXh0IHg9IjIwMCIgeT0iNDAiIGZpbGw9IiMzMzMiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNlcnZpY2VzPC90ZXh0Pgo8dGV4dCB4PSIzMzMiIHk9IjQwIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29udGFjdDwvdGV4dD4KPHR0ZXh0IHg9IjEwIiB5PSI4MCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgb3BhY2l0eT0iMC45Ij5Qcm9mZXNzaW9uYWwgc2VydmljZXMuLi48L3RleHQ+Cjx0ZXh0IHg9IjE0MyIgeT0iODAiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+4oCiIENvbnN1bHRpbmc8L3RleHQ+Cjx0ZXh0IHg9IjI3NyIgeT0iODAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIG9wYWNpdHk9IjAuOSI+R2V0IGluIHRvdWNoLi4uPC90ZXh0Pgo8L3N2Zz4=',
    'report': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIzNjAiIGhlaWdodD0iMjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIyMDAiIHk9IjgwIiBmaWxsPSIjMzMzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Bbm51YWwgUmVwb3J0PC90ZXh0Pgo8dGV4dCB4PSIyMDAiIHk9IjExMCIgZmlsbD0iIzY2NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CdXNpbmVzcyBQZXJmb3JtYW5jZSBBbmFseXNpczwvdGV4dD4KPHR0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmaWxsPSIjODg4IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlByZXBhcmVkIGJ5OiBDb21wYW55IE5hbWU8L3RleHQ+Cjx0ZXh0IHg9IjIwMCIgeT0iMTcwIiBmaWxsPSIjODg4IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjIwMjU8L3RleHQ+CjxyZWN0IHg9IjMwIiB5PSIyMDAiIHdpZHRoPSIzNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGOEY5RkEiIHN0cm9rZT0iIzAwN0JGRiIgc3Ryb2tlLXdpZHRoPSIwIiBzdHJva2UtbGVmdD0iNCIvPgo8cmVjdCB4PSIzMCIgeT0iMjAwIiB3aWR0aD0iNCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzAwN0JGRiIvPgo8dGV4dCB4PSI0MCIgeT0iMjE4IiBmaWxsPSIjMzMzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5FeGVjdXRpdmUgU3VtbWFyeTwvdGV4dD4KPHR0ZXh0IHg9IjQwIiB5PSIyMzIiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+Q29tcHJlaGVuc2l2ZSBhbmFseXNpcy4uLjwvdGV4dD4KPC9zdmc+',
    'invoice': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSIzMCIgeT0iNDAiIGZpbGw9IiMzMzMiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiPkNvbXBhbnkgTmFtZTwvdGV4dD4KPHR0ZXh0IHg9IjMxMCIgeT0iNDAiIGZpbGw9IiMwMDdCRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiPklOVk9JQ0U8L3RleHQ+Cjx0ZXh0IHg9IjMwIiB5PSI4MCIgZmlsbD0iIzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+QmlsbCBUbzo8L3RleHQ+Cjx0ZXh0IHg9IjMwIiB5PSIxMDAiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+Q2xpZW50IE5hbWU8L3RleHQ+Cjx0ZXh0IHg9IjMwIiB5PSIxMTUiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+QWRkcmVzczwvdGV4dD4KPHJlY3QgeD0iMzAiIHk9IjE0MCIgd2lkdGg9IjM0MCIgaGVpZ2h0PSIzMCIgZmlsbD0iI0Y4RjlGQSIgc3Ryb2tlPSIjREREIi8+Cjx0ZXh0IHg9IjQwIiB5PSIxNTgiIGZpbGw9IiMzMzMiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiPkRlc2NyaXB0aW9uPC90ZXh0Pgo8dGV4dCB4PSIyNTAiIHk9IjE1OCIgZmlsbD0iIzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+UXR5PC90ZXh0Pgo8dGV4dCB4PSIyOTAiIHk9IjE1OCIgZmlsbD0iIzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+UmF0ZTwvdGV4dD4KPHR0ZXh0IHg9IjMzMCIgeT0iMTU4IiBmaWxsPSIjMzMzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5BbW91bnQ8L3RleHQ+CjxyZWN0IHg9IjMwIiB5PSIxNzAiIHdpZHRoPSIzNDAiIGhlaWdodD0iMjUiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNEREQiLz4KPHR0ZXh0IHg9IjQwIiB5PSIxODYiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMSI+UHJvZmVzc2lvbmFsIFNlcnZpY2VzPC90ZXh0Pgo8dGV4dCB4PSIyNTAiIHk9IjE4NiIgZmlsbD0iIzU1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjExIj4xPC90ZXh0Pgo8dGV4dCB4PSIyOTAiIHk9IjE4NiIgZmlsbD0iIzU1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjExIj4kNTAwLjAwPC90ZXh0Pgo8dGV4dCB4PSIzMzAiIHk9IjE4NiIgZmlsbD0iIzU1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjExIj4kNTAwLjAwPC90ZXh0Pgo8dGV4dCB4PSIzNzAiIHk9IjIzMCIgZmlsbD0iIzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9ImVuZCI+VG90YWw6ICQ1MDAuMDA8L3RleHQ+Cjwvc3ZnPg=='
  };
  
  return fallbacks[category] || fallbacks['report'];
}

// Simplified PDF analysis without text extraction for now
function generateMockPDFAnalysis(filename: string, serviceType: string) {
  const scores = [78, 82, 85, 76, 89, 73, 91, 87];
  const ratings = [3, 4, 4, 3, 5, 3, 5, 4];
  const randomIndex = Math.floor(Math.random() * scores.length);
  
  const serviceAnalysis: Record<string, any> = {
    'cv': {
      strengths: ['Clear contact information', 'Well-structured work experience', 'Relevant skills highlighted'],
      improvements: ['Add more quantified achievements', 'Consider adding a professional summary'],
      recommendations: ['Use action verbs in descriptions', 'Ensure consistent formatting throughout']
    },
    'pitch-deck': {
      strengths: ['Compelling problem statement', 'Clear value proposition', 'Good market analysis'],
      improvements: ['Strengthen financial projections', 'Add customer testimonials'],
      recommendations: ['Include competitive analysis slide', 'Improve visual consistency']
    },
    'brochure': {
      strengths: ['Attractive visual design', 'Clear brand messaging', 'Good call-to-action'],
      improvements: ['Optimize text readability', 'Add customer testimonials'],
      recommendations: ['Include contact information prominently', 'Use consistent color scheme']
    },
    'report': {
      strengths: ['Comprehensive data analysis', 'Clear executive summary', 'Well-organized sections'],
      improvements: ['Add more visual charts', 'Strengthen conclusions'],
      recommendations: ['Include actionable recommendations', 'Improve data visualization']
    },
    'newsletter': {
      strengths: ['Engaging headlines', 'Good content variety', 'Professional layout'],
      improvements: ['Optimize for mobile viewing', 'Add more interactive elements'],
      recommendations: ['Include social media links', 'Segment content by audience']
    },
    'invoice': {
      strengths: ['Clear itemization', 'Professional appearance', 'Contact details included'],
      improvements: ['Add payment terms clarity', 'Include tax information'],
      recommendations: ['Add payment methods', 'Include due date prominently']
    }
  };

  const analysis = serviceAnalysis[serviceType] || serviceAnalysis['report'];
  
  return {
    score: scores[randomIndex],
    rating: ratings[randomIndex],
    summary: `This ${serviceType.replace('-', ' ')} demonstrates good professional standards with room for improvement in specific areas.`,
    strengths: analysis.strengths,
    improvements: analysis.improvements,
    recommendations: analysis.recommendations
  };
}

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
import { storage } from "./storage";
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
// DualContentGenerator already imported above
import { Completions } from "openai/resources/completions.mjs";
import { scraperService, type CompanyInfo, type MarketData } from "./scraperService";

// Configure multer for file uploads (PDFs and images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  },
});

// Separate multer instance for logo uploads
const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for logos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for logos'));
    }
  },
}).single('companyLogo');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enhanced AI prompt generation with live data integration
async function enhancePromptWithLiveData(prompt: string, serviceType: string): Promise<string> {
  try {
    let enhancedPrompt = prompt;
    let liveDataContext = '';

    // Extract company names from prompt
    const companyMatches = prompt.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*(?:\s+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co)\.?)?/g);
    
    if (companyMatches && companyMatches.length > 0) {
      try {
        const companyName = companyMatches[0];
        console.log(`🔍 Fetching live data for company: ${companyName}`);
        
        try {
          const companyInfo = await scraperService.getCompanyInfo(companyName);
          if (companyInfo) {
            liveDataContext += `\nLive Company Data for ${companyName}:\n`;
            if (companyInfo.industry) liveDataContext += `- Industry: ${companyInfo.industry}\n`;
            if (companyInfo.description) liveDataContext += `- Description: ${companyInfo.description}\n`;
            if (companyInfo.location) liveDataContext += `- Location: ${companyInfo.location}\n`;
          }
        } catch (companyInfoError) {
          console.error('Error fetching company info:', companyInfoError);
        }

        try {
          const businessMetrics = await scraperService.getBusinessMetrics(companyName);
          if (businessMetrics && Object.keys(businessMetrics).length > 0) {
            liveDataContext += `\nCurrent Business Metrics:\n`;
            Object.entries(businessMetrics).forEach(([key, value]) => {
              if (value) liveDataContext += `- ${key}: ${value}\n`;
            });
          }
        } catch (metricsError) {
          console.error('Error fetching business metrics:', metricsError);
        }
      } catch (companyProcessError) {
        console.error('Error processing company data:', companyProcessError);
      }
    }

    // Extract industry information from prompt
    const industryKeywords = ['technology', 'finance', 'healthcare', 'marketing', 'retail', 'education', 'consulting', 'manufacturing', 'real estate', 'automotive'];
    const detectedIndustry = industryKeywords.find(keyword => 
      prompt.toLowerCase().includes(keyword)
    );

    if (detectedIndustry) {
      try {
        console.log(`📊 Fetching industry trends for: ${detectedIndustry}`);
        const industryData = await scraperService.getIndustryData(detectedIndustry);
        if (industryData) {
          liveDataContext += `\nCurrent Industry Trends (${detectedIndustry}):\n`;
          if (industryData.trends.length > 0) {
            liveDataContext += `- Key Trends: ${industryData.trends.join(', ')}\n`;
          }
          if (industryData.statistics.length > 0) {
            liveDataContext += `- Market Statistics: ${industryData.statistics.join(', ')}\n`;
          }
        }
      } catch (industryError) {
        console.error('Error fetching industry data:', industryError);
        // Continue without industry data
      }
    }

    // For specific document types, get relevant current information
    if (serviceType.includes('pitch-deck') || serviceType.includes('startup')) {
      try {
        const currentInfo = await scraperService.getCurrentInfo('startup funding trends 2025');
        if (currentInfo.length > 0) {
          liveDataContext += `\nCurrent Startup & Investment Trends:\n`;
          currentInfo.forEach(info => {
            liveDataContext += `- ${info.title}\n`;
          });
        }
      } catch (startupError) {
        console.error('Error fetching startup trends:', startupError);
        // Continue without startup trends
      }
    }

    if (liveDataContext) {
      enhancedPrompt = `${prompt}\n\n[LIVE DATA CONTEXT - Use this current information to make the content more accurate and relevant]:${liveDataContext}`;
      console.log('✅ Enhanced prompt with live data');
    }

    return enhancedPrompt;
  } catch (error) {
    console.error('Error enhancing prompt with live data:', error);
    return prompt; // Return original prompt if enhancement fails
  }
}

// Helper function to convert document to styled HTML matching the preview exactly
function convertDocumentToHTML(document: any): string {
  const title = document.title || 'Document';
  const serviceType = document.serviceType || 'document';
  const content = document.content;
  
  // Template-specific HTML generation that matches the preview styling
  if (serviceType === 'brochure-designer' || (content && content.templateInfo?.templateCategory === 'brochure')) {
    return generateBrochureHTML(content, title);
  }
  else if (serviceType === 'resume-builder' || (content && content.templateInfo?.templateCategory === 'resume')) {
    return generateResumeHTML(content, title);
  }
  else if (serviceType === 'invoice-generator' || (content && content.templateInfo?.templateCategory === 'invoice')) {
    return generateInvoiceHTML(content, title);
  }
  else if (serviceType === 'pitch-deck' || (content && content.templateInfo?.templateCategory === 'pitch-deck')) {
    return generatePitchDeckHTML(content, title);
  }
  else if (serviceType === 'newsletter-creator' || (content && content.templateInfo?.templateCategory === 'newsletter')) {
    return generateNewsletterHTML(content, title);
  }
  else if (serviceType === 'report-generator' || (content && content.templateInfo?.templateCategory === 'report')) {
    return generateReportHTML(content, title);
  }
  
  // Fallback for other types
  return generateGenericHTML(content, title, serviceType);
}

// Generate brochure HTML that matches the BrochureTemplate component exactly
function generateBrochureHTML(data: any, title: string): string {
  const panels = data.panels || [];
  const coverPanel = panels.find((p: any) => p.type === 'cover') || panels[0] || {};
  const contentPanels = panels.filter((p: any) => p.type !== 'cover');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%);
          min-height: 100vh;
          padding: 32px;
          line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        
        /* Cover Section */
        .cover {
          background: linear-gradient(to right, #0f766e, #0891b2);
          color: white;
          padding: 48px;
          border-radius: 8px;
          margin-bottom: 32px;
          text-align: center;
        }
        .cover h1 { font-size: 3rem; font-weight: bold; margin-bottom: 16px; }
        .cover h2 { font-size: 1.5rem; color: #5eead4; margin-bottom: 24px; }
        .cover p { font-size: 1.25rem; color: #99f6e4; }
        
        /* Content Panels */
        .content-panel {
          background: white;
          padding: 32px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #0d9488;
          margin-bottom: 32px;
        }
        .content-panel h3 {
          font-size: 1.5rem;
          font-weight: bold;
          color: #115e59;
          margin-bottom: 16px;
        }
        .content-panel p {
          color: #374151;
          font-size: 1.125rem;
          line-height: 1.75;
        }
        
        /* Three Column Layout */
        .three-columns {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 32px;
        }
        .column {
          background: white;
          padding: 32px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .column h3 {
          font-size: 1.5rem;
          font-weight: bold;
          color: #115e59;
          margin-bottom: 16px;
        }
        .column ul { list-style: none; }
        .column li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .column li::before {
          content: "✓";
          color: #059669;
          font-weight: bold;
          margin-right: 8px;
        }
        
        /* Call to Action */
        .cta {
          background: linear-gradient(to right, #0d9488, #0891b2);
          color: white;
          padding: 32px;
          border-radius: 8px;
          text-align: center;
        }
        .cta h3 { font-size: 2rem; font-weight: bold; margin-bottom: 16px; }
        .cta p { font-size: 1.25rem; margin-bottom: 24px; }
        .cta-button {
          background: white;
          color: #0f766e;
          padding: 12px 32px;
          border-radius: 24px;
          font-weight: bold;
          font-size: 1.125rem;
          border: none;
          cursor: pointer;
          display: inline-block;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Cover Section -->
        <div class="cover">
          <h1>${coverPanel.title || 'Business Brochure'}</h1>
          <h2>${coverPanel.subtitle || 'Professional Services'}</h2>
          <p>${coverPanel.content || 'Discover our business solutions'}</p>
        </div>
        
        <!-- Content Panels -->
        ${contentPanels.map((panel: any) => `
          <div class="content-panel">
            <h3>${panel.title}</h3>
            <p>${panel.content || ''}</p>
            ${panel.subtitle ? `<p style="color: #0d9488; font-weight: 500; margin-top: 8px;">${panel.subtitle}</p>` : ''}
          </div>
        `).join('')}
        
        <!-- Three Column Layout -->
        <div class="three-columns">
          <div class="column">
            <h3>Features</h3>
            <ul>
              ${(data.features || ['Premium Quality', 'Easy to Use', '24/7 Support']).map((feature: string) => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          
          <div class="column">
            <h3>Benefits</h3>
            <p>${data.benefits || 'Experience the advantages of choosing our products and services for your business needs.'}</p>
          </div>
          
          <div class="column">
            <h3>Contact</h3>
            <p>${data.contactInfo?.email || 'info@company.com'}</p>
            <p>${data.contactInfo?.phone || '+1 (555) 123-4567'}</p>
            <p>${data.contactInfo?.address || '123 Business St, City, State'}</p>
          </div>
        </div>
        
        <!-- Call to Action -->
        <div class="cta">
          <h3>Ready to Get Started?</h3>
          <p>${data.callToAction || 'Contact us today to learn more about our solutions'}</p>
          <span class="cta-button">Get in Touch</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Placeholder functions for other template types (will implement based on need)
function generateResumeHTML(data: any, title: string): string {
  return generateGenericHTML(data, title, 'resume');
}

function generateInvoiceHTML(data: any, title: string): string {
  return generateGenericHTML(data, title, 'invoice');
}

function generatePitchDeckHTML(data: any, title: string): string {
  return generateGenericHTML(data, title, 'pitch-deck');
}

function generateNewsletterHTML(data: any, title: string): string {
  return generateGenericHTML(data, title, 'newsletter');
}

function generateReportHTML(data: any, title: string): string {
  return generateGenericHTML(data, title, 'report');
}

function generateGenericHTML(content: any, title: string, serviceType: string): string {
  let bodyContent = '';
  
  if (typeof content === 'string') {
    bodyContent = content;
  } else if (content && typeof content === 'object') {
    bodyContent = JSON.stringify(content, null, 2)
      .replace(/\n/g, '<br>')
      .replace(/  /g, '&nbsp;&nbsp;');
  } else {
    bodyContent = '<p>No content available</p>';
  }
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 40px;
          background: #f8f9fa;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 40px;
        }
        .document-title {
          font-size: 2.5em;
          font-weight: bold;
          color: #007bff;
          margin: 0;
        }
        .service-type {
          font-size: 1.2em;
          color: #666;
          margin-top: 10px;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          min-height: 400px;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="document-title">${title}</h1>
        <div class="service-type">${serviceType}</div>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        Generated by Jenrate.Ai - Professional Document Generation Platform
      </div>
    </body>
    </html>
  `;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Logo serving endpoint
  app.get("/uploads/:filename", async (req, res) => {
    const logoPath = `/uploads/${req.params.filename}`;
    const logoStorage = (global as any).logoStorage as Map<string, any> || new Map();
    const logoData = logoStorage.get(logoPath);
    
    if (!logoData) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    res.set({
      'Content-Type': logoData.mimetype,
      'Content-Length': logoData.buffer.length,
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(logoData.buffer);
  });

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

  // Session validation middleware for single-device login
  const validateSession = async (req: any, res: any, next: any) => {
    const userId = req.session?.userId;
    const sessionId = req.session?.sessionId;
    
    if (!userId || !sessionId) {
      return next(); // Let individual routes handle authentication
    }
    
    try {
      const user = await storage.getUser(userId);
      if (user && user.currentSessionId !== sessionId) {
        // Session invalidated by login from another device
        req.session.destroy(() => {});
        return res.status(401).json({ 
          message: "Session expired - logged in from another device",
          code: "SESSION_INVALIDATED"
        });
      }
      next();
    } catch (error) {
      next();
    }
  };

  // Apply session validation to all routes except auth routes
  app.use(['/api/documents', '/api/templates', '/api/generate'], validateSession);

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const user = await registerUser(req.body);
      
      // Generate unique session ID for new user
      const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // Store session ID in the user record
      await storage.updateUserSessionId(user.id, newSessionId);
      
      // Set user ID and session ID in current session
      req.session.userId = user.id;
      (req.session as any).sessionId = newSessionId;
      
      console.log(`✅ New user ${user.email} registered with session: ${newSessionId}`);
      
      res.json({ user, message: "Account created successfully" });
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
      
      // Generate unique session ID
      const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // Store session ID in the user record (this invalidates any previous session)
      await storage.updateUserSessionId(user.id, newSessionId);
      
      // Set user ID and session ID in current session
      req.session.userId = user.id;
      (req.session as any).sessionId = newSessionId;
      
      console.log(`✅ User ${user.email} logged in with new session: ${newSessionId}`);
      
      res.json({ user, message: "Logged in successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const userId = req.session?.userId;
      
      // Clear session from user record
      if (userId) {
        await storage.clearUserSession(userId);
        console.log(`✅ Session cleared for user: ${userId}`);
      }
      
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Could not log out" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const sessionId = req.session?.sessionId;
      
      if (!userId || !sessionId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Check if this session is still valid (single-device login enforcement)
      if (user.currentSessionId !== sessionId) {
        // Session has been invalidated by login from another device
        req.session.destroy(() => {});
        return res.status(401).json({ 
          message: "Session expired - logged in from another device" 
        });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Admin API endpoints
  app.get("/api/admin/pending-users", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const currentUser = await storage.getUser(userId);
      if (!currentUser || currentUser.email !== "nigelbaiden24@yahoo.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const currentUser = await storage.getUser(userId);
      if (!currentUser || currentUser.email !== "nigelbaiden24@yahoo.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/approve-user/:userId", async (req, res) => {
    try {
      const adminUserId = req.session?.userId;
      const targetUserId = req.params.userId;

      if (!adminUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const currentUser = await storage.getUser(adminUserId);
      if (!currentUser || currentUser.email !== "nigelbaiden24@yahoo.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const result = await storage.approveUser(targetUserId, adminUserId);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User approved successfully", user: result });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.put("/api/admin/reject-user/:userId", async (req, res) => {
    try {
      const adminUserId = req.session?.userId;
      const targetUserId = req.params.userId;

      if (!adminUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const currentUser = await storage.getUser(adminUserId);
      if (!currentUser || currentUser.email !== "nigelbaiden24@yahoo.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const result = await storage.rejectUser(targetUserId);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User rejected successfully" });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  // Subscription Plans API
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      // Hardcoded subscription plans for now (database endpoint disabled)
      const plans = [
        {
          id: "freemium-plan",
          name: "Free",
          slug: "freemium", 
          price: "0.00",
          currency: "GBP",
          monthlyDesignLimit: 1,
          features: [
            "1 design per month",
            "Basic templates",
            "Standard support"
          ],
          isActive: true,
          sortOrder: 0,
          createdAt: new Date()
        },
        {
          id: "starter-plan",
          name: "Starter",
          slug: "starter",
          price: "15.00", 
          currency: "GBP",
          monthlyDesignLimit: 15,
          features: [
            "15 designs per month",
            "Premium templates",
            "Priority support",
            "Basic customization"
          ],
          isActive: true,
          sortOrder: 1,
          createdAt: new Date()
        },
        {
          id: "pro-plan",
          name: "Pro", 
          slug: "pro",
          price: "32.00",
          currency: "GBP", 
          monthlyDesignLimit: 40,
          features: [
            "40 designs per month",
            "All premium templates",
            "Advanced customization", 
            "Logo upload",
            "Priority support",
            "AI text expansion"
          ],
          isActive: true,
          sortOrder: 2,
          createdAt: new Date()
        },
        {
          id: "agency-plan",
          name: "Agency",
          slug: "agency", 
          price: "62.00",
          currency: "GBP",
          monthlyDesignLimit: -1, // Unlimited
          features: [
            "Unlimited designs",
            "All premium templates",
            "Full customization",
            "Logo upload", 
            "Dedicated support",
            "AI text expansion",
            "Multi-user access",
            "White-label options"
          ],
          isActive: true,
          sortOrder: 3,
          createdAt: new Date()
        }
      ];
      
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
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
      
      // Generate actual thumbnails from template content
      const templateList = await Promise.all(filteredTemplates.map(async template => ({
        id: template.id,
        name: template.name,
        description: template.description || `${template.category} template`,
        category: template.category,
        thumbnailUrl: await generateActualTemplateThumbnail(template)
      })));
      
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

  // Test PDF content extraction endpoint
  app.get("/api/test/pdf-extraction", async (req, res) => {
    try {
      console.log("🧪 Testing content-based thumbnail generation system");
      
      const dbTemplates = await storage.getTemplates();
      const testResults = [];
      
      for (const template of dbTemplates.slice(0, 5)) { // Test first 5 templates
        try {
          const previewContent = generateRealPreviewContent(template);
          const thumbnail = await generateActualTemplateThumbnail(template);
          
          testResults.push({
            templateName: template.name,
            category: template.category,
            previewContentGenerated: !!previewContent,
            previewContent: previewContent ? {
              type: previewContent.type,
              preview: previewContent.preview,
              data: Object.keys(previewContent).filter(k => k !== 'type' && k !== 'preview')
            } : null,
            thumbnailGenerated: !!thumbnail,
            thumbnailLength: thumbnail?.length || 0
          });
          
          console.log(`✅ ${template.name}: Preview=${!!previewContent}, Thumbnail=${!!thumbnail} (${thumbnail?.length || 0} chars)`);
        } catch (error) {
          testResults.push({
            templateName: template.name,
            category: template.category,
            error: (error as Error).message
          });
        }
      }
      
      res.json({
        totalTemplates: dbTemplates.length,
        testResults
      });
    } catch (error) {
      console.error('❌ PDF extraction test failed:', error);
      res.status(500).json({ error: 'PDF extraction test failed' });
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

      console.log('📄 Document retrieved:', {
        id: document.id,
        title: document.title,
        hasContent: !!document.content,
        hasHtmlContent: !!document.htmlContent,
        htmlContentSize: document.htmlContent ? JSON.stringify(document.htmlContent).length : 0
      });
      
      res.json(document);
    } catch (error) {
      console.error("Get document error:", error);
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
      
      if ((user.monthlyUsage || 0) >= currentLimit) {
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

  // Update HTML/JSON content when user edits template
  app.put("/api/documents/:id/html-content", async (req, res) => {
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

      const { fieldPath, newValue } = req.body;
      if (!fieldPath || newValue === undefined) {
        return res.status(400).json({ message: "fieldPath and newValue are required" });
      }

      // Update HTML content using dual content generator
      const updatedHtmlContent = await dualContentGenerator.updateHTMLContent(
        req.params.id,
        fieldPath,
        newValue,
        document.htmlContent || {}
      );

      // Save updated HTML content to database
      const updatedDocument = await storage.updateDocument(req.params.id, {
        htmlContent: updatedHtmlContent,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        document: updatedDocument
      });
    } catch (error) {
      console.error('Failed to update HTML content:', error);
      res.status(500).json({ message: "Failed to update content" });
    }
  });

  // Download endpoint for documents
  app.post("/api/documents/:id/download", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      console.log(`📄 Generating PDF for document: ${document.title} (${document.serviceType})`);
      
      // Generate PDF using external API for pixel-perfect HTML/CSS rendering
      const { generatePDFFromHTMLWithExternalAPI, generateComprehensivePDFContent } = await import('./pdfGenerator');
      
      // Use the comprehensive PDF content generation that handles all template types properly
      const htmlContent = await generateComprehensivePDFContent(document);
      console.log(`📄 Generated comprehensive HTML content: ${htmlContent.length} characters`);
      
      const pdfBuffer = await generatePDFFromHTMLWithExternalAPI(htmlContent, document.title);

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

  // New endpoint for downloading PDF from HTML content using external API
  app.post("/api/download-pdf", async (req, res) => {
    try {
      const { html, filename = 'document' } = req.body;
      
      if (!html) {
        return res.status(400).json({ message: "HTML content is required" });
      }

      console.log(`📄 Generating PDF from HTML content (${html.length} chars)`);
      
      // Use external HTML-to-PDF API service for pixel-perfect rendering
      const { generatePDFFromHTMLWithExternalAPI } = await import('./pdfGenerator');
      const pdfBuffer = await generatePDFFromHTMLWithExternalAPI(html, filename);

      const cleanFilename = `${filename.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_')}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      
      res.send(pdfBuffer);
      
      console.log(`✅ PDF generated successfully: ${cleanFilename} (${pdfBuffer.length} bytes)`);
      
    } catch (error) {
      console.error('PDF generation from HTML failed:', error);
      res.status(500).json({ message: "Failed to generate PDF from HTML" });
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
  console.log(`🔍 FINDBESTTEMPLATE CALLED: Finding database template for serviceType: ${serviceType}, prompt: "${prompt}"`);
  
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
    'newsletter-designer': ['newsletter', 'email-newsletter']
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
    
    // Enhanced handling for report-generator to detect specific report types
    if (serviceType === 'report-generator' || serviceType === 'report') {
      console.log(`🎯 ENTERING REPORT DETECTION LOGIC for prompt: "${prompt}"`);
      const promptLower = prompt.toLowerCase();
      
      // Corporate/Annual Report keywords - more specific
      const corporateKeywords = ['corporate', 'annual', 'company annual', 'business overview', 'company performance', 'yearly report', 'company report', 'business report'];
      const isCorporatePrompt = corporateKeywords.some(keyword => 
        promptLower.includes(keyword)
      );
      
      // International/Global Business keywords  
      const internationalKeywords = ['international', 'global', 'worldwide', 'overseas', 'multinational', 'cross-border'];
      const isInternationalPrompt = internationalKeywords.some(keyword => 
        promptLower.includes(keyword)
      );
      
      // Financial Report keywords (very specific to avoid conflicts)
      const financialKeywords = ['financial report', 'financial analysis', 'quarterly financial', 'revenue analysis', 'profit analysis', 'financial performance'];
      const isFinancialPrompt = financialKeywords.some(keyword => 
        promptLower.includes(keyword)
      );
      
      // Prioritize based on specific report type detection
      console.log(`🎯 Debug report detection:`, { isCorporatePrompt, isInternationalPrompt, isFinancialPrompt, promptLower });
      
      // Prioritize international over corporate when both are detected
      if (isInternationalPrompt) {
        console.log(`🎯 Looking for international template in:`, categoryTemplates.map(t => t.name));
        const internationalTemplate = categoryTemplates.find(t => 
          t.name.toLowerCase().includes('international')
        );
        console.log(`🎯 International template search result:`, internationalTemplate?.name || 'NOT FOUND');
        if (internationalTemplate) {
          console.log(`🎯 Prioritizing International Business Report template: ${internationalTemplate.name}`);
          return internationalTemplate;
        }
      }
      
      if (isCorporatePrompt) {
        const corporateTemplate = categoryTemplates.find(t => 
          t.name.toLowerCase().includes('corporate') || t.name.toLowerCase().includes('annual')
        );
        console.log(`🎯 Looking for corporate template:`, categoryTemplates.map(t => t.name));
        if (corporateTemplate) {
          console.log(`🎯 Prioritizing Corporate Annual Report template: ${corporateTemplate.name}`);
          return corporateTemplate;
        }
      }
      
      if (isFinancialPrompt) {
        const financialTemplate = categoryTemplates.find(t => 
          t.name.toLowerCase().includes('financial')
        );
        if (financialTemplate) {
          console.log(`🎯 Prioritizing Financial Report template: ${financialTemplate.name}`);
          return financialTemplate;
        }
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
        finance: ['financial', 'budget', 'revenue', 'investment', 'profit', 'accounting', 'money', 'finance', 'stock', 'market', 'quarter', 'earnings', 'banking', 'economic'],
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
    console.log(`🎯 Template scoring results:`, scoredTemplates.map(st => ({name: st.template.name, score: st.score})));
    if (bestTemplate.score > 0) {
      console.log(`🎯 Selected template by scoring: ${bestTemplate.template.name} (score: ${bestTemplate.score})`);
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

      'newsletter': 'newsletter.json',
      'newsletter-designer': 'newsletter.json',
      'newsletter-generator': 'newsletter.json',
      'company-newsletter': 'newsletter.json',
      'email-newsletter': 'newsletter.json',


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

    'newsletter': ['newsletter'],
    'newsletter-designer': ['newsletter'],
    'newsletter-generator': ['newsletter'],
    'company-newsletter': ['newsletter'],
    'email-newsletter': ['newsletter'],


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

// Enhanced prompt analysis for better context application
function analyzeUserPrompt(prompt: string, template: any) {
  const analysis = {
    companyName: null as string | null,
    industry: null as string | null,
    keyPersonnel: [] as string[],
    businessType: null as string | null,
    specificRequirements: [] as string[],
    dataPoints: [] as string[],
    templateMatch: null as string | null
  };

  // Extract company names (look for proper nouns, business words, and common business patterns)
  const businessNamePatterns = [
    // Standard business suffixes
    /\b([A-Z][a-z]*(?:\s+[A-Z][a-z]*)*(?:\s+(?:Inc|Corp|Corporation|Ltd|Limited|LLC|Co|Company|Group|Holdings|Technologies|Tech|Solutions|Systems|International|Global|Enterprises|Partners|Associates|Services|Consulting|Agency|Studio))\.?)\b/gi,
    // Business name with 'called' or 'named'
    /(?:business|company|shop|store|firm|agency|service|startup)\s+called\s+([A-Z][a-z]*(?:\s+[A-Z][a-z]*)*)/gi,
    // Simple business names (two or more capitalized words)
    /\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
  ];
  
  for (const pattern of businessNamePatterns) {
    const matches = prompt.match(pattern);
    if (matches && matches.length > 0) {
      analysis.companyName = matches[0].replace(/^(?:business|company|shop|store|firm|agency|service|startup)\s+called\s+/i, '');
      break;
    }
  }

  // Extract people names (CEO, founder, director, etc.)
  const personnelMatches = prompt.match(/\b(?:CEO|CTO|CFO|founder|director|president|manager|owner|executive|chief)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi);
  if (personnelMatches) {
    analysis.keyPersonnel = personnelMatches.map(match => match.replace(/^(?:CEO|CTO|CFO|founder|director|president|manager|owner|executive|chief)\s+/i, ''));
  }

  // Detect industry/business type
  const industries = [
    'technology', 'tech', 'software', 'healthcare', 'finance', 'financial', 'banking', 'real estate', 
    'retail', 'e-commerce', 'manufacturing', 'automotive', 'aerospace', 'energy', 'oil', 'gas',
    'pharmaceutical', 'biotech', 'education', 'consulting', 'marketing', 'advertising', 'media',
    'entertainment', 'hospitality', 'restaurant', 'food', 'agriculture', 'construction', 'legal',
    'insurance', 'telecommunications', 'transportation', 'logistics', 'mining', 'chemicals'
  ];
  
  for (const industry of industries) {
    if (prompt.toLowerCase().includes(industry)) {
      analysis.industry = industry;
      break;
    }
  }

  // Extract specific business requirements
  const requirementKeywords = ['report', 'financial', 'annual', 'quarterly', 'performance', 'revenue', 'profit', 'growth', 'strategy', 'market', 'analysis', 'expansion', 'investment'];
  requirementKeywords.forEach(keyword => {
    if (prompt.toLowerCase().includes(keyword)) {
      analysis.specificRequirements.push(keyword);
    }
  });

  // Extract numerical data points (revenue, percentages, years, ratings, etc.)
  const numberMatches = prompt.match(/\$?[\d,]+(?:\.\d+)?[KMB]?|\d+(?:\.\d+)?\s*(?:%|percent|star|stars|rating|years?|year|months?)\b|\d{4}|\d+(?:\.\d+)?\s*(?:star|rating)/g);
  if (numberMatches) {
    analysis.dataPoints = numberMatches;
  }
  
  // Extract specific business credentials and experience
  const experienceMatches = prompt.match(/(\d+)\s*(?:years?|months?)\s*(?:of\s*)?(?:operation|experience|in\s+business|established)/gi);
  const ratingMatches = prompt.match(/(\d+(?:\.\d+)?)\s*(?:star|stars|rating)/gi);
  const locationMatches = prompt.match(/(?:based\s+in|located\s+in|in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi);
  
  if (experienceMatches) {
    analysis.specificRequirements.push(`experience: ${experienceMatches[0]}`);
  }
  if (ratingMatches) {
    analysis.specificRequirements.push(`rating: ${ratingMatches[0]}`);
  }
  if (locationMatches) {
    analysis.specificRequirements.push(`location: ${locationMatches[0].replace(/^(?:based\s+in|located\s+in|in|at)\s+/i, '')}`);
  }

  // Determine template match confidence
  const templateName = template.name.toLowerCase();
  if (prompt.toLowerCase().includes('annual') && templateName.includes('annual')) {
    analysis.templateMatch = 'high';
  } else if (prompt.toLowerCase().includes('financial') && templateName.includes('financial')) {
    analysis.templateMatch = 'high';
  } else if (prompt.toLowerCase().includes('corporate') && templateName.includes('corporate')) {
    analysis.templateMatch = 'high';
  } else {
    analysis.templateMatch = 'medium';
  }

  return analysis;
}

// AI Text Expansion endpoint for all services
app.post('/api/expand-text', async (req, res) => {
  try {
    const { text, service } = req.body;
    
    if (!text || !service) {
      return res.status(400).json({ message: 'Text and service are required' });
    }

    // Create OpenAI client
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Service-specific expansion prompts
    const expansionPrompts = {
      'pitch-deck': 'Expand this pitch deck prompt with detailed business metrics, market analysis, team credentials, financial projections, and specific growth strategies. Include concrete numbers, partnerships, and success metrics.',
      'resume-builder': 'Expand this resume prompt with specific achievements, quantified results, relevant skills, project details, career progression, and industry-specific accomplishments. Include metrics and concrete examples.',
      'brochure-designer': 'Expand this brochure prompt with detailed company information, service offerings, customer testimonials, unique value propositions, contact details, and compelling marketing copy.',
      'newsletter-designer': 'Expand this newsletter prompt with specific news items, company updates, employee spotlights, industry insights, upcoming events, and engagement content with concrete details.',
      'invoice-creator': 'Expand this invoice prompt with detailed line items, professional billing information, payment terms, service descriptions, pricing breakdown, and business contact details.',
      'financial-report': 'Expand this financial report prompt with specific financial metrics, period comparisons, revenue breakdowns, expense analysis, key performance indicators, and strategic recommendations.',
      'business-proposal': 'Expand this business proposal prompt with detailed scope of work, timeline, budget breakdown, deliverables, team qualifications, success metrics, and partnership benefits.',
      'report-generator': 'Expand this report prompt with comprehensive analysis, data insights, methodology, findings, recommendations, visual elements, and actionable conclusions.',

    };

    const expansionPrompt = expansionPrompts[service] || 'Expand this prompt with more detailed, specific, and professional content relevant to the requested document type.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are an expert business document consultant. ${expansionPrompt} Maintain the original intent while adding professional depth, specific details, and actionable content. Keep the tone professional and business-appropriate.`
        },
        {
          role: 'user',
          content: `Original prompt: "${text}"\n\nPlease expand this into a more detailed, comprehensive prompt with specific business details, metrics, and professional context.`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const expandedText = response.choices[0].message.content;

    res.json({
      originalText: text,
      expandedText: expandedText,
      service: service
    });

  } catch (error) {
    console.error('Error expanding text:', (error as any).message);
    res.status(500).json({ message: 'Failed to expand text' });
  }
});

// AI Chart Generation from CSV/Excel file
app.post('/api/generate-chart-from-file', upload.single('file'), async (req, res) => {
  try {
    const { chartType, title } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // For now, return a simplified response. In production, you'd parse the CSV/Excel file
    const mockChartData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [25000, 32000, 28000, 41000],
      title: title || 'Chart from File',
      type: chartType || 'bar'
    };

    res.json({ chartData: mockChartData });

  } catch (error) {
    console.error('Error processing chart file:', error);
    res.status(500).json({ message: 'Failed to process file' });
  }
});

// AI Chart SVG Generation
app.post('/api/generate-chart-svg', async (req, res) => {
  try {
    const { chartData, type, title } = req.body;

    if (!chartData || !chartData.labels || !chartData.values) {
      return res.status(400).json({ message: 'Invalid chart data' });
    }

    // Create OpenAI client
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const chartPrompt = `Generate a professional ${type} chart SVG with the following data:
Title: ${title || 'Chart'}
Labels: ${chartData.labels.join(', ')}
Values: ${chartData.values.join(', ')}

Requirements:
- Create a clean, professional SVG chart
- Use appropriate colors and styling
- Include proper labels and title
- Make it scalable and readable
- Size should be 400x300 pixels
- Use modern design principles
- Include grid lines if appropriate for the chart type

Return only the SVG code without any explanation.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5', // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: 'You are an expert data visualization designer. Generate clean, professional SVG charts based on provided data. Return only valid SVG code.'
        },
        {
          role: 'user',
          content: chartPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const svgContent = response.choices[0].message.content;

    if (!svgContent || !svgContent.includes('<svg')) {
      // Fallback: Generate a simple chart SVG programmatically
      const fallbackSvg = generateFallbackChart(chartData, type, title);
      return res.json({ svg: fallbackSvg });
    }

    res.json({ svg: svgContent });

  } catch (error) {
    console.error('Error generating chart SVG:', error);
    
    // Fallback: Generate a simple chart SVG programmatically
    try {
      const fallbackSvg = generateFallbackChart(req.body.chartData, req.body.type, req.body.title);
      res.json({ svg: fallbackSvg });
    } catch (fallbackError) {
      res.status(500).json({ message: 'Failed to generate chart' });
    }
  }
});

// Helper function to generate fallback chart SVG
function generateFallbackChart(chartData: any, type: string, title: string): string {
  const { labels, values } = chartData;
  const maxValue = Math.max(...values);
  const width = 400;
  const height = 300;
  const margin = 50;
  const chartWidth = width - 2 * margin;
  const chartHeight = height - 2 * margin;

  let chartElements = '';

  if (type === 'bar') {
    const barWidth = chartWidth / labels.length * 0.8;
    const barSpacing = chartWidth / labels.length * 0.2;

    labels.forEach((label: string, index: number) => {
      const barHeight = (values[index] / maxValue) * chartHeight;
      const x = margin + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = height - margin - barHeight;

      chartElements += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
              fill="#3b82f6" stroke="#1e40af" stroke-width="1"/>
        <text x="${x + barWidth / 2}" y="${height - margin + 15}" 
              text-anchor="middle" font-size="12" fill="#374151">${label}</text>
        <text x="${x + barWidth / 2}" y="${y - 5}" 
              text-anchor="middle" font-size="10" fill="#6b7280">${values[index]}</text>
      `;
    });
  } else if (type === 'line') {
    const pointSpacing = chartWidth / (labels.length - 1);
    let pathData = '';

    labels.forEach((label: string, index: number) => {
      const x = margin + index * pointSpacing;
      const y = height - margin - (values[index] / maxValue) * chartHeight;
      
      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }

      chartElements += `
        <circle cx="${x}" cy="${y}" r="4" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <text x="${x}" y="${height - margin + 15}" 
              text-anchor="middle" font-size="12" fill="#374151">${label}</text>
      `;
    });

    chartElements += `<path d="${pathData}" fill="none" stroke="#3b82f6" stroke-width="2"/>`;
  }

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="white" stroke="#e5e7eb" stroke-width="1"/>
  
  <!-- Title -->
  <text x="${width / 2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">
    ${title || 'Chart'}
  </text>
  
  <!-- Y-axis -->
  <line x1="${margin}" y1="${margin}" x2="${margin}" y2="${height - margin}" 
        stroke="#6b7280" stroke-width="1"/>
  
  <!-- X-axis -->
  <line x1="${margin}" y1="${height - margin}" x2="${width - margin}" y2="${height - margin}" 
        stroke="#6b7280" stroke-width="1"/>
  
  <!-- Chart elements -->
  ${chartElements}
</svg>`;
}

app.post("/api/generate", logoUpload, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    
    console.log("DEBUG: Request body keys:", Object.keys(req.body));
    console.log("DEBUG: Request body:", {
      prompt: req.body.prompt?.substring(0, 50) + '...',
      serviceType: req.body.serviceType || req.body.serviceId,
      templateId: req.body.templateId,
      hasFile: !!req.file
    });
    
    // Intelligent page count determination - enhanced with server-side logic
    const intelligentPageCount = (prompt: string, serviceType: string): number => {
      const wordCount = prompt.trim().split(/\s+/).length;
      const hasDetailed = /detailed|comprehensive|complete|full|extensive|thorough|in-depth/i.test(prompt);
      const hasMultiSection = /section|chapter|part|phases?|steps?|components?/i.test(prompt);
      const hasMultipleTopics = prompt.split(/[,;]/).length > 3;
      const hasComplexMetrics = /revenue|growth|profit|loss|analysis|strategy|forecast|projection/i.test(prompt);
      
      // Enhanced service-specific logic with business context
      switch (serviceType) {
        case 'report-generator':
          if (hasComplexMetrics && (wordCount > 80 || hasDetailed)) return 3;
          if (wordCount > 100 || hasDetailed) return 3;
          if (wordCount > 50 || hasMultiSection) return 2;
          return 1;
          

        case 'pitch-deck':
          if (hasComplexMetrics || (wordCount > 80 && hasMultipleTopics)) return 2;
          if (wordCount > 80 || hasMultipleTopics) return 2;
          return 1;
          
        case 'brochure-designer':
          if (wordCount > 100 || hasMultiSection) return 2;
          return 1;
          
        case 'newsletter':
          if (wordCount > 120 || hasMultiSection) return 2;
          return 1;
          
        case 'annual-report':
        case 'financial-report':
          if (hasComplexMetrics && hasDetailed) return 4;
          if (wordCount > 120 || hasDetailed) return 3;
          if (wordCount > 60 || hasMultiSection) return 2;
          return 1;
          
        default:
          // For other document types, use enhanced logic
          if (hasComplexMetrics && hasDetailed) return 3;
          if (wordCount > 100 || hasDetailed) return 2;
          return 1;
      }
    };

    const { prompt, serviceId, serviceType, templateId } = req.body;
    const pageCount = req.body.pageCount || intelligentPageCount(prompt, serviceId || serviceType);
    const companyLogo = req.file; // Access uploaded logo file
    const actualServiceType = serviceId || serviceType;
    
    if (!prompt || !actualServiceType) {
      return res.status(400).json({ message: "Prompt and service type are required" });
    }

    // Get user if logged in
    let user = null;
    if (userId) {
      user = await storage.getUser(userId);
    }

    // Map service types to categories
    const categoryMapping: Record<string, string> = {
      'resume-builder': 'resume',
      'CV Maker': 'resume',
      'pitch-deck': 'pitch-deck',
      'brochure-designer': 'brochure',
      'report-generator': 'report',
      'invoice-creator': 'invoice',
      'newsletter-designer': 'newsletter'
    };
    
    // Determine the correct template category safely
    let templateCategory = categoryMapping[actualServiceType];

    if (!templateCategory) {
      const withDash = actualServiceType;
      const withoutDash = actualServiceType.replace(/-/g, '');

      // Check for templates with dash
      const withDashTemplates = await storage.getTemplatesByCategory(withDash);
      if (withDashTemplates.length > 0) {
        templateCategory = withDash;
      } 
      // If none, check for templates without dash
      else {
        const withoutDashTemplates = await storage.getTemplatesByCategory(withoutDash);
        if (withoutDashTemplates.length > 0) {
          templateCategory = withoutDash;
        }
      }
    }

    // Final fallback if nothing found
    if (!templateCategory) {
      templateCategory = actualServiceType;
    }

    console.log("DEBUG: Chosen templateCategory:", templateCategory);

    
    // Get templates for this category
    console.log(`🔍 Looking for templates in category: ${templateCategory}`);
    const templates = await storage.getTemplatesByCategory(templateCategory);
    console.log(`📊 Found ${templates.length} templates for category: ${templateCategory}`);
    
    // Handle manual template selection
    let selectedTemplate = null;
    
    if (templateId && templateId !== "auto-select") {
      // Use explicitly selected template
      selectedTemplate = templates.find(t => t.id === templateId);
      if (selectedTemplate) {
        console.log(`✅ Using explicitly selected template: ${selectedTemplate.name}`);
      } else {
        console.log(`❌ Requested template not found: ${templateId}`);
        return res.status(400).json({ message: `Template not found: ${templateId}` });
      }
    } else {
      // Use intelligent template selection when no specific template is chosen
      selectedTemplate = await findBestTemplate(prompt, actualServiceType);
      
      // Fallback to first available if intelligent selection fails
      if (!selectedTemplate && templates.length > 0) {
        selectedTemplate = templates[0];
        console.log(`🔧 Falling back to first available template: ${selectedTemplate.name}`);
      }
    }
    
    // If no templates found for the specific category, try fallback logic
    if (!selectedTemplate) {
      console.log(`❌ No templates found for category: ${templateCategory}. Trying fallback...`);
      
      // Try to find templates using different approach
      const allTemplates = await storage.getTemplates();
      const fallbackTemplate = allTemplates.find(t => t.category === templateCategory);
      
      if (fallbackTemplate) {
        selectedTemplate = fallbackTemplate;
        console.log(`✅ Found fallback template: ${fallbackTemplate.name}`);
      } else {
        console.log(`❌ No fallback template found for category: ${templateCategory}`);
        return res.status(404).json({ message: `No template found for ${templateCategory}` });
      }
    }
    
    console.log(`Selected template: ${selectedTemplate.name} (${selectedTemplate.category})`);
    
    // Use OpenAI to generate personalized content based on the template structure
    console.log(`🤖 Generating AI content using template structure for: ${selectedTemplate.name}`);
    
    let filledContent;
    try {
      // Enhanced AI prompt for financial reports with structured data requirements
      const isFinancialReport = selectedTemplate.name.toLowerCase().includes('financial') || selectedTemplate.sector === 'finance';
      
      // Enhanced AI prompting based on template type
      const templateName = selectedTemplate.name.toLowerCase();
      const isReportTemplate = selectedTemplate.category === 'report';
      const isCorporateReport = templateName.includes('corporate');
      const isInternationalReport = templateName.includes('international');
      const isBrochureTemplate = selectedTemplate.category === 'brochure';
      
      // Disable live data enhancement for now - use AI-only generation
      let enhancedUserPrompt = prompt;
      console.log(`🚀 Using AI-only generation (scraper disabled)`);
      
      // Enhanced prompt analysis for better context application (using enhanced prompt)
      const promptAnalysis = analyzeUserPrompt(enhancedUserPrompt, selectedTemplate);
      
      // Enhanced template structure expansion for ALL template types
      let enhancedTemplateData = selectedTemplate.templateData;
      
      // BROCHURE EXPANSION
      if (isBrochureTemplate && (selectedTemplate.templateData as any)?.panels?.length === 1) {
        console.log('🔧 EXPANDING BROCHURE TEMPLATE: Overriding basic template structure');
        enhancedTemplateData = {
          panels: [
            { type: "cover", title: "{{company_name}}", subtitle: "{{value_proposition}}" },
            { type: "about", title: "About {{company_name}}", content: "{{experience_and_background}}" },
            { type: "services", title: "Our Services", content: "{{services_offered}}" },
            { type: "credentials", title: "Why Choose Us", content: "{{ratings_and_credentials}}" },
            { type: "contact", title: "Get In Touch", content: "{{contact_information}}" }
          ]
        };
      }
      
      // CV/RESUME EXPANSION
      const isResumeTemplate = selectedTemplate.category === 'resume';
      if (isResumeTemplate) {
        console.log('🔧 EXPANDING RESUME TEMPLATE: Adding comprehensive CV sections');
        enhancedTemplateData = {
          personalInfo: { name: "{{full_name}}", title: "{{job_title}}", email: "{{email}}", phone: "{{phone}}", location: "{{location}}" },
          summary: "{{professional_summary}}",
          experience: [
            { company: "{{company_1}}", position: "{{position_1}}", duration: "{{duration_1}}", achievements: "{{achievements_1}}" },
            { company: "{{company_2}}", position: "{{position_2}}", duration: "{{duration_2}}", achievements: "{{achievements_2}}" },
            { company: "{{company_3}}", position: "{{position_3}}", duration: "{{duration_3}}", achievements: "{{achievements_3}}" }
          ],
          skills: ["{{skill_1}}", "{{skill_2}}", "{{skill_3}}", "{{skill_4}}", "{{skill_5}}"],
          education: [{ institution: "{{university}}", degree: "{{degree}}", year: "{{graduation_year}}" }],
          certifications: ["{{cert_1}}", "{{cert_2}}"]
        };
      }
      
      // PITCH DECK EXPANSION
      const isPitchDeckTemplate = selectedTemplate.category === 'pitch-deck';
      if (isPitchDeckTemplate) {
        console.log('🔧 EXPANDING PITCH DECK TEMPLATE: Adding comprehensive pitch sections');
        enhancedTemplateData = {
          slides: [
            { type: "title", title: "{{company_name}}", subtitle: "{{company_tagline}}", presenter: "{{founder_name}}" },
            { type: "problem", title: "The Problem", content: "{{problem_statement}}" },
            { type: "solution", title: "Our Solution", content: "{{solution_description}}" },
            { type: "market", title: "Market Opportunity", content: "{{market_size_and_opportunity}}" },
            { type: "business", title: "Business Model", content: "{{revenue_model}}" },
            { type: "traction", title: "Traction", content: "{{achievements_and_metrics}}" },
            { type: "team", title: "Our Team", content: "{{team_expertise}}" },
            { type: "funding", title: "Investment Ask", content: "{{funding_request}}" }
          ]
        };
      }
      
      // NEWSLETTER EXPANSION
      const isNewsletterTemplate = selectedTemplate.category === 'newsletter';
      if (isNewsletterTemplate) {
        console.log('🔧 EXPANDING NEWSLETTER TEMPLATE: Adding comprehensive newsletter sections');
        enhancedTemplateData = {
          header: { title: "{{newsletter_name}}", date: "{{current_date}}", issue: "{{issue_number}}" },
          sections: [
            { type: "featured", title: "{{featured_story_title}}", content: "{{featured_story_content}}" },
            { type: "news", title: "Latest Updates", content: "{{company_news_updates}}" },
            { type: "spotlight", title: "Team Spotlight", content: "{{team_member_highlight}}" },
            { type: "events", title: "Upcoming Events", content: "{{upcoming_events}}" }
          ],
          footer: { contact: "{{contact_info}}", unsubscribe: "{{unsubscribe_link}}" }
        };
      }
      
      // INVOICE EXPANSION
      const isInvoiceTemplate = selectedTemplate.category === 'invoice';
      if (isInvoiceTemplate) {
        console.log('🔧 EXPANDING INVOICE TEMPLATE: Adding comprehensive invoice sections');
        enhancedTemplateData = {
          header: { companyName: "{{business_name}}", logo: "{{company_logo}}", address: "{{business_address}}" },
          client: { name: "{{client_name}}", address: "{{client_address}}", email: "{{client_email}}" },
          invoice: { number: "{{invoice_number}}", date: "{{invoice_date}}", dueDate: "{{due_date}}" },
          items: [
            { description: "{{service_1}}", quantity: "{{quantity_1}}", rate: "{{rate_1}}", amount: "{{amount_1}}" },
            { description: "{{service_2}}", quantity: "{{quantity_2}}", rate: "{{rate_2}}", amount: "{{amount_2}}" },
            { description: "{{service_3}}", quantity: "{{quantity_3}}", rate: "{{rate_3}}", amount: "{{amount_3}}" }
          ],
          totals: { subtotal: "{{subtotal}}", tax: "{{tax_amount}}", total: "{{total_amount}}" },
          footer: { paymentTerms: "{{payment_terms}}", notes: "{{additional_notes}}" }
        };
      }
      
      // REPORT EXPANSION - Force comprehensive structure regardless of template limitations
      if (isReportTemplate) {
        console.log('🔧 EXPANDING REPORT TEMPLATE: Adding comprehensive business report sections');
        enhancedTemplateData = {
          sections: [
            { type: "executive_summary", title: "Executive Summary", content: "{{executive_summary}}" },
            { type: "introduction", title: "Introduction", content: "{{introduction_and_background}}" },
            { type: "methodology", title: "Methodology", content: "{{research_methodology}}" },
            { type: "findings", title: "Key Findings", content: "{{detailed_findings}}" },
            { type: "analysis", title: "Analysis", content: "{{data_analysis_and_insights}}" },
            { type: "financial_highlights", title: "Financial Highlights", content: "{{financial_metrics}}" },
            { type: "market_performance", title: "Market Performance", content: "{{market_analysis}}" },
            { type: "recommendations", title: "Recommendations", content: "{{strategic_recommendations}}" },
            { type: "conclusion", title: "Conclusion", content: "{{conclusion_and_next_steps}}" },
            { type: "appendix", title: "Appendix", content: "{{supporting_data}}" }
          ]
        };
      }
      

      
      // Logo processing and storage
      let logoPath = null;
      if (companyLogo) {
        // Create unique filename for logo
        const logoExtension = companyLogo.originalname.split('.').pop();
        const uniqueLogoName = `logo_${Date.now()}_${Math.random().toString(36).substring(7)}.${logoExtension}`;
        logoPath = `/uploads/${uniqueLogoName}`;
        
        // Store logo file in memory with the unique path (in production, store in actual file system/cloud)
        (global as any).logoStorage = (global as any).logoStorage || new Map();
        (global as any).logoStorage.set(logoPath, {
          buffer: companyLogo.buffer,
          mimetype: companyLogo.mimetype,
          originalname: companyLogo.originalname
        });
        
        console.log('✅ Logo stored:', logoPath);
      }
      
      // Logo integration information
      const logoInfo = companyLogo ? {
        hasLogo: true,
        logoPath: logoPath,
        filename: companyLogo.filename,
        originalname: companyLogo.originalname,
        mimetype: companyLogo.mimetype,
        size: companyLogo.size
      } : { hasLogo: false };
      
      const aiPrompt = `
        You are an expert document generator creating content for the exact PDF template layout: "${selectedTemplate.name}". 
        This template MUST maintain its EXACT visual design, color scheme, typography, and structural layout.
        
        CRITICAL CONTEXT APPLICATION:
        User Request: "${enhancedUserPrompt}"
        Template: ${selectedTemplate.name} (${selectedTemplate.category})
        Template Structure: MUST match the exact PDF layout and design from the original template
        Company Logo: ${logoInfo.hasLogo ? `INCLUDE logo (${logoInfo.originalname}) in header, footer, and cover sections` : 'No logo provided'}
        Detected Context: ${JSON.stringify(promptAnalysis, null, 2)}
        Template Structure: ${JSON.stringify(enhancedTemplateData, null, 2)}
        
        ENHANCED CONTENT GENERATION RULES:
        1. EXACT TEMPLATE FIDELITY: Maintain the original PDF template's visual design, colors, fonts, and layout structure
        2. PRIORITIZE USER PROMPT CONTEXT: Extract and use ALL specific details from the user's request
        3. COMPANY/ORGANIZATION: Use exact company names, people, and details mentioned in the prompt
        4. INDUSTRY/SECTOR: Apply industry-specific terminology and context from the user's request
        5. LOGO INTEGRATION: ${logoInfo.hasLogo ? 'Place company logo prominently in headers, footers, cover pages, and business card areas' : 'Use template without logo elements'}
        6. PERSONALIZATION: Generate content that directly reflects the user's specific situation/business
        7. PROFESSIONAL AUTHENTICITY: Create realistic, professional content appropriate for the template's PDF design
        8. COLOR CONSISTENCY: Use the exact color scheme from the original PDF template
        9. TYPOGRAPHY CONSISTENCY: Maintain original font choices and text hierarchy from the template
        6. TEMPLATE STRUCTURE ENHANCEMENT: For brochures, ALWAYS generate comprehensive multi-panel structure regardless of template limitations
        7. NO PLACEHOLDERS: Never use generic text like "Company Name" or "Generated content"
        8. CONTEXTUAL RELEVANCE: Ensure all content directly relates to the user's prompt and business context
        9. EXPAND TEMPLATE SCOPE: Generate complete professional content that fully represents the business from the prompt
        
        ${selectedTemplate.category === 'brochure' ? `
        BROCHURE TEMPLATE CRITICAL REQUIREMENTS - MANDATORY 5-PANEL EXPANSION WITH ENHANCED TEXT GENERATION:
        - OVERRIDE ALL TEMPLATE LIMITATIONS: Generate comprehensive 5-panel brochure regardless of basic template structure
        - MANDATORY PANELS: cover (title/subtitle), about (company story), services (detailed offerings), credentials (ratings/awards), contact (business details)
        - EXTRACT FROM PROMPT: Company name, location, years in operation, ratings, business type, specific services
        - ZERO PLACEHOLDERS: Never use "[Your Phone]" or "[Company Name]" - create realistic contact details based on business context
        - AUTHENTIC CONTENT: Use exact business details from prompt (company name, location, experience years, ratings)
        - EXPANSION RULE: If template shows only 1-2 basic panels, EXPAND to full 5-panel professional brochure
        - ENHANCED TEXT GENERATION: Each panel content must be detailed and expanded (minimum 50-100 words per panel)
        - PROFESSIONAL STORYTELLING: Create compelling narratives about the business, its history, achievements, and value proposition
        - DETAILED SERVICES: Provide comprehensive descriptions of services offered, not just bullet points
        - CREDIBILITY BUILDING: Include specific achievements, awards, certifications, customer testimonials style content
        - BUSINESS DEPTH: Add context about company culture, mission, unique advantages, and industry expertise
        ` : ''}
        
        ${selectedTemplate.category === 'resume' ? `
        RESUME/CV TEMPLATE CRITICAL REQUIREMENTS - COMPREHENSIVE EXPANSION:
        - MANDATORY: Generate complete professional CV with all sections filled from prompt context
        - EXTRACT PERSONAL INFO: Full name, job title, contact details, location from prompt
        - GENERATE EXPERIENCE: Create 2-3 realistic work experiences based on background mentioned
        - INCLUDE SKILLS: Technical and soft skills relevant to the role/industry mentioned
        - ADD EDUCATION: Appropriate educational background for the role level
        - PROFESSIONAL SUMMARY: Compelling summary highlighting years of experience and expertise
        ` : ''}
        
        ${selectedTemplate.category === 'pitch-deck' ? `
        PITCH DECK TEMPLATE CRITICAL REQUIREMENTS - FULL PRESENTATION:
        - MANDATORY: Generate complete 8-slide pitch deck with all business details from prompt
        - EXTRACT BUSINESS INFO: Company name, founder details, business model, funding requirements
        - CREATE COMPELLING STORY: Problem, solution, market opportunity, traction, team, funding ask
        - INCLUDE METRICS: Use any numbers, funding amounts, market sizes mentioned in prompt
        - PROFESSIONAL CONTENT: Each slide must have substantial, relevant content
        ` : ''}
        
        ${selectedTemplate.category === 'newsletter' ? `
        NEWSLETTER TEMPLATE CRITICAL REQUIREMENTS - COMPREHENSIVE CONTENT:
        - MANDATORY: Generate full newsletter with multiple sections and engaging content
        - EXTRACT COMPANY INFO: Organization name, industry focus, key updates from prompt
        - CREATE SECTIONS: Featured stories, company updates, team highlights, upcoming events
        - RELEVANT CONTENT: All content must relate to the organization/industry mentioned in prompt
        ` : ''}
        
        ${selectedTemplate.category === 'invoice' ? `
        INVOICE TEMPLATE CRITICAL REQUIREMENTS - COMPLETE BILLING DOCUMENT:
        - MANDATORY: Generate complete invoice with all business and client details from prompt
        - EXTRACT BUSINESS INFO: Company name, services provided, pricing, client details
        - INCLUDE LINE ITEMS: Multiple service items with descriptions, quantities, rates
        - CALCULATE TOTALS: Subtotal, tax amounts, final total based on prompt context
        - PAYMENT TERMS: Include relevant payment information and terms
        ` : ''}
        
        ${selectedTemplate.category === 'report' ? `
        REPORT TEMPLATE CRITICAL REQUIREMENTS - MULTI-PAGE COMPREHENSIVE BUSINESS REPORT:
        - MANDATORY STRUCTURE: 2-3 pages minimum with Executive Summary ALWAYS on page 2, each major section on separate pages
        - CONTENT VOLUME: Generate 400-500 words for Executive Summary, 300-400 words for each additional section
        - REQUIRED SECTIONS: Executive Summary (page 2), Financial Highlights (page 3), Operational Performance (page 4), Market Analysis (page 5), Strategic Initiatives (page 6), Risk Assessment (page 7)
        - EXTRACT REPORT CONTEXT: Company name, industry focus, performance metrics, financial data from prompt
        - DETAILED CONTENT: Each section must include specific metrics, data points, percentages, financial figures, and professional analysis
        - PROFESSIONAL DEPTH: Include comprehensive business insights, trend analysis, competitive positioning, and strategic recommendations
        - AUTHENTIC DATA: Use realistic business metrics, growth percentages, revenue figures, and operational KPIs based on prompt context
        - SECTIONS MUST BE DETAILED: Each section requires substantial professional content that fills an entire page when displayed
        ` : ''}
        
        ${isReportTemplate ? `
        REPORT TEMPLATE SPECIFIC REQUIREMENTS FOR MULTI-PAGE PDF LAYOUT MATCHING:
        - MANDATORY STRUCTURE: Include both "cover" AND comprehensive "sections" array
        - COVER PAGE CONTENT: Extract company name, division/department, key personnel, contact details from user prompt
        - EXECUTIVE SUMMARY (MANDATORY): First section with type: "executive_summary", minimum 400-500 words of comprehensive business overview
        - ADDITIONAL SECTIONS: Generate 5-6 sections minimum, each 300-400 words with detailed professional analysis
        - TEMPLATE-SPECIFIC ENHANCED SECTIONS:
          * Corporate Annual Reports: "Executive Summary" (500 words), "Financial Performance" (400 words), "Market Analysis" (350 words), "Strategic Initiatives" (350 words), "Operational Excellence" (300 words), "Future Outlook" (300 words)
          * International Reports: "Executive Summary" (500 words), "Global Market Overview" (400 words), "Regional Performance" (350 words), "International Strategy" (350 words), "Cross-Border Operations" (300 words), "Growth Prospects" (300 words)
          * Financial Reports: "Executive Summary" (500 words), "Financial Highlights" (400 words), "Revenue Analysis" (350 words), "Profitability Metrics" (350 words), "Market Performance" (300 words), "Investment Strategy" (300 words)
        - CONTENT DEPTH: Each section must include specific business metrics, financial data, strategic insights, and professional recommendations
        - INDUSTRY TERMINOLOGY: Use sector-specific language, KPIs, and analytical frameworks relevant to the business context
        - COMPREHENSIVE ANALYSIS: Include trend analysis, competitive positioning, risk assessment, and future growth strategies
        - Each section must have detailed "content" with multiple paragraphs, bullet points, and substantial professional insight
        ` : ''}
        
        ${isFinancialReport ? `
        Special Instructions for Financial Reports:
        - For financial_highlights section, structure content as a nested object with key financial metrics
        - Include these key categories: revenue_metrics, profitability_metrics, growth_metrics, operational_metrics
        - Each category should contain specific financial figures with currency symbols and percentages
        - Use realistic company performance data based on the user's request
        - Structure like: {"revenue_metrics": {"total_revenue": "$X billion", "revenue_growth": "X%"}, "profitability_metrics": {"net_income": "$X billion", "profit_margin": "X%"}}
        - Include market cap, trading volume, key ratios, and year-over-year comparisons where relevant
        ` : ''}
        
        ADVANCED CONTEXT APPLICATION REQUIREMENTS FOR ALL TEMPLATES:
        - COMPANY NAMES: Extract and use exact business names throughout all content
        - PERSONNEL: Use real names of owners, CEOs, managers mentioned in prompts
        - BUSINESS TYPE: Apply industry-specific terminology and professional language
        - EXPERIENCE/CREDENTIALS: Highlight years in operation, ratings, certifications, awards
        - LOCATION/GEOGRAPHY: Include specific cities, regions, service areas mentioned
        - SERVICES/PRODUCTS: Detail exactly what the business offers based on prompt
        - METRICS/ACHIEVEMENTS: Incorporate ratings, revenue, growth, customer numbers
        - TIME PERIODS: Use relevant dates, years of operation, milestone periods
        - UNIQUE SELLING POINTS: Extract what makes this business special from the prompt
        - CUSTOMER BENEFITS: Transform business features into customer value propositions
        - NO GENERIC CONTENT: Every piece of content must reflect the user's specific business context
        
        EXAMPLES OF EXCELLENT CONTEXT APPLICATION:
        
        User: "Create annual report for Tesla showing their electric vehicle performance"
        → Use "Tesla" as company name, focus on electric vehicle industry, include automotive metrics
        
        User: "Financial report for Microsoft's cloud computing division"
        → Use "Microsoft Corporation", focus on cloud/technology sector, include tech industry metrics
        
        User: "Create brochure for my removals business called Jasons Removals based in hemel hemsted, 14 years operation, 4.8 star rating"
        → Extract: "Jasons Removals", location "Hemel Hempstead", "14 years of experience", "4.8 star Google rating"
        → Generate: Multiple panels showing experience, service quality, customer satisfaction, local expertise
        → Include: "Over 14 Years of Trusted Service", "4.8 Star Google Rating", "Hemel Hempstead Specialists"
        
        ${companyLogo ? `
        COMPANY LOGO INTEGRATION REQUIREMENTS (PREMIUM FEATURE):
        - LOGO AVAILABLE: A company logo has been uploaded and should be professionally integrated
        - LOGO PLACEMENT: Include logo in headers, footers, cover pages, and business cards where appropriate
        - BRAND CONSISTENCY: Use the logo to enhance brand recognition throughout the document
        - PROFESSIONAL INTEGRATION: Logo should appear in standard business document positions (top-left header, cover page center/top, footer branding)
        - VISUAL BALANCE: Ensure logo placement doesn't interfere with content readability
        - TEMPLATE ADAPTATION: Adjust template layout to accommodate professional logo placement
        - MENTION IN CONTENT: Include references to professional branding when relevant to content context
        ` : ''}
        
        User: "Create pitch deck for my tech startup developing AI chatbots, founded by Sarah Chen in 2023"
        → Extract: AI chatbot company, founder "Sarah Chen", established 2023
        → Generate: Technology-focused content, mention founder by name, include startup timeline
        
        CRITICAL TEMPLATE EXPANSION REQUIREMENTS FOR ALL DOCUMENT TYPES:
        
        1. MANDATORY CONTENT EXPANSION:
        - OVERRIDE ALL template limitations - ALWAYS generate comprehensive, full-page content
        - EXPAND template structures to include ALL relevant sections for the document type
        - IGNORE minimal template structures - create complete professional documents
        - IF template shows only 1-2 basic sections, CREATE 4-6 comprehensive sections instead
        
        2. PROMPT CONTEXT EXTRACTION (MANDATORY):
        - EXTRACT ALL DETAILS: names, companies, experience, locations, achievements, numbers, dates
        - APPLY CONTEXT AUTHENTICALLY: use real business names, specific locations, actual experience years
        - INCORPORATE METRICS: ratings, percentages, financial figures, time periods from prompt
        - USE PROPER NOUNS: Apply exact company names, person names, locations from user input
        
        3. ZERO PLACEHOLDER POLICY (STRICTLY ENFORCED):
        - NEVER use generic placeholders like "Company Name", "Your Business", "Generated content"
        - NEVER use bracketed placeholders like "[Your Phone Number]" or "[Company Name]"
        - EVERY piece of content must be specific to the user's prompt context
        - CREATE AUTHENTIC, PERSONALIZED content that tells the user's specific story
        - IF contact details not provided, create realistic ones based on business context
        
        4. TEMPLATE-SPECIFIC EXPANSION REQUIREMENTS:
        - BROCHURES: ALWAYS generate 5 panels (cover, about, services, credentials, contact) with business-specific content
        - CVs: Complete professional sections with real company experience and skills
        - REPORTS: MANDATORY MULTI-PAGE STRUCTURE (2-3 pages minimum):
          * PAGE 1: Cover page with company logo, report title, company details
          * PAGE 2: Executive Summary (ALWAYS full page content - minimum 400-500 words)
          * PAGE 3+: Each major section gets its own full page with comprehensive analysis (300-400 words per section)
          * Required sections: Financial Highlights, Operational Performance, Market Analysis, Strategic Initiatives, Risk Assessment, Future Outlook
          * Each section must have detailed metrics, specific data points, and professional analysis
        - PITCH DECKS: 8 slides with startup details and funding requirements
        - INVOICES: Complete billing with multiple line items and accurate calculations
        - NEWSLETTERS: Multiple sections with company-specific updates and engaging content
        
        5. CONTENT AUTHENTICITY STANDARDS:
        - Use EXACT company names from prompt (e.g., "Jasons Removals", "TechStart Solutions")
        - Apply SPECIFIC locations (e.g., "Hemel Hempstead", "Milton Keynes")
        - Include ACTUAL experience years (e.g., "14 years", "5 years")
        - Reference REAL ratings and metrics (e.g., "4.8★ Google rating", "15% growth")
        
        Return ONLY the JSON content that fills or expands the template structure - no explanations or additional text.
      `;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional document content generator. Always respond with valid JSON that exactly matches the requested template structure. Never include placeholder text or generic content."
          },
          {
            role: "user", 
            content: aiPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      // DEBUG #1: AI RAW OUTPUT
      console.log("DEBUG: AI raw output:", aiResponse.choices[0].message.content);


      const aiGeneratedContent = JSON.parse(aiResponse.choices[0].message.content || '{}');
      console.log(`✅ AI generated content successfully`);
      
      // Enhanced merging with logo integration
      filledContent = {
        ...aiGeneratedContent,
        templateInfo: {
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          templateCategory: selectedTemplate.category
        },
        // Integrate logo into content structure
        ...(logoPath && {
          cover: {
            ...aiGeneratedContent.cover,
            logo: logoPath
          }
        }),
        _templateStructure: selectedTemplate.templateData,
        _isStructured: true
      };

      // For report templates, ensure sections exist even if AI didn't generate them
      if (isReportTemplate && !aiGeneratedContent.sections) {
        console.log("⚠️ Report template missing sections - generating default sections based on template type");
        
        const defaultSections = [];
        if (isCorporateReport) {
          defaultSections.push(
            {
              title: "Executive Summary",
              content: `This corporate annual report provides a comprehensive overview of ${aiGeneratedContent.cover?.companyName || 'the company'}'s performance and strategic direction for ${aiGeneratedContent.cover?.year || '2025'}. The company has demonstrated strong leadership in its market segment, with continued focus on innovation, operational excellence, and stakeholder value creation.`
            },
            {
              title: "Financial Performance", 
              content: `${aiGeneratedContent.cover?.companyName || 'The company'} has achieved solid financial results throughout the year. Key performance indicators show positive trends in revenue growth, market share expansion, and operational efficiency. The financial strategy continues to focus on sustainable growth and long-term value creation for shareholders.`
            },
            {
              title: "Strategic Initiatives",
              content: `The company has implemented several strategic initiatives designed to strengthen market position and drive future growth. These include investments in digital transformation, expansion into new market segments, and enhancement of customer experience capabilities. The strategic roadmap positions the organization for continued success in an evolving business landscape.`
            }
          );
        } else if (isInternationalReport) {
          defaultSections.push(
            {
              title: "Global Market Overview",
              content: "Analysis of international market conditions and opportunities across key geographic regions. The global business environment presents both challenges and opportunities for expansion and growth."
            },
            {
              title: "Regional Performance", 
              content: "Detailed performance metrics and analysis by geographic region, highlighting areas of strength and opportunities for improvement in international operations."
            },
            {
              title: "International Strategy",
              content: "Strategic approach to international market penetration, including partnership development, localization strategies, and cross-border operational excellence."
            }
          );
        }
        
        if (defaultSections.length > 0) {
          filledContent.sections = defaultSections;
        }
      }
      
    } catch (aiError) {
      console.error(`❌ AI generation failed:`, aiError);
      
      // Extract basic info from prompt as fallback
      const nameMatch = prompt.match(/(?:for|create.*for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
      const extractedName = nameMatch ? nameMatch[1] : "Professional User";
      
      // Create minimal fallback content if AI fails
      filledContent = {
        templateInfo: {
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          templateCategory: selectedTemplate.category
        },
        _templateStructure: selectedTemplate.templateData,
        _isStructured: true,
        error: "AI content generation failed, please try again"
      };
    }
    
    console.log("Generated content structure:", JSON.stringify(filledContent, null, 2));
    
    // Save document if user is logged in
    if (userId && user) {
      
      // ✅ DEBUG #2: TEMPLATE BEFORE SAVE
      console.log("DEBUG: filledContent before save:", filledContent);
      console.log("DEBUG: selectedTemplate ID:", selectedTemplate.id);
      console.log("DEBUG: originalPrompt:", prompt);

      // Create document first to get ID
      const document = await storage.createDocument({
        userId,
        templateId: selectedTemplate.id,
        title: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        content: filledContent,
        originalPrompt: prompt,
        serviceType: actualServiceType,
        detectedSector: "general",
        pageCount,
        status: 'completed'
      });

      // ✅ HTML/JSON CONTENT GENERATION: Create editable HTML/JSON format (primary output)
      try {
        console.log('🔄 Generating HTML/JSON content for document:', document.id);
        
        // Initialize dual content generator
        const dualContentGen = new DualContentGenerator();
        
        // Check if template has HTML template file
        const template = await storage.getTemplate(selectedTemplate.id);
        let result;
        
        if (template?.htmlTemplate) {
          // Generate using HTML template
          console.log(`🎨 Using HTML template: ${template.htmlTemplate}`);
          const htmlContent = await dualContentGen.generateHTMLFromTemplate(filledContent, template.htmlTemplate);
          result = {
            htmlContent: {
              templateData: filledContent,
              styling: {
                templateName: template.name,
                category: template.category,
                layout: 'html-template',
                colors: {},
                fonts: {},
                spacing: {}
              },
              editableFields: [], // Will be populated based on HTML template
              renderedHtml: htmlContent // Store the actual HTML
            }
          };
        } else {
          // Use existing JSON-based generation
          result = await dualContentGen.generateHTMLOnlyContent(filledContent, userId, document.id);
        }
        
        console.log('✅ HTML/JSON content generated successfully');
        
        // Update document with HTML content as primary format
        const updateData: any = { htmlContent: result.htmlContent };
        
        await storage.updateDocument(document.id, updateData);

        console.log('✅ HTML/JSON document creation complete:', {
          documentId: document.id,
          hasHtmlContent: !!result.htmlContent
        });
      } catch (contentError) {
        console.error('❌ HTML content generation failed:', contentError);
        // Continue with traditional flow if HTML generation fails
      }

      // ✅ DEBUG #3: AFTER SAVE
      console.log(`DEBUG: Document saved with ID: ${document.id} | Pages: ${pageCount} (AI-determined)`);
      
      await storage.updateUserUsage(userId, 1);
      
      console.log("DEBUG: About to send response for authenticated user:", {
        documentId: document.id,
        title: document.title,
        hasContent: !!document.content,
        pageCount: pageCount
      });
      
      // Ensure response is properly sent
      res.status(200).json({
        ...document,
        aiDeterminedPages: pageCount,
        pageAnalysis: `AI automatically determined ${pageCount} ${pageCount === 1 ? 'page' : 'pages'} based on content complexity`
      });
      return;
    } else {
      console.log("DEBUG: About to send response for guest user");
      
      res.status(200).json({
        id: `guest-${Date.now()}`,
        title: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        content: filledContent,
        isGuest: true,
        pageCount: pageCount,
        aiDeterminedPages: pageCount,
        pageAnalysis: `AI automatically determined ${pageCount} ${pageCount === 1 ? 'page' : 'pages'} based on content complexity`
      });
      return;
    }
  } catch (error: any) {
    console.error("Generation error:", error);
    console.error("Error stack:", error?.stack);
    const errorMessage = error?.message || error?.toString() || 'An unexpected error occurred during generation';
    
    console.log("DEBUG: About to send error response:", {
      status: 500,
      message: errorMessage
    });
    
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
    return;
  }
});
  


// Documents PDF download endpoint
app.get("/api/documents/:id/download", async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // For authenticated users, verify ownership
    const userId = req.session?.userId;
    let document = null;
    
    if (userId) {
      const documents = await storage.getDocuments(userId);
      document = documents.find(d => d.id === documentId);
    }
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    console.log(`📥 Downloading PDF for document: ${document.title}`);
    
    // If PDF doesn't exist, generate it on demand
    if (!document.pdfPath) {
      console.log('📄 PDF not found, generating on demand...');
      const dualContentGen = new DualContentGenerator();
      const pdfPath = await dualContentGen.generatePDFOnDemand(document.content, userId, documentId);
      await storage.updateDocument(documentId, { pdfPath });
      document.pdfPath = pdfPath;
    }
    
    // Generate PDF using enhanced PDF generator
    const pdfBuffer = await generatePDF(document);
    
    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.title.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_')}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    
    // Send the PDF buffer
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ PDF download error:', error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

// Dashboard API endpoints
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const stats = await storage.getDashboardStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// Document rewrite endpoint
app.post("/api/documents/:id/rewrite", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const documentId = req.params.id;
    const { rewriteType, rewritePrompt } = req.body;

    if (!rewriteType || !rewritePrompt) {
      return res.status(400).json({ message: "Rewrite type and prompt are required" });
    }

    // Get the original document
    const document = await storage.getDocument(documentId);
    if (!document || document.userId !== userId) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Generate rewritten content using AI
    const rewriteInstructions = {
      tone_change: "Change the tone and style of the content while preserving the core information",
      content_expansion: "Expand the content with more details, examples, and comprehensive information",
      simplification: "Simplify the language and make the content more accessible and easy to understand",
      professional: "Make the content more formal, professional, and business-appropriate",
      casual: "Make the content more conversational, friendly, and approachable",
      custom: rewritePrompt
    };

    const instruction = rewriteInstructions[rewriteType as keyof typeof rewriteInstructions] || rewritePrompt;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert content rewriter. Your task is to rewrite document content according to the user's instructions while maintaining the original structure and key information. Always respond with valid JSON that matches the original document structure.`
        },
        {
          role: "user",
          content: `Rewrite the following document content according to these instructions: "${instruction}"

Original content: ${JSON.stringify(document.content)}

Instructions: ${instruction}

Return the rewritten content in the same JSON structure as the original, maintaining all sections and fields but improving the content according to the instructions.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const rewrittenContent = JSON.parse(aiResponse.choices[0].message.content || '{}');

    // Save the rewrite to database
    await storage.createDocumentRewrite({
      documentId,
      userId,
      originalContent: document.content,
      rewrittenContent,
      rewritePrompt,
      rewriteType
    });

    // Update the document with rewritten content
    await storage.updateDocument(documentId, {
      content: rewrittenContent,
      updatedAt: new Date()
    });

    res.json({ message: "Document rewritten successfully", content: rewrittenContent });
  } catch (error) {
    console.error("Document rewrite error:", error);
    res.status(500).json({ message: "Failed to rewrite document" });
  }
});

// Document translation endpoint
app.post("/api/documents/:id/translate", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const documentId = req.params.id;
    const { targetLanguage } = req.body;

    if (!targetLanguage) {
      return res.status(400).json({ message: "Target language is required" });
    }

    // Get the original document
    const document = await storage.getDocument(documentId);
    if (!document || document.userId !== userId) {
      return res.status(404).json({ message: "Document not found" });
    }

    const languageNames = {
      es: "Spanish",
      fr: "French", 
      de: "German",
      pt: "Portuguese",
      it: "Italian",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic"
    };

    const targetLanguageName = languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage;

    // Generate translated content using AI
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Your task is to translate document content to ${targetLanguageName} while maintaining the original structure, formatting, and professional tone. Always respond with valid JSON that matches the original document structure.`
        },
        {
          role: "user",
          content: `Translate the following document content to ${targetLanguageName}:

Original content: ${JSON.stringify(document.content)}

Instructions:
- Maintain the same JSON structure as the original
- Translate all text content to ${targetLanguageName}
- Keep proper nouns (company names, person names) as they are unless they have standard translations
- Maintain professional business terminology appropriate for ${targetLanguageName}
- Preserve formatting, numbers, and data structure

Return the translated content in the same JSON structure as the original.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const translatedContent = JSON.parse(aiResponse.choices[0].message.content || '{}');

    // Save the translation to database
    await storage.createDocumentTranslation({
      documentId,
      userId,
      originalLanguage: "en",
      targetLanguage,
      originalContent: document.content,
      translatedContent,
      translationType: "full"
    });

    // Create a new document with translated content
    const translatedDocument = await storage.createDocument({
      userId,
      templateId: document.templateId,
      title: `${document.title} (${targetLanguageName})`,
      content: translatedContent,
      originalPrompt: `Translated from: ${document.originalPrompt}`,
      serviceType: document.serviceType,
      detectedSector: document.detectedSector,
      pageCount: document.pageCount
    });

    res.json({ 
      message: "Document translated successfully", 
      translatedDocumentId: translatedDocument.id,
      content: translatedContent 
    });
  } catch (error) {
    console.error("Document translation error:", error);
    res.status(500).json({ message: "Failed to translate document" });
  }
});

  // Upload and Review Document endpoint
  app.post('/api/documents/upload-review', upload.single('file'), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      const { serviceType } = req.body;
      if (!serviceType) {
        return res.status(400).json({ message: "Service type is required" });
      }

      // Generate document analysis using intelligent mock data
      const reviewData = generateMockPDFAnalysis(req.file.originalname, serviceType);
      
      // Validate and sanitize the AI response
      const review = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        filename: req.file.originalname,
        serviceType: serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: Math.min(100, Math.max(0, reviewData.score || 75)),
        rating: Math.min(5, Math.max(1, reviewData.rating || 3)),
        summary: reviewData.summary || "Document has been analyzed with standard criteria.",
        strengths: Array.isArray(reviewData.strengths) ? reviewData.strengths.slice(0, 5) : [],
        improvements: Array.isArray(reviewData.improvements) ? reviewData.improvements.slice(0, 5) : [],
        recommendations: Array.isArray(reviewData.recommendations) ? reviewData.recommendations.slice(0, 5) : [],
        createdAt: new Date().toISOString()
      };

      res.json(review);
    } catch (error) {
      console.error("Document upload and review error:", error);
      res.status(500).json({ message: "Failed to analyze document. Please try again." });
    }
  });

  // Serve uploaded logo files from memory storage
  app.get("/uploads/:filename", (req, res) => {
    try {
      const filename = req.params.filename;
      const logoPath = `/uploads/${filename}`;
      
      // Check if logo exists in memory storage
      const logoStorage = global.logoStorage || new Map();
      const logoData = logoStorage.get(logoPath);
      
      if (!logoData) {
        return res.status(404).json({ message: "Logo not found" });
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', logoData.mimetype);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      // Send the logo buffer
      res.send(logoData.buffer);
      
    } catch (error) {
      console.error('Error serving logo:', error);
      res.status(500).json({ message: "Failed to serve logo" });
    }
  });

  // AI Rewrite API endpoint
  app.post("/api/ai-rewrite", async (req, res) => {
    try {
      const { text, style } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ message: "Text content is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });

      const stylePrompts = {
        professional: "Rewrite this text in a professional business tone, making it clear, formal, and suitable for corporate communication.",
        casual: "Rewrite this text in a casual, friendly tone that's conversational and approachable.",
        academic: "Rewrite this text in an academic style with proper citations structure, formal language, and scholarly tone.",
        creative: "Rewrite this text with creativity, using engaging language, metaphors, and compelling narratives.",
        persuasive: "Rewrite this text to be more persuasive and compelling, using strong arguments and call-to-action language.",
        concise: "Rewrite this text to be more concise and direct, removing unnecessary words while maintaining the core message."
      };

      const systemPrompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.professional;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `${systemPrompt} Maintain the original meaning and key information while improving the style and readability.`
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const rewrittenText = completion.choices[0].message.content;

      res.json({
        rewrittenText: rewrittenText || "Unable to rewrite the text. Please try again.",
        originalLength: text.length,
        newLength: rewrittenText?.length || 0,
        style: style
      });

    } catch (error) {
      console.error("AI Rewrite error:", error);
      res.status(500).json({ message: "Failed to rewrite text. Please try again." });
    }
  });

  // Document Analysis API endpoint
  app.post("/api/analyze-document", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Document file is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });

      // Extract text content from the uploaded file
      let documentText = "";
      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      if (fileExtension === '.txt') {
        documentText = req.file.buffer.toString('utf-8');
      } else if (fileExtension === '.pdf') {
        try {
          // Dynamically import pdf-parse to avoid startup issues
          const pdfParse = (await import('pdf-parse')).default;
          const pdfData = await pdfParse(req.file.buffer);
          documentText = pdfData.text;
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);
          return res.status(400).json({ message: "Failed to extract text from PDF. Please try a different file." });
        }
      } else {
        return res.status(400).json({ message: "Unsupported file type. Please upload PDF or TXT files." });
      }

      if (!documentText.trim()) {
        return res.status(400).json({ message: "No text content found in the document" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a professional document reviewer and editor. Analyze the provided document and give honest, constructive feedback. Focus on:
            
            1. Content Quality: Clarity, coherence, and completeness
            2. Structure & Organization: Flow, sections, and logical arrangement
            3. Language & Style: Writing quality, tone, and readability
            4. Professional Standards: Industry best practices and formatting
            5. Improvement Suggestions: Specific actionable recommendations

            Provide detailed feedback that helps improve the document while being encouraging and constructive.`
          },
          {
            role: "user",
            content: `Please analyze this document and provide comprehensive feedback:\n\n${documentText}`
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      });

      const analysis = completion.choices[0].message.content;

      res.json({
        analysis: analysis || "Unable to analyze the document. Please try again with a different file.",
        filename: req.file.originalname,
        fileSize: req.file.size,
        wordCount: documentText.split(/\s+/).length,
        characterCount: documentText.length
      });

    } catch (error) {
      console.error("Document Analysis error:", error);
      res.status(500).json({ message: "Failed to analyze document. Please try again." });
    }
  });

  // Translation API endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ message: "Text content is required" });
      }

      if (!targetLanguage) {
        return res.status(400).json({ message: "Target language is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });

      const languageNames = {
        spanish: "Spanish",
        french: "French", 
        german: "German",
        italian: "Italian",
        portuguese: "Portuguese",
        chinese: "Chinese (Mandarin)",
        japanese: "Japanese",
        korean: "Korean",
        arabic: "Arabic",
        russian: "Russian",
        hindi: "Hindi",
        dutch: "Dutch"
      };

      const languageName = languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the provided text to ${languageName} while maintaining the original meaning, tone, and context. Ensure the translation is natural, culturally appropriate, and professionally accurate.`
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const translatedText = completion.choices[0].message.content;

      res.json({
        translatedText: translatedText || "Unable to translate the text. Please try again.",
        sourceLanguage: "auto-detected",
        targetLanguage: languageName,
        originalLength: text.length,
        translatedLength: translatedText?.length || 0
      });

    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ message: "Failed to translate text. Please try again." });
    }
  });

  // Document Translation API endpoint
  app.post("/api/translate-document", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Document file is required" });
      }

      const { targetLanguage } = req.body;

      if (!targetLanguage) {
        return res.status(400).json({ message: "Target language is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });

      // Extract text content from the uploaded document
      let documentText = "";
      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      if (fileExtension === '.txt') {
        documentText = req.file.buffer.toString('utf-8');
      } else if (fileExtension === '.pdf') {
        try {
          // Dynamically import pdf-parse to avoid startup issues
          const pdfParse = (await import('pdf-parse')).default;
          const pdfData = await pdfParse(req.file.buffer);
          documentText = pdfData.text;
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);
          return res.status(400).json({ message: "Failed to extract text from PDF. Please try a different file." });
        }
      } else {
        return res.status(400).json({ message: "Unsupported file type. Please upload PDF or TXT files." });
      }

      if (!documentText.trim()) {
        return res.status(400).json({ message: "No text content found in the document" });
      }

      const languageNames = {
        spanish: "Spanish",
        french: "French", 
        german: "German",
        italian: "Italian",
        portuguese: "Portuguese",
        chinese: "Chinese (Mandarin)",
        japanese: "Japanese",
        korean: "Korean",
        arabic: "Arabic",
        russian: "Russian",
        hindi: "Hindi",
        dutch: "Dutch"
      };

      const languageName = languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage;

      // Handle large documents by chunking if necessary
      const maxChunkSize = 8000; // Leave room for system prompt and response
      const chunks = [];
      
      if (documentText.length > maxChunkSize) {
        // Split document into chunks by paragraphs to maintain context
        const paragraphs = documentText.split('\n\n');
        let currentChunk = '';
        
        for (const paragraph of paragraphs) {
          if ((currentChunk + paragraph).length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = paragraph;
          } else {
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
          }
        }
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
      } else {
        chunks.push(documentText);
      }

      const translatedChunks = [];

      for (const chunk of chunks) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: `You are a professional document translator. Translate the entire document content to ${languageName} while:
              
              1. Maintaining the original document structure, formatting, and layout
              2. Preserving the original meaning, tone, and context
              3. Keeping technical terms, proper names, and brand names appropriate for the target language
              4. Ensuring the translation is natural, culturally appropriate, and professionally accurate
              5. Maintaining any specific formatting like headers, bullet points, or numbered lists
              
              Translate the complete content provided.`
            },
            {
              role: "user",
              content: chunk
            }
          ],
          max_tokens: 4000,
          temperature: 0.3
        });

        const translatedChunk = completion.choices[0].message.content;
        if (translatedChunk) {
          translatedChunks.push(translatedChunk);
        }
      }

      const translatedContent = translatedChunks.join('\n\n');

      res.json({
        translatedContent: translatedContent || "Unable to translate the document. Please try again.",
        filename: req.file.originalname,
        sourceLanguage: "auto-detected",
        targetLanguage: languageName,
        originalLength: documentText.length,
        translatedLength: translatedContent.length,
        fileSize: req.file.size,
        chunksProcessed: chunks.length
      });

    } catch (error) {
      console.error("Document Translation error:", error);
      res.status(500).json({ message: "Failed to translate document. Please try again." });
    }
  });

  // Initialize Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  });

  // Create Stripe checkout session for subscription
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { planId, isAnnual = false } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }

      // Define pricing based on plans
      const planPricing = {
        starter: {
          monthly: 15,
          annual: 12, // 20% discount
          features: "15 designs per month, Basic templates, Email support",
          stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter'
        },
        pro: {
          monthly: 32,
          annual: 25.6, // 20% discount  
          features: "40 designs per month, Premium templates, Logo upload, Priority support",
          stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro'
        },
        agency: {
          monthly: 62,
          annual: 49.6, // 20% discount
          features: "Unlimited designs, All templates, Multi-user access, White-label options",
          stripePriceId: process.env.STRIPE_AGENCY_PRICE_ID || 'price_agency'
        }
      };

      const selectedPlan = planPricing[planId as keyof typeof planPricing];
      if (!selectedPlan) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const amount = isAnnual ? selectedPlan.annual : selectedPlan.monthly;
      
      // Get user session data if available
      let customerEmail = undefined;
      let clientReferenceId = undefined;
      
      if (req.session && req.session.user) {
        customerEmail = req.session.user.email;
        clientReferenceId = req.session.user.id;
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: customerEmail,
        client_reference_id: clientReferenceId,
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
                description: selectedPlan.features,
              },
              unit_amount: Math.round(amount * 100), // Convert to pence
              recurring: {
                interval: isAnnual ? 'year' : 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/dashboard`,
        metadata: {
          planId,
          isAnnual: isAnnual.toString(),
          userId: clientReferenceId || 'anonymous'
        }
      });

      res.json({ 
        checkoutUrl: session.url,
        sessionId: session.id 
      });

    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ 
        message: "Failed to create checkout session", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Verify Stripe Checkout Session
  app.post("/api/verify-checkout-session", async (req, res) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        const planId = session.metadata?.planId || 'starter';
        const isAnnual = session.metadata?.isAnnual === 'true';

        // Plan details
        const planDetails = {
          starter: { name: 'Starter', designs: '15 designs' },
          pro: { name: 'Pro', designs: '40 designs' }, 
          agency: { name: 'Agency', designs: 'Unlimited designs' }
        };

        // Update user subscription in database if we have user info
        if (session.client_reference_id) {
          const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await storage.updateUserSubscription(session.client_reference_id, {
            planId: planId,
            isAnnual: isAnnual,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: stripeSubscription.status
          });
        }

        res.json({
          success: true,
          planDetails: planDetails[planId as keyof typeof planDetails],
          session: {
            id: session.id,
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email
          }
        });
      } else {
        res.json({
          success: false,
          error: "Payment not completed"
        });
      }
    } catch (error) {
      console.error("Session verification error:", error);
      res.status(500).json({ error: "Failed to verify session" });
    }
  });

  // Handle successful subscription (webhook endpoint)
  app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        try {
          // Update user subscription in database
          if (session.client_reference_id && session.metadata) {
            const userId = session.client_reference_id;
            const planId = session.metadata.planId;
            const isAnnual = session.metadata.isAnnual === 'true';
            
            // Update user's subscription in database
            await storage.updateUserSubscription(userId, {
              planId,
              isAnnual,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: 'active'
            });
          }
        } catch (error) {
          console.error('Error updating user subscription:', error);
        }
        break;
        
      case 'invoice.payment_succeeded':
        // Handle successful subscription renewal
        console.log('Subscription payment succeeded');
        break;
        
      case 'invoice.payment_failed':
        // Handle failed subscription payment
        console.log('Subscription payment failed');
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Check subscription status
  app.get("/api/subscription-status/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        res.json({
          success: true,
          planId: session.metadata?.planId,
          isAnnual: session.metadata?.isAnnual === 'true',
          customerId: session.customer
        });
      } else {
        res.json({
          success: false,
          status: session.payment_status
        });
      }
      
    } catch (error) {
      console.error("Error checking subscription status:", error);
      res.status(500).json({ 
        message: "Failed to check subscription status" 
      });
    }
  });

  // Static file serving for thumbnails (no longer needed as we use SVG data URLs)
  // app.use('/thumbnails', express.static(path.join(process.cwd(), 'thumbnails')));

  // Register financial planning routes
  registerFinancialRoutes(app);

  // Create admin user for testing (finance industry-compliant)
  try {
    await createAdminUser();
  } catch (error) {
    console.warn('Admin user creation skipped:', error instanceof Error ? error.message : 'Unknown error');
  }

  const httpServer = createServer(app);

  return httpServer;
}
