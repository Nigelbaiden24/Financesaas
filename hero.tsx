import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Wand2, Presentation, FileCheck, Image, Receipt, FileSpreadsheet, Mail, BarChart, FileText, Lightbulb, Upload, X, Zap, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import DocumentPreview from "@/components/document-preview";

export default function Hero() {
  const [prompt, setPrompt] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isExpanding, setIsExpanding] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch templates based on selected service
  const { data: templates = [] } = useQuery({
    queryKey: [`/api/templates/by-service/${selectedService}`],
    enabled: !!selectedService,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update available templates when data changes
  useEffect(() => {
    if (templates && Array.isArray(templates)) {
      setAvailableTemplates(templates);
    } else {
      setAvailableTemplates([]);
    }
    // Reset template selection when service changes - require manual selection
    setSelectedTemplate("");
  }, [templates, selectedService]);

  const aiServices = [
    { 
      id: "pitch-deck", 
      name: "Pitch Deck Generator", 
      icon: Presentation,
      thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=120&h=80&fit=crop&crop=center",
      description: "Professional investor presentations"
    },
    { 
      id: "resume-builder", 
      name: "CV Builder", 
      icon: FileCheck,
      thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&w=120&h=80&fit=crop&crop=center",
      description: "Professional CVs and resumes"
    },
    { 
      id: "brochure-designer", 
      name: "Brochure Designer", 
      icon: Image,
      thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&w=120&h=80&fit=crop&crop=center",
      description: "Marketing brochures and flyers"
    },
    { 
      id: "report-generator", 
      name: "Report Generator", 
      icon: FileSpreadsheet,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=120&h=80&fit=crop&crop=center",
      description: "Business reports and analytics"
    },
    { 
      id: "invoice-creator", 
      name: "Invoice Creator", 
      icon: Receipt,
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&w=120&h=80&fit=crop&crop=center",
      description: "Professional invoices and bills"
    },

    { 
      id: "newsletter-designer", 
      name: "Newsletter Designer", 
      icon: Mail,
      thumbnail: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&w=120&h=80&fit=crop&crop=center",
      description: "Email newsletters and campaigns"
    },

  ];

  // Get user from auth hook
  const { user } = useAuth();

  // Get user tier based on subscription
  const getUserTier = () => {
    if (!user || typeof user !== 'object' || !('currentPlan' in user) || !user.currentPlan) return "none";
    return (user.currentPlan as string).toLowerCase();
  };

  // Logo upload handler
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, or SVG).",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedLogo(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    toast({
      title: "Logo Uploaded",
      description: "Your company logo will be included in the generated document.",
    });
  };

  // Remove logo handler
  const handleRemoveLogo = () => {
    setUploadedLogo(null);
    setLogoPreview("");
    // Reset file input
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Check if user can upload logo (Pro or Agency only)
  const canUploadLogo = () => {
    const tier = getUserTier();
    return tier === "pro" || tier === "agency";
  };

  // Check if user is approved by admin (access the correct property)
  const isUserApproved = () => {
    return user && typeof user === 'object' && 'isApproved' in user && user.isApproved === true;
  };

  // Check if user has any valid subscription (freemium, starter, pro, or agency)  
  const hasValidSubscription = () => {
    const tier = getUserTier();
    return tier === "freemium" || tier === "starter" || tier === "pro" || tier === "agency";
  };

  // Check if user has any subscription (including freemium and starter)
  const hasAnySubscription = () => {
    const tier = getUserTier();
    return tier !== "none";
  };

  // Check if user has a paid subscription (excluding free tier)
  const hasPaidSubscription = () => {
    const tier = getUserTier();
    return tier === "starter" || tier === "pro" || tier === "agency";
  };

  // Check if user can generate documents
  const canGenerateDocuments = () => {
    if (!user) return false;
    if (!hasValidSubscription()) return false;
    if (!isUserApproved()) return false;
    return true;
  };

  // Enhanced service-based prompt suggestions organized by subscription tier
  const getServicePromptSuggestions = (serviceId: string, tier: string) => {
    const promptSuggestions: Record<string, Record<string, string[]>> = {
      "pitch-deck": {
        "none": [
          "Create a pitch deck for a tech startup seeking funding."
        ],
        "freemium": [
          "Create a pitch deck for TechFlow, an AI startup developing intelligent chatbots that help small businesses automate customer service. We're seeking $500K seed funding to expand our team of 5 engineers and scale our platform."
        ],
        "starter": [
          "Create a pitch deck for TechFlow, an AI startup developing intelligent chatbots that help small businesses automate customer service. We're seeking $500K seed funding to expand our team of 5 engineers and scale our platform that currently serves 50+ clients with 95% customer satisfaction.",
          "Design a Series A pitch deck for GreenFinance, a sustainable fintech company offering carbon offset investing. We've achieved $2M ARR with 200% YoY growth, serving 10,000+ users, and need $8M to expand internationally across Europe and Asia.",
          "Build a pitch deck for EcoStyle, a sustainable fashion e-commerce platform connecting ethical brands with conscious consumers. We've generated $1.5M revenue in 18 months, partnered with 150+ sustainable brands, and are raising $3M Series A to launch our marketplace app."
        ],
        "pro": [
          "Develop a Series A pitch deck for DataFlow Technologies with $2.5M revenue, 150% YoY growth, targeting enterprise clients in financial services. Include market analysis showing $50B addressable market, competitive advantages over Palantir and Snowflake, team credentials from Google and Goldman Sachs, and detailed financial projections for $15M funding round.",
          "Create a comprehensive investor presentation for GreenTech Solutions' $15M Series B, highlighting renewable energy partnerships with Tesla and utilities, 300% revenue growth, proprietary battery technology IP, regulatory approvals in 12 states, and expansion plans across North America with projected $100M ARR by 2026.",
          "Generate a detailed pitch deck for HealthAI's Series C round, featuring FDA breakthrough device designation, clinical trial results showing 40% improved patient outcomes, partnerships with Mayo Clinic and Johns Hopkins, $25M annual recurring revenue, and strategic roadmap for $50M funding to accelerate market penetration."
        ],
        "agency": [
          "Generate a comprehensive Series B pitch deck for CloudScale's $50M funding round, featuring detailed market analysis across 12 enterprise segments totaling $200B TAM, competitive positioning against AWS and Azure with 60% cost savings, financial projections showing path to $500M ARR, customer acquisition cost analysis, enterprise client testimonials from Fortune 100 companies, and strategic partnership roadmap with Microsoft, Oracle, and SAP.",
          "Create an advanced IPO readiness presentation for DataCorp's $200M public offering, including comprehensive market opportunity analysis across global data infrastructure, regulatory compliance strategy for SOX and GDPR, competitive moat assessment with proprietary algorithms, institutional investor targeting framework, detailed revenue breakdown by geography and vertical, and management team credentials from top-tier technology companies.",
          "Develop a strategic acquisition pitch for TechGiant's purchase of three AI startups valued at $2.5B combined, featuring detailed synergy analysis projecting $500M cost savings, 18-month integration timeline with minimal customer disruption, talent retention strategy for 500+ engineers, combined market positioning in autonomous systems, and post-acquisition revenue acceleration plan targeting 40% growth."
        ]
      },
      "resume-builder": {
        "none": [
          "Create a CV for a marketing professional with 5 years experience."
        ],
        "freemium": [
          "Create a software developer resume for Alex Chen, a full-stack developer with 3 years experience at two startups. Include expertise in React, Node.js, Python, and AWS, highlighting projects like an e-commerce platform."
        ],
        "starter": [
          "Create a software developer resume for Alex Chen, a full-stack developer with 3 years experience at two startups. Include expertise in React, Node.js, Python, and AWS, highlighting projects like an e-commerce platform serving 10k+ users and a mobile app with 50k+ downloads. Show progression from junior to mid-level developer with leadership of 2 junior developers.",
          "Build a marketing manager CV for Sarah Rodriguez transitioning from sales to marketing after 4 years in B2B software sales. Highlight campaign management experience, Google Ads and HubSpot certifications, successful lead generation increasing pipeline by 150%, and MBA in Marketing from top-tier university.",
          "Design a fresh graduate resume for Michael Thompson, recent finance major from UC Berkeley with 3.8 GPA. Include internships at JP Morgan and Goldman Sachs, CFA Level 1 candidate, financial modeling projects, student investment club leadership, and relevant coursework in derivatives and corporate finance."
        ],
        "pro": [
          "Develop a senior software architect resume for David Kim at TechCorp with 8+ years experience, specializing in microservices architecture and leading teams of 15+ developers. Include system design for platforms handling 1M+ daily active users, cost optimization saving $2M annually, technical leadership across 5 product lines, and expertise in Kubernetes, Docker, and cloud-native technologies.",
          "Create a comprehensive marketing director CV for Sarah Johnson, highlighting campaign successes that generated $5M+ revenue growth at three companies over 7 years. Include digital transformation initiatives, team leadership of 12 marketers across paid media, content, and analytics, brand repositioning that increased market share by 25%, and P&L responsibility for $15M marketing budget.",
          "Generate a detailed executive resume for finance director role showcasing 10 years of progressive experience with budget management of $50M+, cost reduction initiatives saving 20% annually, M&A transaction experience including 3 successful acquisitions totaling $100M, team leadership of 8 finance professionals, and CPA with MBA from Wharton."
        ],
        "agency": [
          "Generate a comprehensive C-level executive resume for technology transformation leader Jennifer Walsh with 15+ years experience, featuring successful digital transformations worth $100M+ at Fortune 500 companies, board advisory positions at 3 tech startups, industry recognition including keynote speaking at AWS re:Invent and Gartner conferences, P&L responsibility for $500M technology organization, and track record of scaling engineering teams from 50 to 500+ professionals.",
          "Create an advanced executive CV for global operations director Robert Chen with P&L responsibility for $500M+ revenue streams across 25 countries, international expansion leadership including market entry in Asia-Pacific generating $200M new revenue, operational excellence initiatives reducing costs by 30%, supply chain optimization, and executive education from Harvard Business School.",
          "Develop a strategic senior executive resume for venture capital partner Lisa Park highlighting 12 years in technology investing, portfolio company advisory roles across 40+ startups, successful exits totaling $2B+ in enterprise value creation including 3 IPOs and 8 acquisitions, sourcing and due diligence expertise in AI/ML and enterprise software, and Stanford MBA with engineering background."
        ]
      },
      "brochure-designer": {
        "none": [
          "Design a company brochure for a local business."
        ],
        "freemium": [
          "Create a marketing brochure for Bella Vista, an authentic Italian restaurant in downtown featuring handmade pasta, wood-fired pizzas, and imported wines. Include our 15-year family tradition and customer testimonials."
        ],
        "starter": [
          "Create a marketing brochure for Bella Vista, an authentic Italian restaurant in downtown featuring handmade pasta, wood-fired pizzas, and imported wines. Include our 15-year family tradition, chef Marco's culinary awards, private dining options for 50+ guests, catering services, and customer testimonials with 4.8-star ratings.",
          "Design a company brochure for Strategic Solutions, a management consulting firm specializing in digital transformation for mid-market companies. Highlight our 12-person team of ex-McKinsey consultants, 50+ successful client engagements, industry expertise in retail and manufacturing, and proven ROI averaging 300% for client investments.",
          "Build a product brochure for InnovateTech's new cloud-based project management software designed for remote teams. Feature our AI-powered scheduling, integration with 20+ popular tools, security certifications, pricing starting at $10/user/month, free 30-day trial, and customer success stories from 500+ companies."
        ],
        "pro": [
          "Develop a comprehensive corporate brochure for TechInnovate Solutions, highlighting enterprise software capabilities across CRM, ERP, and analytics platforms. Include client success stories with Fortune 500 companies showing 40% productivity gains, ROI achievements exceeding $10M for major implementations, 24/7 global support, ISO certifications, and strategic partnerships with Microsoft and Salesforce.",
          "Create a detailed product brochure for MedDevice Pro's breakthrough surgical equipment featuring robotic-assisted precision technology. Include clinical trial results showing 50% reduction in surgery time, FDA approval timeline and certifications, competitive advantages in precision medicine, training programs for medical professionals, and testimonials from leading hospitals including Mayo Clinic.",
          "Generate a professional services brochure for ConsultingExperts showcasing 20 years of expertise across financial services, healthcare, and technology industries. Highlight thought leadership with 50+ published articles, measurable client outcomes including $500M in cost savings, global presence in 15 countries, and senior partner credentials from top-tier consulting firms."
        ],
        "agency": [
          "Generate a complete corporate capability brochure for GlobalTech's enterprise solutions division, featuring comprehensive service portfolio across cloud migration, AI implementation, and cybersecurity. Include client case studies with quantified business impact totaling $2B in productivity gains, industry certifications from AWS, Microsoft, and Google, strategic partnership ecosystem with 100+ technology vendors, global delivery model across 30 countries, and 24/7 support infrastructure.",
          "Create an advanced product marketing brochure for InnovativeMed's breakthrough medical device revolutionizing cardiac surgery. Include detailed clinical efficacy data from 5-year studies across 20 hospitals, regulatory approval timeline spanning FDA, CE Mark, and Health Canada, market penetration strategy for $50B cardiovascular device market, competitive positioning analysis against established players, and comprehensive training and support programs for medical professionals.",
          "Develop a comprehensive company profile brochure for ManufacturingLeader's industrial automation solutions serving automotive, aerospace, and electronics industries. Showcase global manufacturing footprint across 15 countries, sustainability initiatives reducing client carbon footprint by 40%, digital transformation capabilities including IoT and predictive analytics, supply chain optimization expertise, and track record of implementing $1B+ in automation projects with 99.5% uptime guarantees."
        ]
      },
      "report-generator": {
        "none": [
          "Create a business report for a company's quarterly performance."
        ],
        "freemium": [
          "Create a quarterly business report for GrowthTech Inc. analyzing Q3 performance across sales, marketing, and operations. Include revenue analysis showing 25% growth to $2.5M and customer acquisition metrics."
        ],
        "starter": [
          "Create a quarterly business report for GrowthTech Inc. analyzing Q3 performance across sales, marketing, and operations. Include revenue analysis showing 25% growth to $2.5M, customer acquisition metrics with 40% increase in new clients, operational efficiency improvements, key performance indicators, and strategic recommendations for Q4 focusing on market expansion and product development.",
          "Generate an annual financial report for SmallBiz Corp covering fiscal year performance. Include revenue breakdown by product line, expense analysis with 15% cost reduction initiatives, profit margins by quarter, cash flow statement, balance sheet summary, accounts receivable aging, and forward-looking projections for next fiscal year with growth targets.",
          "Design a market analysis report for RetailStartup examining competitive landscape in e-commerce fashion industry. Include market size analysis of $50B addressable market, competitor analysis of top 10 players, consumer behavior trends, pricing strategy recommendations, SWOT analysis, and market entry strategy for 3 new geographic regions."
        ],
        "pro": [
          "Develop a comprehensive quarterly business analysis for TechCorporation's enterprise software division showing 150% YoY growth to $25M revenue. Include detailed performance metrics across 5 product lines, customer retention analysis of 95% annual rate, sales funnel optimization, operational KPIs, competitive positioning against industry leaders, and strategic growth initiatives for international expansion across Europe and Asia-Pacific markets.",
          "Create a detailed annual compliance report for FinancialServices Group covering regulatory adherence across banking regulations. Include risk assessment framework, audit findings with remediation plans, compliance training effectiveness for 500+ employees, regulatory change impact analysis, internal control testing results, and strategic compliance roadmap for evolving regulatory landscape including digital banking requirements.",
          "Generate an advanced market penetration analysis for ManufacturingLeader's industrial automation products. Include TAM/SAM/SOM analysis of $200B global market, competitive intelligence on 15 major players, customer segmentation across automotive, aerospace, and electronics industries, pricing optimization study, channel partner performance analysis, and go-to-market strategy for emerging markets in Southeast Asia."
        ],
        "agency": [
          "Generate a comprehensive strategic business assessment for GlobalCorporation covering enterprise-wide performance across 12 business units and 30 international markets. Include detailed financial analysis with $2B revenue breakdown, operational excellence metrics, digital transformation progress assessment, market share analysis by region, competitive landscape evaluation, regulatory compliance across jurisdictions, risk management framework, and strategic growth initiatives including M&A opportunities and emerging technology investments.",
          "Create an advanced market intelligence report for ConglomerateGroup's diversified portfolio spanning technology, healthcare, and financial services. Include industry trend analysis across 8 sectors, macroeconomic impact assessment, regulatory environment evaluation, competitive positioning matrix, customer behavior analytics, supply chain optimization opportunities, and strategic recommendations for portfolio optimization and capital allocation across business units.",
          "Develop a sophisticated performance analytics report for InvestmentFirm's portfolio of 50+ companies totaling $5B assets under management. Include detailed financial performance analysis, industry benchmarking, ESG compliance assessment, risk-adjusted returns calculation, portfolio diversification analysis, market volatility impact assessment, and strategic asset allocation recommendations with scenario planning for economic downturn and growth scenarios."
        ]
      },
      "newsletter-designer": {
        "none": [
          "Design a company newsletter for monthly updates."
        ],
        "starter": [
          "Create a monthly company newsletter for TechStartup Inc. highlighting recent team growth from 15 to 25 employees, successful product launch generating 1,000+ new users, customer success story from MegaCorp client, upcoming industry conference participation, employee spotlight on lead developer Sarah Kim, and announcements about new office opening and Q4 goals.",
          "Design a customer newsletter for Artisan Bakery featuring new seasonal menu items including pumpkin spice croissants and apple cider donuts, behind-the-scenes look at bread-making process, customer recipe contest with $500 prize, upcoming holiday catering services, staff recommendations, and exclusive 15% discount code for newsletter subscribers.",
          "Generate a community newsletter for Riverside Neighborhood Association covering recent park renovation completion, upcoming holiday festival planning, crime statistics showing 20% decrease, new local business spotlights, volunteer opportunities for community garden, city council meeting updates, and residents' concerns about traffic safety improvements."
        ],
        "pro": [
          "Develop a comprehensive quarterly investor newsletter for TechUnicorn showcasing product milestone achievements including 500% user growth to 2M active users, strategic partnership announcements with Google and Microsoft, key performance metrics showing 200% revenue growth, executive team expansion with former Apple VP of Engineering, upcoming Series C funding round preparation, and product roadmap for AI-powered features.",
          "Create a professional industry newsletter for FinTechInsights covering regulatory updates affecting cryptocurrency trading, executive interviews with blockchain leaders, market analysis showing institutional adoption trends, emerging technology trends in digital payments, sector performance analysis, upcoming conference coverage, and expert predictions for banking industry transformation over next 2 years.",
          "Generate a detailed client newsletter for ConsultingExperts highlighting recent case study successes including 40% operational efficiency improvement for RetailGiant, thought leadership content on digital transformation trends, team expertise recognition with industry awards, upcoming webinar series on supply chain optimization, client testimonials, and strategic insights on post-pandemic business recovery strategies.",
          "Build a professional healthcare newsletter for MedGroup's network of 1,500+ physicians featuring clinical research updates, regulatory compliance news, treatment protocol updates, medical device reviews, pharmaceutical industry developments, upcoming medical conferences, and patient care best practices."
        ],
        "agency": [
          "Generate a comprehensive corporate communications newsletter for GlobalCorp's 50,000+ employees featuring business unit performance updates across technology, healthcare, and financial services divisions, strategic initiative progress on sustainability goals, leadership messages from CEO and regional presidents, employee spotlights celebrating diversity and innovation, corporate social responsibility programs impacting 100+ communities, and upcoming organizational changes including digital workplace transformation and talent development programs.",
          "Create an advanced investor relations newsletter for PublicTech's quarterly earnings communication featuring detailed financial performance analysis showing 25% revenue growth to $2B, market position updates in cloud computing and AI sectors, competitive landscape assessment against Amazon and Microsoft, strategic partnership developments with Fortune 100 companies, management commentary on industry trends, and forward-looking guidance for technology investment priorities and market expansion strategies.",
          "Develop a comprehensive industry thought leadership newsletter for ConsultingGiant's client base of 500+ Fortune 1000 companies, showcasing original research findings on digital transformation ROI, executive insights from C-suite leaders across industries, market predictions for economic recovery, regulatory analysis affecting global supply chains, strategic recommendations for ESG compliance, case studies demonstrating measurable business impact, and expert commentary on emerging technology trends including AI, blockchain, and quantum computing.",
          "Create an executive-level newsletter for InvestmentBank's institutional clients covering global market analysis, economic indicators, portfolio optimization strategies, regulatory changes affecting investment strategies, mergers and acquisitions activity, and strategic asset allocation recommendations.",
          "Generate a comprehensive industry newsletter for RealEstate Network's 2,000+ agents featuring market trends analysis, property valuation insights, mortgage rate updates, regulatory changes, sales technique best practices, technology tool reviews, and success stories from top-performing agents."
        ]
      },
      "business-proposal": {
        "none": [
          "Write a business proposal for a new service offering."
        ],
        "freemium": [
          "Create a project proposal for WebDesign Studio to provide website redesign services for GreenTech Solutions. Include responsive design for 8 pages, modern UI/UX improvements, mobile optimization, SEO basics, one round of revisions, basic training session, 3-month support package, 6-week timeline, and total investment of $4,500."
        ],
        "starter": [
          "Create a project proposal for LocalWeb Design to provide website redesign services for SmallBiz Accounting. Include responsive design for 15 pages, content management system integration, SEO optimization, mobile optimization, 3 rounds of revisions, training for 2 staff members, 6-month maintenance package, timeline of 8 weeks, and total investment of $8,500 with payment milestones.",
          "Write a partnership proposal between TechStartup and LocalMarketing Agency to cross-promote services to their combined client base of 200+ businesses. Include joint marketing campaigns, referral commission structure of 15%, co-branded content creation, shared booth at industry trade show, quarterly business reviews, and 12-month pilot program with performance metrics.",
          "Generate a service proposal for DigitalMarketing Consultants to provide comprehensive digital marketing services for GrowthCompany. Include social media management, Google Ads campaigns with $5,000 monthly budget, content creation, email marketing automation, monthly reporting, 6-month contract, and guaranteed 25% increase in qualified leads."
        ],
        "pro": [
          "Develop a comprehensive enterprise software implementation proposal for DataCorp's CRM system upgrade serving 500+ sales professionals. Include system requirements analysis, data migration from legacy systems, custom integrations with existing tools, user training program for 5 regional teams, change management strategy, 18-month implementation timeline, budget allocation of $250,000, success metrics, and ongoing support structure.",
          "Create a strategic partnership proposal between TechStart and three Fortune 500 companies to develop innovative IoT solutions. Include mutual benefit analysis, revenue sharing model, intellectual property agreements, joint product development roadmap, market penetration strategy, combined go-to-market approach, implementation timeline over 24 months, and projected revenue of $50M for all partners.",
          "Generate a detailed government contract proposal for CyberSecure's cybersecurity services protecting critical infrastructure. Include compliance requirements for NIST and FedRAMP standards, team credentials with security clearances, 24/7 monitoring capabilities, incident response procedures, penetration testing schedule, budget breakdown of $2M annually, and performance guarantees with SLA commitments."
        ],
        "agency": [
          "Generate a complete digital transformation proposal for LegacyCorp's modernization initiative across 12 departments and 5,000+ employees. Include comprehensive technology assessment, cloud migration strategy, cybersecurity framework implementation, change management program, employee training across all levels, phased implementation over 36 months, budget breakdown of $25M investment, ROI projections showing 300% return over 5 years, risk mitigation strategies, stakeholder engagement plan, and success metrics dashboard with quarterly reviews.",
          "Create an advanced merger and acquisition proposal for GlobalTech's acquisition of three complementary startups in AI, blockchain, and cybersecurity. Include detailed due diligence framework, valuation analysis using DCF and comparable company methods, integration strategy preserving key talent, synergy realization plan projecting $100M cost savings, regulatory approval timeline, stakeholder communication strategy, cultural integration program, and post-merger performance targets with management retention incentives.",
          "Develop a comprehensive public-private partnership proposal for SmartCity's infrastructure modernization including 5G network deployment, smart traffic systems, and renewable energy integration. Include multi-year implementation plan over 60 months, funding structure combining government and private investment totaling $500M, community impact analysis, job creation projections, environmental sustainability metrics, stakeholder engagement framework, and performance measurement system with citizen satisfaction targets."
        ]
      },
      "invoice-creator": {
        "none": [
          "Create a professional invoice for services rendered."
        ],
        "freemium": [
          "Create a professional service invoice for DesignStudio billing StartupClient for logo design project. Include 8 hours of design work at $85/hour, 2 concept revisions, final file delivery in multiple formats, payment terms of Net 15, and business contact details."
        ],
        "starter": [
          "Create a professional service invoice for WebDesign Studio billing ClientCorp for website development project. Include 40 hours of design work at $75/hour, 20 hours of development at $100/hour, domain registration fee of $15, hosting setup of $50, payment terms of Net 30, and professional contact information with tax ID number.",
          "Generate a freelance consulting invoice for Marketing Expert billing LocalBusiness for social media strategy consultation. Include 15 hours of consultation at $150/hour, social media audit report, content calendar creation, payment terms of Net 15, and detailed service breakdown with project timeline.",
          "Design a product sales invoice for ArtisanCrafts selling handmade furniture to CustomerName. Include custom dining table for $1,200, matching chairs (set of 4) for $800, delivery fee of $75, sales tax calculation, payment methods accepted, and estimated delivery date."
        ],
        "pro": [
          "Develop a comprehensive service invoice for TechConsulting Inc. billing EnterpriseCorp for digital transformation consulting project. Include senior consultant rates of $250/hour for 100 hours, project management at $200/hour for 50 hours, software licensing fees, implementation support, detailed milestone breakdown, payment schedule over 6 months, and professional service agreements.",
          "Create a detailed invoice for ConstructionFirm billing CorporateClient for office renovation project. Include labor costs breakdown, materials and supplies listing, equipment rental fees, permit costs, contractor insurance, subcontractor charges, change order documentation, progress payment schedule, and lien waiver information.",
          "Generate a professional invoice for LegalServices LLP billing BusinessClient for corporate legal services. Include attorney time at varying rates ($400-600/hour), paralegal support, court filing fees, document preparation, research time, travel expenses, retainer application, trust account details, and detailed time entries with case references."
        ],
        "agency": [
          "Generate a comprehensive enterprise invoice for GlobalTech Solutions billing MegaCorp for complete IT infrastructure overhaul project. Include detailed breakdown of hardware procurement ($500K), software licensing ($200K), professional services across multiple workstreams, project management office costs, third-party vendor coordination, implementation phases over 18 months, milestone-based payment structure, penalty clauses, and service level agreement terms.",
          "Create an advanced consulting invoice for StrategyPartners billing Fortune500Client for multi-year digital transformation initiative. Include executive consulting rates, specialist team allocations, technology assessment costs, change management services, training program development, performance measurement framework, quarterly review processes, and comprehensive service catalog with detailed resource allocation.",
          "Develop a sophisticated invoice for InvestmentBank billing CorporateClient for merger and acquisition advisory services. Include investment banking fees structure, due diligence support costs, financial modeling services, regulatory compliance assistance, transaction coordination fees, success fee calculation based on deal value, escrow account management, and post-transaction integration support services."
        ]
      },
      "financial-report": {
        "none": [
          "Generate a financial report for a company."
        ],
        "starter": [
          "Create a monthly financial report for Corner Café analyzing November performance. Include revenue breakdown of $45,000 across dine-in, takeout, and catering services, expense analysis showing food costs at 32% and labor at 28%, profit margin of 15%, cash flow statement, accounts payable/receivable summary, inventory turnover analysis, and comparison to previous month with recommendations for December holiday season.",
          "Generate a quarterly budget summary for TechStartup Inc. covering Q3 financial performance. Include revenue of $180,000 from software subscriptions, expense breakdown across personnel (60%), marketing (20%), and operations (15%), burn rate analysis, runway projection of 18 months, funding requirements, key financial ratios, and strategic budget allocation for Q4 growth initiatives.",
          "Write an annual expense report for Consulting Firm LLC analyzing fiscal year spending across all business categories. Include travel expenses of $25,000 for client meetings, office overhead costs, professional development, technology investments, marketing expenditures, personnel costs for 8 employees, tax implications, and cost optimization recommendations for next fiscal year."
        ],
        "pro": [
          "Develop a comprehensive Q4 financial analysis for TechGrowth Inc. showing revenue growth to $5M with detailed breakdown by product line including SaaS platform (60%), professional services (25%), and licensing (15%). Include expense optimization recommendations reducing operational costs by 12%, cash flow projections for next 6 quarters, working capital analysis, customer acquisition cost trends, lifetime value calculations, and strategic investment priorities for market expansion.",
          "Create a detailed investment performance report for GrowthFund's diversified portfolio of 25 technology companies totaling $50M assets under management. Include asset allocation analysis across growth stage (40%), early stage (35%), and late stage (25%), risk assessment framework, quarterly returns of 8.5%, benchmark comparison against NASDAQ, individual portfolio company performance, and market outlook for next quarter with rebalancing recommendations.",
          "Generate an advanced financial due diligence report for MegaCorp's potential acquisition of TargetCompany valued at $100M. Include comprehensive EBITDA analysis showing 25% margins, working capital assessment, debt structure evaluation, synergy identification projecting $15M annual savings, normalized earnings adjustments, quality of earnings analysis, and integration cost estimates with detailed financial projections."
        ],
        "agency": [
          "Generate a complete annual financial report for PublicCorp's SEC filing covering $2B revenue across five business segments. Include comprehensive income statement analysis with detailed revenue recognition policies, balance sheet optimization showing improved debt-to-equity ratio, cash flow statement highlighting operating activities generating $400M, segment reporting across technology, healthcare, financial services, manufacturing, and retail divisions, risk factor analysis for regulatory changes, management discussion covering strategic initiatives, and forward-looking financial projections with scenario modeling for economic uncertainty.",
          "Create an advanced investment committee report for PensionFund's $10B portfolio allocation across global markets and asset classes. Include detailed performance attribution analysis across equities (50%), fixed income (30%), alternatives (15%), and real estate (5%), risk-adjusted returns calculation, benchmark comparison against institutional peers, alternative investment evaluation including private equity and hedge funds, ESG compliance assessment, and strategic allocation recommendations for next fiscal year with interest rate sensitivity analysis.",
          "Develop a comprehensive financial restructuring analysis for DistressedCorp's turnaround strategy addressing $500M debt burden. Include detailed debt restructuring plan with creditor negotiations, operational improvement initiatives projecting 30% cost reduction, asset disposition strategy for non-core business units, liquidity analysis and cash flow forecasting, stakeholder negotiation framework including equity holders and bondholders, regulatory compliance requirements, and turnaround timeline with key milestones and success metrics."
        ]
      }
    };
    
    // Return tier-specific suggestions with fallback to basic level if service not found
    const serviceSuggestions = promptSuggestions[serviceId];
    if (!serviceSuggestions) return [];
    
    // Return suggestions for current tier, with quantity limits based on subscription
    const suggestions = serviceSuggestions[tier] || serviceSuggestions["none"] || serviceSuggestions["starter"] || [];
    
    // Limit number of suggestions shown based on tier for better UX
    const suggestionLimits = {
      "none": 1,        // Minimal suggestions for users without subscription
      "freemium": 1,    // Single suggestion for freemium users
      "starter": 3,     // Basic suggestions for starter users
      "pro": 4,         // More detailed examples for professionals
      "agency": 5       // Comprehensive examples for enterprise users
    };
    
    return suggestions.slice(0, suggestionLimits[tier as keyof typeof suggestionLimits] || 3);
  };

  // AI Text Expansion function
  const handleExpandText = async () => {
    if (!prompt.trim() || !selectedService) {
      toast({
        title: "Input Required",
        description: "Please provide a prompt and select a service to expand text",
        variant: "destructive",
      });
      return;
    }

    setIsExpanding(true);

    try {
      const response = await apiRequest("POST", "/api/expand-text", {
        text: prompt.trim(),
        service: selectedService
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Text expansion failed");
      }

      setPrompt(data.expandedText || data.originalText);
      toast({
        title: "Text Expanded",
        description: "Your prompt has been enhanced with AI suggestions",
      });
    } catch (err: any) {
      toast({
        title: "Expansion Failed",
        description: err.message || "Failed to expand text",
        variant: "destructive",
      });
    } finally {
      setIsExpanding(false);
    }
  };

  const generateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('🚀 Starting generation request...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout for complex generation
      
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          body: formData, // Send FormData directly for file uploads
          credentials: 'include',
          signal: controller.signal,
        });
        
        console.log('📡 Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          const text = await response.text();
          console.error('❌ Error response body:', text);
          throw new Error(`${response.status}: ${text}`);
        }
        
        clearTimeout(timeoutId);
        
        try {
          const responseText = await response.text();
          console.log('📄 Raw response text:', responseText.substring(0, 200) + '...');
          
          if (!responseText.trim()) {
            throw new Error('Empty response from server');
          }
          
          const data = JSON.parse(responseText);
          console.log('✅ Generation request completed successfully:', data);
          return data;
        } catch (parseError) {
          console.error('❌ Failed to parse response JSON:', parseError);
          console.error('❌ Raw response that failed to parse:', responseText);
          throw new Error(`Invalid response format from server. Parse error: ${parseError}`);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ Generation request failed:', error);
        console.error('❌ Error details:', { name: error.name, message: error.message, stack: error.stack });
        throw error;
      }
    },
    onSuccess: (data: any) => {
      const isGuest = data.isGuest;
      setGeneratedContent(data);
      toast({
        title: "Content Generated Successfully!",
        description: isGuest 
          ? "Your content is ready! Sign up to save and access it anytime."
          : `Document created and saved to your account. ${data.documentId ? 'View it in your dashboard.' : ''}`,
      });
      console.log("Generated content:", data);
      
      // Show page analysis if available
      if (data.pageAnalysis) {
        toast({
          title: "Smart Document Created",
          description: data.pageAnalysis,
        });
      }
      
      // Clear the form after successful generation
      setPrompt('');
      setSelectedService('');
      setSelectedTemplate('');
      setUploadedLogo(null);
    },
    onError: (error: Error) => {
      console.error('Generation error details:', error);
      
      // Handle AbortError specifically (timeout during generation)
      if (error.name === "AbortError" || error.message.includes("signal is aborted")) {
        console.warn('⚠️ Request timed out but generation may have succeeded - checking backend logs');
        toast({
          title: "Processing Your Document",
          description: "Your document is taking longer than usual to generate. Please check your dashboard in a few moments - it may have completed successfully.",
          variant: "default",
        });
        
        // Clear the form after timeout since generation might have succeeded
        setTimeout(() => {
          setPrompt('');
          setSelectedService('');
          setSelectedTemplate('');
          setUploadedLogo(null);
        }, 2000);
        return;
      }
      
      // Catch JSON parse errors specifically (common cause of false errors)
      if (error.message.includes("Invalid response format") || error.message.includes("Parse error")) {
        console.warn('⚠️ JSON parse error occurred but generation may have succeeded - checking backend logs');
        toast({
          title: "Response Format Issue", 
          description: "There was a technical issue with the response. Please check your documents page to see if generation completed.",
          variant: "destructive",
        });
        return;
      }
      
      // Handle specific error cases
      if (error.message.includes("403")) {
        if (error.message.includes("require an account")) {
          toast({
            title: "Account Required",
            description: "Multi-page documents require an account. Please sign up to continue.",
            variant: "destructive",
          });
        } else if (error.message.includes("Pro or Agency plan")) {
          toast({
            title: "Premium Feature",
            description: "Documents with 6+ pages require a Pro or Agency plan.",
            variant: "destructive",
          });
        }
      } else if (error.message.includes("400")) {
        toast({
          title: "Invalid Request",
          description: "Please check your inputs and try again.",
          variant: "destructive",
        });
      } else if (error.message.includes("500")) {
        toast({
          title: "Server Error",
          description: "We're experiencing technical difficulties. Please try again in a moment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: error.message.includes(":") ? error.message.split(":")[1].trim() : "Please try again with a different prompt.",
          variant: "destructive",
        });
      }
    },
  });

  // Auto-detection removed - users must manually select service type

  const handleGenerate = () => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Account Required",
        description: "Please sign in to generate documents. Create a free account to get started.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has any subscription
    if (!hasAnySubscription()) {
      toast({
        title: "Subscription Required",
        description: "Please choose a subscription plan to get started.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is approved by admin
    if (!isUserApproved()) {
      toast({
        title: "Approval Required",
        description: "Your account is awaiting admin approval before you can generate documents.",
        variant: "destructive",
      });
      return;
    }

    // Allow free users to generate documents (Free plan users can generate 1 document per month)
    // No paid subscription check needed since Free plan is included

    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a description of what you want to create.",
        variant: "destructive",
      });
      return;
    }
    
    // Require manual service type selection
    if (!selectedService) {
      toast({
        title: "Service Required",
        description: "Please select what type of document you want to generate.",
        variant: "destructive",
      });
      return;
    }

    // Prepare form data for logo upload with intelligent page count
    const intelligentPageCount = determinePageCount(prompt.trim(), selectedService);
    const formData = new FormData();
    formData.append('prompt', prompt.trim());
    formData.append('serviceId', selectedService);
    formData.append('pageCount', intelligentPageCount.toString());
    if (selectedTemplate) {
      formData.append('templateId', selectedTemplate);
    }
    if (uploadedLogo && canUploadLogo()) {
      formData.append('companyLogo', uploadedLogo);
    }

    generateMutation.mutate(formData);
  };

  // Function to intelligently determine page count based on prompt content
  const determinePageCount = (prompt: string, serviceType: string): number => {
    const wordCount = prompt.trim().split(/\s+/).length;
    const hasDetailed = /detailed|comprehensive|complete|full|extensive|thorough|in-depth/i.test(prompt);
    const hasMultiSection = /section|chapter|part|phases?|steps?|components?/i.test(prompt);
    const hasMultipleTopics = prompt.split(/[,;]/).length > 3;
    
    // Service-specific page logic
    switch (serviceType) {
      case 'report-generator':
        if (wordCount > 100 || hasDetailed) return 3;
        if (wordCount > 50 || hasMultiSection) return 2;
        return 1;
        

      case 'pitch-deck':
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
        if (wordCount > 120 || hasDetailed) return 3;
        if (wordCount > 60 || hasMultiSection) return 2;
        return 1;
        
      default:
        // For other document types, use simple logic
        if (wordCount > 100 || hasDetailed) return 2;
        return 1;
    }
  };

  return (
    <section className="relative bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              Create with <span className="text-yellow-600">AI</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-4">
            Generate professional business documents, presentations, and marketing materials 
            in seconds using our intelligent AI-powered design platform
          </p>
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Now Enhanced with Live Web Data for Accurate, Current Content
              </span>
            </div>
          </div>
          
          {/* Prompt Input Section */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-yellow-500/20 p-8 border-2 border-yellow-400">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Describe what you want to create</h3>
            </div>
            
            {/* Service Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-yellow-600 mb-2">
                Choose Service
              </label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className={`w-full h-12 text-lg border-yellow-500 bg-gray-50 text-gray-900 focus:border-yellow-600 ${isMobile ? 'text-base h-14' : ''}`}>
                  <SelectValue placeholder="Select what you want to generate..." />
                </SelectTrigger>
                <SelectContent className={isMobile ? 'max-h-48' : ''}>
                  {aiServices.map((service) => {
                    const IconComponent = service.icon;
                    return (
                      <SelectItem key={service.id} value={service.id}>
                        <div className={`flex items-center gap-3 py-2 ${isMobile ? 'flex-col gap-1 text-center' : ''}`}>
                          <img 
                            src={service.thumbnail} 
                            alt={service.name}
                            className={`object-cover rounded border ${isMobile ? 'w-16 h-12' : 'w-12 h-8'}`}
                          />
                          <div className="flex flex-col">
                            <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{service.name}</span>
                            <span className={`text-gray-500 ${isMobile ? 'text-xs hidden' : 'text-xs'}`}>{service.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* AI-Powered Page Determination Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Smart Page Determination
                  </h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Our AI automatically determines the optimal number of pages for your document based on content complexity, keywords, and document type. You can always edit the layout using our PDF editor after generation.
                  </p>
                </div>
              </div>
            </div>

            {/* Template Selection Dropdown */}
            {selectedService && availableTemplates.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-yellow-600 mb-2">
                  Templates
                </label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-full h-12 text-lg border-yellow-500 bg-gray-50 text-gray-900 focus:border-yellow-600">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {availableTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-3 py-2">
                          {template.thumbnailUrl ? (
                            <img 
                              src={template.thumbnailUrl} 
                              alt={template.name}
                              className="w-16 h-12 object-cover rounded border shadow-sm"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const nextSibling = target.nextElementSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.style.display = 'block';
                                }
                              }}
                            />
                          ) : null}
                          <FileText className="w-4 h-4 text-gray-400" style={{ display: template.thumbnailUrl ? 'none' : 'block' }} />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="text-xs text-gray-500 leading-relaxed">{template.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">
                  Select a specific template for your document
                </p>
              </div>
            )}

            {/* Enhanced Tier-Based Prompt Suggestions */}
            {selectedService && (
              <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">
                      {getUserTier() === "none" ? "Basic Examples" :
                       getUserTier() === "freemium" ? "Freemium Examples" :
                       getUserTier() === "starter" ? "Example Prompts" : 
                       getUserTier() === "pro" ? "Professional Examples" : 
                       "Enterprise-Level Examples"} for {aiServices.find(s => s.id === selectedService)?.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${getUserTier() === "none" ? "text-red-700 border-red-400 bg-red-50" :
                          getUserTier() === "freemium" ? "text-green-700 border-green-400 bg-green-50" :
                          getUserTier() === "starter" ? "text-gray-700 border-gray-400 bg-white" : 
                          getUserTier() === "pro" ? "text-blue-700 border-blue-400 bg-blue-50" : 
                          "text-purple-700 border-purple-400 bg-purple-50"}
                      `}
                    >
                      {getUserTier() === "none" ? "NO PLAN" : `${getUserTier().toUpperCase()} TIER`}
                    </Badge>
                    {getUserTier() !== "agency" && (
                      <Badge variant="outline" className="text-green-700 border-green-400 bg-green-50 text-xs">
                        {getServicePromptSuggestions(selectedService, getUserTier()).length} of {
                          getUserTier() === "starter" ? "5+" : "8+"
                        } examples
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {getServicePromptSuggestions(selectedService, getUserTier()).map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-md border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative"
                      onClick={() => setPrompt(suggestion)}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`
                          inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0 mt-0.5
                          ${getUserTier() === "none" ? "bg-red-100 text-red-600" :
                            getUserTier() === "starter" ? "bg-gray-100 text-gray-600" : 
                            getUserTier() === "pro" ? "bg-blue-100 text-blue-600" : 
                            "bg-purple-100 text-purple-600"}
                        `}>
                          {index + 1}
                        </span>
                        <p className="text-sm text-gray-700 group-hover:text-blue-900 transition-colors leading-relaxed">
                          {suggestion}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-blue-500 font-medium">Click to use</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-3 border-t border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-blue-600">
                      {getUserTier() === "none" 
                        ? `Showing ${getServicePromptSuggestions(selectedService, getUserTier()).length} basic example${getServicePromptSuggestions(selectedService, getUserTier()).length > 1 ? 's' : ''}. Purchase a subscription for detailed prompts and unlimited generation.`
                        : getUserTier() === "starter" 
                        ? `Showing ${getServicePromptSuggestions(selectedService, getUserTier()).length} basic examples. Upgrade for more detailed prompts.`
                        : getUserTier() === "pro" 
                        ? `Professional examples with detailed context and metrics.`
                        : `Comprehensive enterprise-level examples with advanced strategies.`
                      }
                    </p>
                    {(getUserTier() === "none" || getUserTier() === "starter") && (
                      <Button
                        onClick={() => window.open('#pricing', '_blank')}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 text-xs h-6 px-2"
                      >
                        {getUserTier() === "none" ? "Upgrade to Starter →" : "Upgrade for More →"}
                      </Button>
                    )}
                  </div>
                  
                  {/* Tier Benefits Preview */}
                  {(getUserTier() === "none" || getUserTier() === "starter") && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-md border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-yellow-600" />
                        <span className="text-xs font-semibold text-yellow-800">
                          {getUserTier() === "none" ? "Start Your Subscription" : "Unlock More Examples"}
                        </span>
                      </div>
                      <div className="text-xs text-yellow-700 space-y-1">
                        {getUserTier() === "none" ? (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                              <span>Starter: 3+ basic examples (£12/month)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                              <span>Pro: 4+ detailed examples + logo upload (£32/month)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                              <span>Agency: 5+ enterprise examples + unlimited generation (£62/month)</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                              <span>Pro: 4+ detailed examples with business metrics</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                              <span>Agency: 5+ enterprise examples + logo integration</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Company Logo Upload - Pro and Agency Only */}
            {canUploadLogo() && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Company Logo Upload</h4>
                  <Badge variant="outline" className="text-purple-700 border-purple-400 bg-white">
                    PREMIUM
                  </Badge>
                </div>
                
                {!logoPreview ? (
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-purple-500" />
                      <div className="text-sm text-gray-700">
                        <span className="font-medium text-purple-700">Click to upload</span> your company logo
                      </div>
                      <div className="text-xs text-gray-500">
                        PNG, JPG, SVG up to 5MB
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={logoPreview}
                        alt="Company Logo Preview"
                        className="w-12 h-12 object-contain rounded border"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {uploadedLogo?.name}
                        </p>
                        <p className="text-xs text-green-600">
                          Logo will be included in your document
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleRemoveLogo}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <p className="text-xs text-purple-600 mt-2">
                  Your logo will be professionally integrated into headers, footers, and cover pages.
                </p>
              </div>
            )}

            {/* Upgrade prompt for Starter users */}
            {!canUploadLogo() && (
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-700">Company Logo Upload</h4>
                  <Badge variant="outline" className="text-gray-500 border-gray-300">
                    PRO FEATURE
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Add your company logo to all generated documents. Available with Pro and Agency plans.
                </p>
                <Button
                  onClick={() => window.open('#pricing', '_blank')}
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              <Textarea
                placeholder="Select a service type above to see example prompts, or describe what you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 text-lg bg-gray-50 text-gray-900 border-3 border-yellow-400 focus:border-yellow-600 focus:ring-2 focus:ring-yellow-400 resize-none placeholder:text-gray-500 shadow-lg shadow-yellow-500/20"
              />
              {prompt.trim() && selectedService && (
                <div className="flex justify-end">
                  <Button 
                    onClick={handleExpandText}
                    disabled={isExpanding || generateMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    {isExpanding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Expanding...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Expand with AI
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            {!user && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-blue-800 text-sm">
                  <span className="font-medium">Sign in required:</span> Create an account to get started. Admin approval and subscription upgrade required for document generation.
                </p>
              </div>
            )}



            {user && !hasValidSubscription() && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                <p className="text-orange-800 text-sm">
                  <span className="font-medium">Plan assignment required:</span> Your account needs plan activation.
                </p>
                <Button
                  onClick={() => window.open('#pricing', '_blank')}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  View Plans
                </Button>
              </div>
            )}

            {user && hasAnySubscription() && !isUserApproved() && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-yellow-800 text-sm">
                  <span className="font-medium">Pending approval:</span> Your account is awaiting admin approval before you can generate documents.
                </p>
              </div>
            )}

            {user && isUserApproved() && getUserTier() === "freemium" && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                <p className="text-orange-800 text-sm">
                  <span className="font-medium">Upgrade required:</span> Upgrade to Pro or Agency plan to generate documents.
                </p>
                <Button
                  onClick={() => window.open('#pricing', '_blank')}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  Upgrade Plan
                </Button>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button 
                onClick={handleGenerate}
                disabled={!canGenerateDocuments() || !prompt.trim() || !selectedService || generateMutation.isPending}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generateMutation.isPending ? (
                  <>
                    <Sparkles className="animate-spin mr-2 h-5 w-5" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate
                  </>
                )}
              </Button>



              <Button
                variant="outline"
                onClick={() => {
                  setPrompt("");
                  setSelectedTemplate("");
                  setSelectedService("");
                  handleRemoveLogo();
                }}
                className="border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black px-8 py-4 rounded-full text-lg font-semibold transition-colors flex items-center"
              >
                Clear Form
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Generated Content Preview */}
          {generatedContent && (
            <div className="mt-8">
              <DocumentPreview
                content={generatedContent.content || generatedContent}
                title={generatedContent.title || "Generated Document"}
                serviceType={selectedService}
                pageCount={generatedContent.pageCount}
                isGuest={generatedContent.isGuest}
                documentId={generatedContent.id}
                showActions={true}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
