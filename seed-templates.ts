import { db } from "./db";
import { templates } from "../shared/schema";

const templateData = [
  // Invoice Templates
  {
    name: "Minimalist Professional Invoice",
    category: "invoice",
    description: "Clean white and blue minimalist invoice template with professional layout",
    sector: "general",
    templateData: {
      company: {
        name: "RIMBERIO",
        address: "123 Anywhere St., Any City",
        phone: "123-456-7890",
        website: "www.reallygreatsite.com",
        email: "hello@reallygreatsite.com"
      },
      invoice: {
        title: "INVOICE",
        dateLabel: "Date:",
        invoiceNumberLabel: "No. Invoice:",
        paymentMethodLabel: "Payment Method:",
        bankName: "BORCELLE BANK",
        accountNumber: "123-456-7890"
      },
      billing: {
        billToLabel: "Bill To:",
        defaultAddress: "123 Anywhere St., Any City"
      },
      itemTable: {
        headers: ["DATE", "ITEM DESCRIPTION", "PRICE", "QTY", "TOTAL"],
        totalLabel: "TOTAL"
      },
      footer: {
        thankYou: "THANK YOU",
        contact: {
          phone: "123-456-7890",
          website: "www.reallygreatsite.com",
          address: "123 Anywhere St., Any City"
        }
      }
    }
  },

  // Pitch Deck Templates
  {
    name: "Modern Technology Pitch Deck",
    category: "pitch-deck",
    description: "Professional white and violet technology pitch deck with comprehensive business presentation structure",
    sector: "technology",
    templateData: {
      cover: {
        companyName: "Warner & Spencer",
        title: "Technology Pitch Deck",
        presenter: "Aaron Loeb"
      },
      sections: [
        {
          title: "Introduction",
          content: "Company overview and introduction to the technology solutions we provide"
        },
        {
          title: "About Us",
          content: "Company history and evolution from 2010-2030"
        },
        {
          title: "Problems",
          problems: [
            "Problem 1: Market challenge identification",
            "Problem 2: Technology gap analysis", 
            "Problem 3: Customer pain point resolution"
          ]
        },
        {
          title: "Objectives",
          objectives: ["Objective 1", "Objective 2", "Objective 3"]
        },
        {
          title: "Our Services",
          services: [
            {
              name: "Software",
              description: "Custom software development solutions"
            },
            {
              name: "IT Consulting", 
              description: "Technology strategy and implementation"
            },
            {
              name: "Marketing",
              description: "Digital marketing and brand strategy"
            },
            {
              name: "Data Analytics",
              description: "Business intelligence and data insights"
            }
          ]
        },
        {
          title: "Marketing Strategy",
          steps: [
            "Market analysis and positioning",
            "Customer acquisition strategy",
            "Brand development and messaging",
            "Digital marketing implementation"
          ]
        },
        {
          title: "Target Market",
          market: {
            TAM: "$105M",
            SAM: "$56M", 
            SOM: "$12M",
            breakdown: "10% early adopters, 20% growth market, 70% mainstream"
          }
        },
        {
          title: "Our Team",
          team: [
            {
              name: "Olivia Wilson",
              role: "CEO & Founder"
            },
            {
              name: "Aaron Loeb",
              role: "Project Manager"
            },
            {
              name: "Juliana Silva",
              role: "IT Expert"
            }
          ]
        }
      ],
      contact: {
        name: "Aaron Loeb",
        role: "Project Manager",
        phone: "+123-456-7890",
        email: "hello@reallygreatsite.com",
        website: "www.reallygreatsite.com"
      }
    }
  },

  {
    name: "Business Marketing Pitch Deck",
    category: "pitch-deck", 
    description: "Green and white professional business pitch deck for marketing agencies",
    sector: "marketing",
    templateData: {
      cover: {
        companyName: "Thynk Unlimited",
        title: "PITCH DECK - BUSINESS PRESENTATION",
        contact: {
          phone: "+123-456-7890",
          address: "123 Anywhere St., Any City, ST 12345",
          website: "www.reallygreatsite.com"
        }
      },
      tableOfContents: [
        "Hello Friends!",
        "About Us", 
        "What We Believe",
        "Problems & Solutions",
        "Market Size",
        "Statistics"
      ],
      sections: [
        {
          title: "About Us",
          content: "At Thynk Unlimited, we believe in the transformative power of compelling storytelling, data-driven strategies, and cutting-edge creativity. Our mission is to empower businesses with strategic marketing solutions."
        },
        {
          title: "Vision & Mission",
          vision: "To be the catalyst for transformative marketing solutions that redefine industry standards",
          mission: "To deliver strategic and impactful marketing solutions that propel businesses to new heights of success"
        },
        {
          title: "Problems & Solutions",
          problems: [
            {
              problem: "Lack of Brand Visibility",
              solution: "Comprehensive brand analysis and strategic branding development"
            },
            {
              problem: "Ineffective Digital Presence", 
              solution: "Integrated digital marketing approach with SEO, social media, and content marketing"
            },
            {
              problem: "Lack of Targeted Lead Generation",
              solution: "Strategic content and personalized engagement tactics for quality lead conversion"
            }
          ]
        },
        {
          title: "Our Services",
          services: [
            "Strategic Brand Development",
            "Data-Driven Marketing",
            "Creative Content Production"
          ]
        },
        {
          title: "Market Size",
          description: "Global perspective serving multinational clients with tailored strategies",
          markets: {
            TAM: "Total Available Market",
            SAM: "Serviceable Available Market", 
            SOM: "Serviceable Obtainable Market"
          }
        }
      ]
    }
  },

  // Annual Report Templates
  {
    name: "Corporate Annual Report",
    category: "report",
    description: "Professional blue corporate annual report template",
    sector: "general",
    templateData: {
      cover: {
        companyName: "Salford & Co.",
        title: "ANNUAL REPORT",
        year: "2025",
        preparedBy: "OLIVIA WILSON",
        presentedTo: "ALFREDO TORRES",
        contact: {
          phone: "123-456-7890",
          social: "@reallygreatsite",
          website: "www.reallygreatsite.com"
        }
      }
    }
  },

  {
    name: "International Business Annual Report",
    category: "report",
    description: "Simple white annual report for international business operations",
    sector: "general",
    templateData: {
      cover: {
        year: "2022",
        title: "ANNUAL REPORT",
        companyName: "Ginyard International Co.",
        website: "www.reallygreatsite.com",
        email: "hello@reallygreatsite.com"
      },
      sections: [
        {
          title: "Global Review",
          content: "Analysis of market needs and company positioning in the global marketplace"
        },
        {
          title: "2022 Annual Report",
          content: "Financial performance with over five billion in revenue and 30% net profit"
        },
        {
          title: "The Advertising",
          content: "Digital marketing strategy and global product promotion initiatives"
        }
      ]
    }
  },

  // Company Profile Template
  {
    name: "Technology Company Profile",
    category: "brochure",
    description: "Comprehensive modern technology company profile with detailed business information",
    sector: "technology",
    templateData: {
      cover: {
        title: "COMPANY PROFILE",
        year: "2038",
        subtitle: "Digital transformation solutions and technology services",
        date: "February 15, 2038",
        website: "www.reallygreatsite.com"
      },
      sections: [
        {
          title: "About Our Company",
          content: "Ingoude Company's creative technology products and services help facilitate digital transformation with industry-specific solutions and IT services."
        },
        {
          title: "Vision",
          content: "Future projection and company goals with detailed perspective explanation"
        },
        {
          title: "Mission", 
          points: [
            "Define how the vision can be achieved",
            "Detailed explanation of goals and objectives",
            "Problem identification and solution framework",
            "Strategic objective implementation"
          ]
        },
        {
          title: "Major Factors",
          factors: [
            {
              name: "Infrastructure",
              description: "Cloud services, servers, software tools, and development frameworks"
            },
            {
              name: "Talent",
              description: "Attracting and retaining top engineering and design talent"
            },
            {
              name: "Operational Methods",
              description: "Standard Operating Procedures for quality assurance"
            },
            {
              name: "Resource Allocation",
              description: "Strategic budget decisions for R&D and operations"
            }
          ]
        },
        {
          title: "Problem & Solution",
          problem: "Well-defined problem identification as foundation for product development",
          solution: "Market-driven implementation with innovation and creativity"
        },
        {
          title: "SWOT Analysis",
          strengths: ["Best Prices", "Innovative Mindset", "Strong Brand Image", "Quality After Sales"],
          weaknesses: ["Long Term Investment", "High Insurance Costs", "Price Competition"],
          opportunities: ["New Market Target", "5G Implementation", "Capital Investment"],
          threats: ["Employee Turnover", "New Competitors", "Climate Change Impact"]
        },
        {
          title: "Product Overview",
          products: [
            {
              name: "Internet of Things",
              description: "Comprehensive IoT solutions for community and market needs"
            },
            {
              name: "Artificial Intelligence", 
              description: "AI products for solving community and market problems"
            }
          ]
        },
        {
          title: "Market Size",
          TAM: "$1.6 Billion",
          SAM: "$126 Million", 
          SOM: "$181 Million"
        },
        {
          title: "Target Market",
          segments: [
            {
              name: "Oil & Mining Company",
              percentage: "65%",
              description: "Market targeting for industry-specific solutions"
            },
            {
              name: "Construction Company",
              description: "Infrastructure and development sector targeting"
            }
          ]
        }
      ]
    }
  },

  // CV/Resume Template
  {
    name: "Sales Representative Resume",
    category: "resume",
    description: "Professional white simple sales representative CV template",
    sector: "marketing",
    templateData: {
      personal: {
        name: "DONNA STROUPE",
        title: "Sales Representative",
        contact: {
          phone: "+123-456-7890",
          email: "hello@reallygreatsite.com",
          address: "123 Anywhere St., Any City, ST 12345"
        }
      },
      aboutMe: "Sales Representative professional who initializes and manages relationships with customers, serving as point of contact from initial outreach through final purchase.",
      education: [
        {
          degree: "BA Sales and Commerce",
          institution: "Wardiere University",
          years: "2011 - 2015"
        }
      ],
      skills: [
        "Fast-moving Consumer Goods",
        "Packaged Consumer Goods", 
        "Sales",
        "Corporate sales account management",
        "Experience in retail"
      ],
      languages: ["English", "French"],
      workExperience: [
        {
          position: "Consumer Goods Seller",
          company: "Timmerman Industries",
          period: "Aug 2018 - present",
          responsibilities: [
            "Offer consumer goods packages to corporate and clients",
            "Meet with clients quarterly to update services",
            "Train junior sales agents"
          ]
        },
        {
          position: "FMCG Sales Agent",
          company: "Timmerman Industries", 
          period: "Jul 2015 - Aug 2018",
          responsibilities: [
            "Visited corporate client offices for product offerings",
            "Built client relationships to maintain sales goals"
          ]
        },
        {
          position: "Sales Agent",
          company: "Timmerman Industries",
          period: "Aug 2014 - Jul 2015", 
          responsibilities: [
            "Visited corporate offices to offer latest products"
          ]
        }
      ],
      references: [
        {
          name: "Estelle Darcy",
          company: "Wardiere Inc.",
          role: "CEO",
          phone: "+123-456-7890",
          email: "hello@reallygreatsite.com"
        },
        {
          name: "Harper Russo", 
          company: "Wardiere Inc.",
          role: "CEO",
          phone: "+123-456-7890",
          email: "hello@reallygreatsite.com"
        }
      ]
    }
  },

  // Black Minimalist Financial Report Template (HTML/JSON Format)
  {
    name: "Black Minimalist Financial Report",
    category: "report",
    description: "Professional black minimalist financial report template with modern HTML/JSON structure for comprehensive business reporting",
    sector: "financial",
    htmlTemplate: "black-minimalist-financial-report.html",
    templateData: {
      companyName: "GlobalCorporation",
      reportTitle: "Annual Financial Report",
      year: "2025",
      executiveSummary: "GlobalCorporation demonstrated robust performance across all business units with significant growth in key markets. This comprehensive report provides detailed analysis of financial performance, strategic initiatives, and future outlook.",
      financialPerformance: "Strong revenue growth of 15% year-over-year with improved operational efficiency and market expansion across key regions. Net profit margins increased to 18% demonstrating effective cost management and strategic positioning.",
      revenueCurrent: "$2.1B",
      revenuePrevious: "$1.8B",
      revenueChange: "+15.2%",
      profitCurrent: "$385M",
      profitPrevious: "$310M",
      profitChange: "+24.1%",
      assetsCurrent: "$4.2B",
      assetsPrevious: "$3.9B",
      assetsChange: "+7.8%",
      keyAchievements: "Successfully launched new product lines, expanded into three new markets, achieved industry-leading customer satisfaction scores, and completed strategic acquisitions that strengthen our market position.",
      marketAnalysis: "Market conditions remain favorable with continued digital transformation trends driving demand for our services. Competitive landscape analysis shows strong positioning in core markets with opportunities for expansion.",
      riskAssessment: "Key risks include regulatory changes, cybersecurity threats, and market volatility. Comprehensive risk management framework implemented with regular monitoring and mitigation strategies.",
      futureOutlook: "Optimistic growth trajectory expected with planned investments in R&D, strategic partnerships, and market expansion initiatives. Targeting 20% revenue growth in the next fiscal year.",
      contactEmail: "investors@globalcorporation.com",
      contactPhone: "+1-800-555-0199",
      contactAddress: "123 Corporate Avenue, Business District, NY"
    }
  }
];

async function seedTemplates() {
  try {
    console.log("🌱 Starting template seeding...");
    
    // Clear existing templates (optional)
    // await db.delete(templates);
    
    // Insert new templates
    for (const template of templateData) {
      await db.insert(templates).values({
        name: template.name,
        category: template.category,
        description: template.description,
        sector: template.sector,
        templateData: JSON.stringify(template.templateData),
        htmlTemplate: template.htmlTemplate || null, // Add HTML template path if provided
        previewImageUrl: `/api/placeholder-image/${template.category}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Added template: ${template.name}`);
    }
    
    console.log(`🎉 Successfully seeded ${templateData.length} templates!`);
    
    // Verify templates were added
    const count = await db.select().from(templates);
    console.log(`📊 Total templates in database: ${count.length}`);
    
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    throw error;
  }
}

// Run the seed function
seedTemplates()
  .then(() => {
    console.log("✨ Template seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Template seeding failed:", error);
    process.exit(1);
  });