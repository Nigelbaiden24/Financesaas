import { db } from "./db";
import { subscriptionPlans, templates } from "@shared/schema";
import { seedFinancialData } from "./seed-financial";

async function seedDatabase() {
  console.log("Seeding database...");

  // First seed comprehensive financial planning data
  console.log("🏦 Seeding comprehensive financial planning data...");
  try {
    await seedFinancialData();
    console.log("✅ Financial data seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding financial data:", error);
    // Continue with other seeding if financial data fails
  }

  // Seed subscription plans
  const plans = [
    {
      name: "Freemium",
      slug: "freemium",
      price: "0.00",
      currency: "GBP",
      monthlyDesignLimit: 1,
      features: [
        "1 AI-generated design per month",
        "Basic templates",
        "PDF download",
        "Admin approval required",
        "Community support"
      ],
      isActive: true,
      sortOrder: 0,
    },
    {
      name: "Starter",
      slug: "starter",
      price: "32.00",
      currency: "GBP",
      monthlyDesignLimit: 40,
      features: [
        "40 AI-generated designs per month",
        "Access to all generators",
        "Professional templates",
        "Basic support",
        "Export to PDF/PNG",
        "Basic AI prompt suggestions",
        "Document history (30 days)"
      ],
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Pro",
      slug: "pro",
      price: "62.00",
      currency: "GBP",
      monthlyDesignLimit: -1, // Unlimited
      features: [
        "Unlimited AI-generated designs",
        "Access to all generators",
        "Premium templates & sectors",
        "Priority support",
        "Export to multiple formats",
        "Advanced AI prompt suggestions",
        "AI document rewrite & translation",
        "Document review & analysis",
        "Premium logo upload",
        "Brand consistency tools",
        "Document history (90 days)",
        "Usage analytics dashboard"
      ],
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Agency",
      slug: "agency",
      price: "120.00",
      currency: "GBP",
      monthlyDesignLimit: -1, // Unlimited
      features: [
        "Unlimited AI-generated designs",
        "Access to all generators",
        "Premium templates & sectors",
        "24/7 priority support",
        "Export to all formats",
        "Intelligent AI prompt suggestions",
        "Advanced AI document rewrite",
        "Multi-language translation (50+ languages)",
        "Comprehensive document review",
        "Advanced brand consistency tools",
        "Team collaboration & sharing",
        "Unlimited document history",
        "Advanced usage analytics",
        "Custom integrations",
        "White-label options"
      ],
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    await db.insert(subscriptionPlans)
      .values(plan)
      .onConflictDoNothing();
  }

  // Seed templates
  const templateData = [
    {
      name: "Modern Pitch Deck",
      description: "Professional pitch deck template perfect for startups and business presentations",
      category: "pitch-deck",
      sector: "general",
      previewImageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        slides: [
          { type: "title", title: "{{company_name}}", subtitle: "{{tagline}}" },
          { type: "problem", title: "Problem", content: "{{problem_description}}" },
          { type: "solution", title: "Solution", content: "{{solution_description}}" },
          { type: "market", title: "Market Size", content: "{{market_analysis}}" },
          { type: "business_model", title: "Business Model", content: "{{revenue_streams}}" },
          { type: "competition", title: "Competition", content: "{{competitive_analysis}}" },
          { type: "financials", title: "Financials", content: "{{financial_projections}}" },
          { type: "team", title: "Team", content: "{{team_bios}}" },
          { type: "funding", title: "Funding Ask", content: "{{funding_requirements}}" },
          { type: "contact", title: "Contact", content: "{{contact_information}}" }
        ]
      },
      aiPromptTemplate: "Create a professional pitch deck for {{company_name}} in the {{sector}} sector. Include compelling content for: problem statement, solution overview, market analysis, business model, competitive landscape, financial projections, team introduction, and funding requirements.",
      isPublic: true,
      isPremium: false,
      tags: ["pitch", "presentation", "startup", "business"]
    },
    {
      name: "Executive Resume",
      description: "Professional executive resume template with modern design",
      category: "resume",
      sector: "general",
      previewImageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        sections: [
          { type: "header", fields: ["name", "title", "contact"] },
          { type: "summary", title: "Professional Summary", content: "{{professional_summary}}" },
          { type: "experience", title: "Professional Experience", content: "{{work_history}}" },
          { type: "education", title: "Education", content: "{{educational_background}}" },
          { type: "skills", title: "Core Competencies", content: "{{key_skills}}" },
          { type: "achievements", title: "Key Achievements", content: "{{notable_accomplishments}}" }
        ]
      },
      aiPromptTemplate: "Create a professional executive resume for someone in {{sector}} with {{years_experience}} years of experience. Focus on leadership achievements, strategic initiatives, and measurable business impact.",
      isPublic: true,
      isPremium: false,
      tags: ["resume", "cv", "executive", "professional"]
    },
    {
      name: "Marketing Brochure",
      description: "Eye-catching marketing brochure template for products and services",
      category: "brochure",
      sector: "marketing",
      previewImageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        panels: [
          { type: "cover", title: "{{product_name}}", subtitle: "{{value_proposition}}" },
          { type: "features", title: "Key Features", content: "{{feature_list}}" },
          { type: "benefits", title: "Benefits", content: "{{benefit_statements}}" },
          { type: "testimonials", title: "What Our Customers Say", content: "{{customer_testimonials}}" },
          { type: "pricing", title: "Pricing Options", content: "{{pricing_tiers}}" },
          { type: "contact", title: "Get Started Today", content: "{{call_to_action}}" }
        ]
      },
      aiPromptTemplate: "Create compelling marketing copy for a {{product_type}} brochure targeting {{target_audience}}. Include persuasive headlines, feature descriptions, benefits, social proof, and strong calls-to-action.",
      isPublic: true,
      isPremium: true,
      tags: ["marketing", "brochure", "sales", "product"]
    },
    {
      name: "Financial Report",
      description: "Comprehensive financial report template with charts and analysis",
      category: "report",
      sector: "finance",
      previewImageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        sections: [
          { type: "executive_summary", title: "Executive Summary", content: "{{summary_overview}}" },
          { type: "financial_highlights", title: "Financial Highlights", content: "{{key_metrics}}" },
          { type: "revenue_analysis", title: "Revenue Analysis", content: "{{revenue_breakdown}}" },
          { type: "expense_analysis", title: "Expense Analysis", content: "{{cost_structure}}" },
          { type: "profitability", title: "Profitability Analysis", content: "{{profit_margins}}" },
          { type: "cash_flow", title: "Cash Flow Statement", content: "{{cash_flow_analysis}}" },
          { type: "balance_sheet", title: "Balance Sheet", content: "{{assets_liabilities}}" },
          { type: "recommendations", title: "Recommendations", content: "{{strategic_recommendations}}" }
        ]
      },
      aiPromptTemplate: "Generate a comprehensive financial report for {{company_name}} covering Q{{quarter}} {{year}}. Include executive summary, key financial metrics, revenue/expense analysis, profitability insights, and strategic recommendations.",
      isPublic: true,
      isPremium: true,
      tags: ["finance", "report", "analysis", "business"]
    },
    {
      name: "Tech Product Launch",
      description: "Product launch presentation template optimized for technology companies",
      category: "pitch-deck",
      sector: "technology",
      previewImageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        slides: [
          { type: "title", title: "{{product_name}}", subtitle: "{{launch_tagline}}" },
          { type: "vision", title: "Our Vision", content: "{{product_vision}}" },
          { type: "problem", title: "Market Problem", content: "{{technical_challenges}}" },
          { type: "solution", title: "Technical Solution", content: "{{technology_overview}}" },
          { type: "architecture", title: "System Architecture", content: "{{technical_architecture}}" },
          { type: "features", title: "Key Features", content: "{{product_features}}" },
          { type: "roadmap", title: "Product Roadmap", content: "{{development_timeline}}" },
          { type: "market", title: "Target Market", content: "{{market_opportunity}}" },
          { type: "go_to_market", title: "Go-to-Market Strategy", content: "{{launch_strategy}}" },
          { type: "next_steps", title: "Next Steps", content: "{{action_items}}" }
        ]
      },
      aiPromptTemplate: "Create a compelling product launch presentation for {{product_name}}, a {{product_category}} targeting {{target_market}}. Focus on technical innovation, market opportunity, competitive advantages, and go-to-market strategy.",
      isPublic: true,
      isPremium: true,
      tags: ["technology", "product-launch", "presentation", "innovation"]
    },
    {
      name: "Professional Invoice",
      description: "Clean, professional invoice template for businesses",
      category: "invoice",
      sector: "general",
      previewImageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        sections: [
          { type: "header", fields: ["company_name", "logo", "contact_info"] },
          { type: "billing", fields: ["bill_to", "ship_to", "invoice_number", "date"] },
          { type: "items", fields: ["line_items", "quantities", "rates", "amounts"] },
          { type: "totals", fields: ["subtotal", "tax", "total"] },
          { type: "payment", fields: ["payment_terms", "payment_methods"] }
        ]
      },
      aiPromptTemplate: "Create a professional invoice for {{service_description}} from {{company_name}} to {{client_name}}. Include itemized services, professional formatting, and clear payment terms.",
      isPublic: true,
      isPremium: false,
      tags: ["invoice", "billing", "business", "finance"]
    },
    {
      name: "Business Plan Template",
      description: "Comprehensive business plan template for startups and established businesses",
      category: "business-plan",
      sector: "general",
      previewImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        sections: [
          { type: "executive_summary", title: "Executive Summary", content: "{{business_overview}}" },
          { type: "company_description", title: "Company Description", content: "{{company_details}}" },
          { type: "market_analysis", title: "Market Analysis", content: "{{market_research}}" },
          { type: "organization", title: "Organization & Management", content: "{{team_structure}}" },
          { type: "services", title: "Service/Product Line", content: "{{offerings}}" },
          { type: "marketing", title: "Marketing & Sales", content: "{{marketing_strategy}}" },
          { type: "funding", title: "Funding Request", content: "{{financial_requirements}}" },
          { type: "projections", title: "Financial Projections", content: "{{financial_forecasts}}" }
        ]
      },
      aiPromptTemplate: "Create a comprehensive business plan for {{business_name}} in the {{industry}} sector. Include market analysis, competitive landscape, financial projections, and growth strategy.",
      isPublic: true,
      isPremium: true,
      tags: ["business-plan", "strategy", "planning", "startup"]
    },
    {
      name: "Digital Ebook",
      description: "Professional ebook template for digital publishing",
      category: "ebook",
      sector: "general",
      previewImageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        chapters: [
          { type: "title_page", title: "{{book_title}}", subtitle: "{{author_name}}" },
          { type: "table_of_contents", title: "Table of Contents", content: "{{chapter_list}}" },
          { type: "introduction", title: "Introduction", content: "{{introduction_text}}" },
          { type: "chapters", title: "Main Content", content: "{{chapter_content}}" },
          { type: "conclusion", title: "Conclusion", content: "{{conclusion_text}}" },
          { type: "about_author", title: "About the Author", content: "{{author_bio}}" }
        ]
      },
      aiPromptTemplate: "Create an engaging ebook about {{topic}} targeting {{target_audience}}. Include structured chapters, actionable insights, and compelling narrative flow.",
      isPublic: true,
      isPremium: true,
      tags: ["ebook", "publishing", "content", "digital"]
    },
    {
      name: "Email Newsletter",
      description: "Engaging email newsletter template for marketing campaigns",
      category: "newsletter",
      sector: "marketing",
      previewImageUrl: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        sections: [
          { type: "header", fields: ["logo", "newsletter_name", "issue_date"] },
          { type: "hero", fields: ["main_headline", "featured_story"] },
          { type: "articles", fields: ["article_summaries", "read_more_links"] },
          { type: "featured", fields: ["featured_content", "call_to_action"] },
          { type: "social", fields: ["social_links", "share_buttons"] },
          { type: "footer", fields: ["unsubscribe", "contact_info"] }
        ]
      },
      aiPromptTemplate: "Create an engaging newsletter about {{topic}} for {{audience}}. Include compelling headlines, valuable content summaries, and strong calls-to-action.",
      isPublic: true,
      isPremium: false,
      tags: ["newsletter", "email", "marketing", "communication"]
    },
    {
      name: "Data Visualization Chart",
      description: "Professional chart and graph template for data presentation",
      category: "chart",
      sector: "general",
      previewImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        elements: [
          { type: "title", fields: ["chart_title", "subtitle"] },
          { type: "data", fields: ["datasets", "labels", "values"] },
          { type: "legend", fields: ["legend_items", "color_coding"] },
          { type: "annotations", fields: ["key_insights", "trend_notes"] },
          { type: "source", fields: ["data_source", "methodology"] }
        ]
      },
      aiPromptTemplate: "Create compelling data visualizations for {{data_topic}} showing {{key_metrics}}. Include clear labels, insights, and professional formatting.",
      isPublic: true,
      isPremium: false,
      tags: ["chart", "data", "visualization", "analytics"]
    }
  ];

  for (const template of templateData) {
    await db.insert(templates)
      .values(template)
      .onConflictDoNothing();
  }

  console.log("Database seeded successfully!");
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding database:", error);
      process.exit(1);
    });
}

export { seedDatabase };