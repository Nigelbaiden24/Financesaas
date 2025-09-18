import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Lightbulb, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export function DatabaseTemplateGenerator() {
  const [input, setInput] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Get user's subscription tier for AI suggestion features
  const getUserTier = () => {
    const currentPlan = (user as any)?.currentPlan || "starter";
    return currentPlan.toLowerCase();
  };

  const services = [
    { value: "pitch-deck", label: "Pitch Deck" },
    { value: "cv-resume", label: "CV/Resume" },
    { value: "business-proposal", label: "Business Proposal" },
    { value: "marketing-brochure", label: "Marketing Brochure" },
    { value: "financial-report", label: "Financial Report" },
    { value: "annual-report", label: "Annual Report" },
    { value: "newsletter", label: "Newsletter" },
    { value: "invoice", label: "Invoice" },
    { value: "presentation", label: "Presentation" },
    { value: "business-plan", label: "Business Plan" },
    { value: "white-paper", label: "White Paper" },
    { value: "case-study", label: "Case Study" },
    { value: "product-catalog", label: "Product Catalog" },
    { value: "company-profile", label: "Company Profile" }
  ];

  // AI Prompt Suggestions based on service and user tier
  const getServicePromptSuggestions = (service: string, userTier: string) => {
    const suggestions: Record<string, Record<string, string[]>> = {
      "pitch-deck": {
        "starter": [
          "Create a pitch deck for a tech startup developing AI chatbots for small businesses",
          "Design a investor presentation for a food delivery app targeting college campuses",
          "Generate a funding pitch for an eco-friendly clothing brand"
        ],
        "pro": [
          "Develop a Series A pitch deck for DataFlow Technologies, an AI-powered business intelligence platform with $2.5M revenue, targeting healthcare and finance sectors with 15-slide comprehensive presentation",
          "Create a venture capital presentation for GreenTech Solutions' solar energy management system, highlighting $5M ARR, 200% year-over-year growth, and expansion into European markets",
          "Design a strategic investor pitch for FoodChain Analytics, showcasing supply chain optimization technology, current partnerships with Fortune 500 companies, and $10M funding request"
        ],
        "agency": [
          "Generate a comprehensive Series B pitch deck for MegaTech Corporation's enterprise AI platform, including detailed market analysis across 12 industries, competitive positioning matrix, financial projections with scenario modeling, team credentials, strategic partnerships with Microsoft and Google, international expansion roadmap across North America and Europe, and $50M funding strategy with use of proceeds breakdown",
          "Create an institutional investor presentation for GlobalFinance Technologies' blockchain payment infrastructure, featuring comprehensive market opportunity analysis, regulatory compliance framework across 15 jurisdictions, detailed unit economics and LTV/CAC analysis, strategic moat analysis, and phased go-to-market strategy for financial institutions",
          "Develop a complete IPO roadshow presentation for TechGiant Industries, incorporating comprehensive S-1 filing preparation, detailed financial performance analysis, market positioning against public comparables, growth strategy roadmap, management team expertise showcase, and investor Q&A preparation materials"
        ]
      },
      "cv-resume": {
        "starter": [
          "Create a CV for a software engineer with 3 years experience in React and Node.js",
          "Design a resume for a marketing coordinator transitioning to digital marketing",
          "Generate a CV for a recent business graduate seeking entry-level positions"
        ],
        "pro": [
          "Develop a comprehensive CV for Sarah Johnson, Senior Product Manager at TechCorp with 8 years experience, highlighting leadership of cross-functional teams, successful product launches generating $12M revenue, and expertise in agile methodologies and user experience design",
          "Create an executive resume for Michael Chen, VP of Sales with proven track record of scaling revenue from $5M to $50M at three different startups, expertise in enterprise B2B sales, and team leadership experience managing 40+ sales professionals",
          "Design a professional CV for Dr. Amanda Rodriguez, Research Scientist with PhD in Machine Learning, 15 published papers, patent holder, and experience leading AI initiatives at Fortune 500 companies"
        ],
        "agency": [
          "Generate a comprehensive executive CV for Robert Sterling, Chief Technology Officer with 20+ years experience scaling technology organizations from startup to IPO, including detailed leadership experience managing 200+ engineers, strategic technology roadmap development, successful digital transformation initiatives saving $50M+ annually, board advisory positions, speaking engagements at major tech conferences, and comprehensive technical expertise across cloud platforms, AI/ML, and enterprise architecture",
          "Create an advanced C-suite resume for Jennifer Martinez, Chief Marketing Officer with proven expertise driving growth for unicorn startups, including quantified achievements such as customer acquisition cost reduction by 65%, brand value increase of $100M+, successful market expansion across 25 countries, strategic partnership development with industry leaders, and comprehensive marketing technology stack optimization",
          "Develop a complete senior executive profile for David Thompson, President & CEO with track record of leading multiple successful exits totaling $2B+, including detailed operational excellence achievements, international expansion expertise, M&A transaction leadership, stakeholder management across investors and board members, crisis management experience, and comprehensive industry thought leadership credentials"
        ]
      },
      "marketing-brochure": {
        "starter": [
          "Create a brochure for a local fitness gym highlighting equipment and membership plans",
          "Design a tri-fold brochure for a web design agency showcasing services",
          "Generate a product brochure for an organic skincare line"
        ],
        "pro": [
          "Develop a comprehensive corporate brochure for TechSolutions Inc., a B2B software company with 500+ clients, highlighting their cloud-based enterprise solutions, case studies showing 40% efficiency improvements, and service offerings across consulting, implementation, and support",
          "Create a professional services brochure for LegalExpert Associates, showcasing their expertise in corporate law, mergers & acquisitions, with detailed client testimonials, fee structure, and track record of $2B+ in successful transactions",
          "Design a product marketing brochure for InnovateHealth's medical device portfolio, featuring FDA-approved technologies, clinical trial results, healthcare professional endorsements, and distribution network across 15 countries"
        ],
        "agency": [
          "Generate a comprehensive corporate capability brochure for GlobalTech Enterprises, featuring detailed service portfolio across digital transformation, cloud migration, and AI implementation, showcasing Fortune 100 client case studies with quantified ROI metrics, international presence across 30 countries, 5000+ certified professionals, strategic partnerships with Microsoft, AWS, and Google Cloud, industry-specific solutions for healthcare, finance, and manufacturing, and complete thought leadership credentials including published research and conference presentations",
          "Create an advanced investment services brochure for Premier Capital Management, highlighting $50B+ assets under management, comprehensive portfolio management strategies, detailed performance metrics across market cycles, regulatory compliance certifications, senior leadership team credentials with combined 200+ years experience, institutional client testimonials, and complete service offerings including wealth management, family office services, and alternative investment strategies",
          "Develop a complete enterprise solutions brochure for MegaCorp Industries, showcasing end-to-end business transformation capabilities, detailed case studies demonstrating operational efficiency improvements of 60%+, comprehensive technology stack including proprietary platforms, global delivery model across 40+ locations, industry certifications and compliance frameworks, strategic alliance network, and complete innovation pipeline including emerging technology investments"
        ]
      },
      "business": {
        "starter": [
          "Write a business plan for a coffee shop in downtown area",
          "Create a company profile for a digital marketing agency",
          "Generate a quarterly report for a small retail business"
        ],
        "pro": [
          "Develop a comprehensive business case for DataTech Inc.'s expansion into European markets, including market analysis, financial projections, and risk assessment",
          "Create a strategic partnership proposal between FinanceApp and three major banks, outlining mutual benefits and implementation timeline",
          "Generate a detailed feasibility study for GreenTech's new renewable energy project, including regulatory compliance and ROI analysis"
        ],
        "agency": [
          "Create a complete business transformation strategy for ManufacturingGiant's digital modernization initiative, including process optimization, technology integration, change management, stakeholder analysis, and 5-year financial modeling",
          "Develop an advanced merger and acquisition analysis for TechConglomerate's acquisition of three startups, including due diligence frameworks, cultural integration strategies, and synergy realization plans",
          "Generate a comprehensive corporate restructuring plan for GlobalCorp's reorganization into four business units, including governance structures, resource allocation, and performance measurement systems"
        ]
      },
      "resume": {
        "starter": [
          "Create a professional resume for a software developer with 3 years experience",
          "Generate a CV for a marketing manager seeking career advancement",
          "Write a resume for a recent graduate in business administration"
        ],
        "pro": [
          "Develop a comprehensive executive resume for Sarah Johnson, Chief Technology Officer with 15 years in fintech, highlighting her leadership in digital transformation at three Fortune 500 companies",
          "Create a specialized consulting resume for Michael Chen, showcasing his expertise in supply chain optimization across automotive and aerospace industries with quantified achievements",
          "Generate a targeted academic CV for Dr. Emma Rodriguez, emphasizing her research in renewable energy systems, publications, and grant acquisition totaling $2.5M"
        ],
        "agency": [
          "Create a complete executive portfolio for James Thompson, CEO candidate for TechUnicorn, including comprehensive leadership narrative, strategic vision documents, board presentation materials, and stakeholder testimonials spanning his 20-year career transforming five companies",
          "Develop an advanced professional brand package for Maria Gonzalez, global consulting partner, featuring multi-format CV, thought leadership positioning, speaking engagement materials, and client success case studies across 25 countries",
          "Generate a comprehensive career transition portfolio for David Park, transforming from military leadership to corporate executive, including skills translation matrix, leadership philosophy documentation, and strategic implementation frameworks"
        ]
      },
      "sales": {
        "starter": [
          "Create a sales pitch for a new CRM software",
          "Generate a product presentation for a fitness app",
          "Write a sales proposal for consulting services"
        ],
        "pro": [
          "Develop a comprehensive sales strategy for CloudSoft's enterprise solution targeting Fortune 1000 companies, including competitive analysis, pricing models, and objection handling frameworks",
          "Create a detailed B2B sales playbook for MedTech's new diagnostic equipment, featuring buyer persona analysis, sales process optimization, and ROI calculation tools",
          "Generate an advanced account-based selling strategy for ConsultingFirm's expansion into pharmaceutical vertical, including stakeholder mapping and value proposition customization"
        ],
        "agency": [
          "Create a complete global sales transformation program for TechGlobal's $500M revenue target, including territory optimization, compensation restructuring, sales enablement technology stack, and performance analytics dashboard across 30 countries",
          "Develop an advanced strategic account management framework for ManufacturingLeader's key client relationships, including relationship mapping, value creation strategies, expansion opportunities, and retention risk assessment models",
          "Generate a comprehensive sales and marketing alignment strategy for SaaSTech's growth from $50M to $200M ARR, including lead scoring optimization, content strategy, and revenue attribution modeling"
        ]
      },
      "business-proposal": {
        "starter": [
          "Create a project proposal for a website redesign for a small business",
          "Write a partnership proposal between two local companies",
          "Generate a service proposal for digital marketing consulting"
        ],
        "pro": [
          "Develop a comprehensive enterprise software implementation proposal for DataCorp's CRM system upgrade, including timeline, budget allocation, and change management strategy",
          "Create a strategic partnership proposal between TechStart and three Fortune 500 companies, outlining mutual benefits, revenue sharing, and implementation roadmap",
          "Generate a detailed government contract proposal for CyberSecure's cybersecurity services, including compliance requirements, team credentials, and security frameworks"
        ],
        "agency": [
          "Generate a complete digital transformation proposal for LegacyCorp's modernization initiative, featuring comprehensive technology assessment, phased implementation strategy across 12 departments, budget breakdown of $25M investment, ROI projections, risk mitigation strategies, stakeholder engagement plan, and success metrics dashboard",
          "Create an advanced merger and acquisition proposal for GlobalTech's acquisition of three complementary startups, including detailed due diligence framework, valuation analysis, integration strategy, synergy realization plan, and regulatory approval timeline",
          "Develop a comprehensive public-private partnership proposal for SmartCity's infrastructure modernization, featuring multi-year implementation plan, funding structure, community impact analysis, and sustainability metrics"
        ]
      },
      "financial-report": {
        "starter": [
          "Create a monthly financial report for a small retail store",
          "Generate a quarterly budget summary for a startup",
          "Write an annual expense report for a consulting firm"
        ],
        "pro": [
          "Develop a comprehensive Q4 financial analysis for TechGrowth Inc., including revenue breakdown by product line, expense optimization recommendations, and cash flow projections",
          "Create a detailed investment performance report for GrowthFund's portfolio, featuring asset allocation analysis, risk assessment, and market outlook for next quarter",
          "Generate an advanced financial due diligence report for MegaCorp's acquisition target, including EBITDA analysis, working capital assessment, and synergy identification"
        ],
        "agency": [
          "Generate a complete annual financial report for PublicCorp's SEC filing, featuring comprehensive income statement analysis, balance sheet optimization, cash flow statement with detailed operating activities, segment reporting across five business units, risk factor analysis, management discussion and analysis, and forward-looking financial projections with scenario modeling",
          "Create an advanced investment committee report for PensionFund's $2B portfolio allocation, including detailed asset class performance, risk attribution analysis, benchmark comparison, alternative investment evaluation, and strategic allocation recommendations for next fiscal year",
          "Develop a comprehensive financial restructuring analysis for DistressedCorp's turnaround strategy, featuring debt restructuring plan, operational improvement initiatives, asset disposition strategy, and stakeholder negotiation framework"
        ]
      },
      "newsletter": {
        "starter": [
          "Create a monthly company newsletter for TechStartup Inc. highlighting recent team growth from 15 to 25 employees, successful product launch generating 1,000+ new users, customer success story from MegaCorp client, upcoming industry conference participation, employee spotlight on lead developer Sarah Kim, and announcements about new office opening and Q4 goals.",
          "Design a customer newsletter for Artisan Bakery featuring new seasonal menu items including pumpkin spice croissants and apple cider donuts, behind-the-scenes look at bread-making process, customer recipe contest with $500 prize, upcoming holiday catering services, staff recommendations, and exclusive 15% discount code for newsletter subscribers.",
          "Generate a community newsletter for Riverside Neighborhood Association covering recent park renovation completion, upcoming holiday festival planning, crime statistics showing 20% decrease, new local business spotlights, volunteer opportunities for community garden, city council meeting updates, and residents' concerns about traffic safety improvements."
        ],
        "pro": [
          "Develop a comprehensive quarterly investor newsletter for TechUnicorn showcasing product milestone achievements including 500% user growth to 2M active users, strategic partnership announcements with Google and Microsoft, key performance metrics showing 200% revenue growth, executive team expansion with former Apple VP of Engineering, upcoming Series C funding round preparation, and product roadmap for AI-powered features.",
          "Create a professional industry newsletter for FinTechInsights covering regulatory updates affecting cryptocurrency trading, executive interviews with blockchain leaders, market analysis showing institutional adoption trends, emerging technology trends in digital payments, sector performance analysis, upcoming conference coverage, and expert predictions for banking industry transformation over next 2 years.",
          "Generate a detailed client newsletter for ConsultingExperts highlighting recent case study successes including 40% operational efficiency improvement for RetailGiant, thought leadership content on digital transformation trends, team expertise recognition with industry awards, upcoming webinar series on supply chain optimization, client testimonials, and strategic insights on post-pandemic business recovery strategies."
        ],
        "agency": [
          "Generate a comprehensive corporate communications newsletter for GlobalCorp's 50,000+ employees featuring business unit performance updates across technology, healthcare, and financial services divisions, strategic initiative progress on sustainability goals, leadership messages from CEO and regional presidents, employee spotlights celebrating diversity and innovation, corporate social responsibility programs impacting 100+ communities, and upcoming organizational changes including digital workplace transformation and talent development programs.",
          "Create an advanced investor relations newsletter for PublicTech's quarterly earnings communication featuring detailed financial performance analysis showing 25% revenue growth to $2B, market position updates in cloud computing and AI sectors, competitive landscape assessment against Amazon and Microsoft, strategic partnership developments with Fortune 100 companies, management commentary on industry trends, and forward-looking guidance for technology investment priorities and market expansion strategies.",
          "Develop a comprehensive industry thought leadership newsletter for ConsultingGiant's client base of 500+ Fortune 1000 companies, showcasing original research findings on digital transformation ROI, executive insights from C-suite leaders across industries, market predictions for economic recovery, regulatory analysis affecting global supply chains, strategic recommendations for ESG compliance, case studies demonstrating measurable business impact, and expert commentary on emerging technology trends including AI, blockchain, and quantum computing."
        ]
      }
    };

    const tierSuggestions = suggestions[service]?.[userTier] || suggestions[service]?.["starter"] || [];
    return tierSuggestions;
  };

  const handleExpandText = async () => {
    if (!input.trim() || !selectedService) {
      setError("Please provide input and select a service to expand text");
      return;
    }

    setIsExpanding(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/expand-text", {
        text: input.trim(),
        service: selectedService
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Text expansion failed");
      }

      setInput(data.expandedText || data.originalText);
    } catch (err: any) {
      setError(err.message || "Failed to expand text");
    } finally {
      setIsExpanding(false);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim() || !selectedService) {
      setError("Please provide input and select a service");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiRequest("POST", "/api/generate-from-database", {
        input: input.trim(),
        category: selectedService
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Generation failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-yellow-500/20 bg-gradient-to-br from-white to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-yellow-600" />
            Database Template Generator
          </CardTitle>
          <CardDescription className="text-gray-600">
            Generate content using templates stored in your Replit database. Select a service type to see example prompts and get started with AI-powered content generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Service Type</label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="border-2 border-yellow-500/30 focus:border-yellow-500">
                <SelectValue placeholder="Select a service type" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI Prompt Suggestions */}
          {selectedService && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">
                  Example Prompts for {services.find(s => s.value === selectedService)?.label}
                </h4>
                <Badge variant="outline" className="text-blue-700 border-blue-400">
                  {getUserTier().toUpperCase()} TIER
                </Badge>
              </div>
              <div className="space-y-2">
                {getServicePromptSuggestions(selectedService, getUserTier()).map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-md border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group"
                    onClick={() => setInput(suggestion)}
                  >
                    <p className="text-sm text-gray-700 group-hover:text-blue-900 transition-colors">
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Click any suggestion to use it as your prompt. Suggestions are tailored to your {getUserTier()} plan.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Input</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your content requirements here..."
              className="min-h-[100px] border-2 border-yellow-500/30 focus:border-yellow-500"
            />
            {input.trim() && selectedService && (
              <Button 
                onClick={handleExpandText}
                disabled={isExpanding || isLoading}
                variant="outline"
                size="sm"
                className="ml-auto border-blue-500 text-blue-600 hover:bg-blue-50"
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
            )}
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isLoading || !input.trim() || !selectedService}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-semibold py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate from Database Templates
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Generated Content</CardTitle>
            <CardDescription className="text-green-600">
              Template: {result.templateUsed} | Category: {result.category}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Original Input:</h4>
              <p className="text-gray-600 bg-white p-3 rounded border">{result.originalInput}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Template Used:</h4>
              <p className="text-gray-600 bg-white p-3 rounded border text-sm">{result.composedPrompt}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Generated Result:</h4>
              <div className="bg-white p-4 rounded border">
                <div className="whitespace-pre-wrap text-gray-800">{result.generatedContent}</div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Generated at: {new Date(result.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}