import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Workflow, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Clock,
  BarChart3,
  Bell,
  Monitor,
  Shield,
  Target,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  PieChart,
  Calculator,
  Lock,
  AlertTriangle,
  UserCheck,
  Briefcase,
  Activity,
  Database
} from "lucide-react";
import { useLocation } from "wouter";

export default function WorkflowTool() {
  const [, setLocation] = useLocation();
  const features = [
    {
      title: "Client Management",
      description: "Complete CRUD system for clients, households, and relationships",
      icon: Users,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Financial Planning",
      description: "Interactive scenario modeling with real-time projections",
      icon: Calculator,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Portfolio Analytics",
      description: "Advanced performance reporting and risk analysis",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Compliance Automation",
      description: "Automated workflows for KYC, suitability, and regulatory compliance",
      icon: Shield,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const capabilities = [
    {
      icon: Database,
      title: "Multi-Tenant Architecture",
      description: "Secure role-based access with adviser, paraplanner, and admin permissions for complete practice management"
    },
    {
      icon: Activity,
      title: "Real-Time Modeling",
      description: "Interactive cash flow projections and goal-based planning with dynamic charts that update as you adjust variables"
    },
    {
      icon: PieChart,
      title: "Portfolio Management",
      description: "Import holdings data, track performance, analyze asset allocation, and generate comprehensive reports"
    },
    {
      icon: FileText,
      title: "Document Generation",
      description: "Automated suitability reports, compliance documentation, and client communications with audit trails"
    }
  ];

  const workflowTypes = [
    { name: "Client Onboarding", icon: UserCheck, processes: "KYC checks, risk profiling, document collection, compliance verification" },
    { name: "Financial Planning", icon: Calculator, processes: "Goal setting, cash flow modeling, scenario analysis, recommendation generation" },
    { name: "Portfolio Review", icon: PieChart, processes: "Performance analysis, rebalancing recommendations, risk assessment, client reporting" },
    { name: "Compliance Management", icon: Shield, processes: "Suitability assessments, regulatory reporting, audit trails, documentation" },
    { name: "Practice Dashboard", icon: Monitor, processes: "Client pipeline, revenue tracking, task management, KPI monitoring" },
    { name: "Automated Reporting", icon: BarChart3, processes: "Client reports, performance summaries, compliance documentation, billing statements" }
  ];

  const benefits = [
    { metric: "85%", label: "Faster Client Onboarding", icon: UserCheck },
    { metric: "70%", label: "Planning Time Reduction", icon: Clock },
    { metric: "95%", label: "Compliance Accuracy", icon: Shield },
    { metric: "3x", label: "Client Capacity Increase", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4" data-testid="badge-financial-platform">
              Financial Planning & Practice Management Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-playfair">
              Comprehensive <span className="text-blue-600">Workflow</span> Platform
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Production-ready financial planning platform with client management, scenario modeling, 
              portfolio analytics, and compliance automation. Built for financial advisers and paraplanners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-start-platform"
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Launch Platform
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4"
                onClick={() => setLocation("/subscribe")}
                data-testid="button-view-demo"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Complete Financial Advisory Platform
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Everything you need to manage clients, create financial plans, track portfolios, 
              and ensure compliance in one integrated platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-white border-2 border-blue-200 hover:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feature.color}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-sm text-gray-700">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Capabilities */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Production-Ready Architecture
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Built with React, Express.js, and Drizzle ORM with secure session authentication. 
              Modern full-stack architecture with TypeScript and comprehensive integrations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <Card key={index} className="bg-white border hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{capability.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{capability.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Financial Workflows */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Financial Advisory Workflows
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Pre-built workflows for every aspect of financial advisory practice, 
              from client onboarding to compliance management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowTypes.map((workflow, index) => {
              const Icon = workflow.icon;
              return (
                <Card key={index} className="bg-white border hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.name}</h3>
                        <p className="text-sm text-gray-700">{workflow.processes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Interactive Financial Planning Demo
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Experience real-time scenario modeling with dynamic charts, interactive sliders, 
              and instant portfolio analysis in our working demo environment.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {[
              { 
                step: "01", 
                title: "Client Profile", 
                description: "Create detailed client profiles with goals, assets, liabilities, and risk tolerance" 
              },
              { 
                step: "02", 
                title: "Scenario Modeling", 
                description: "Use interactive sliders to adjust retirement age, contributions, and investment returns" 
              },
              { 
                step: "03", 
                title: "Real-Time Charts", 
                description: "Watch projections update instantly with dynamic visualization and performance metrics" 
              },
              { 
                step: "04", 
                title: "Generate Reports", 
                description: "Create professional suitability reports and compliance documentation with one click" 
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-700 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          
          {/* Interactive Demo Preview */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Live Scenario Modeling</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Retirement Age</label>
                    <div className="flex items-center space-x-2">
                      <input type="range" min="55" max="75" defaultValue="65" className="w-32" data-testid="slider-retirement-age" />
                      <span className="text-sm font-semibold text-blue-600">65</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Monthly Contribution</label>
                    <div className="flex items-center space-x-2">
                      <input type="range" min="500" max="5000" defaultValue="2000" className="w-32" data-testid="slider-contribution" />
                      <span className="text-sm font-semibold text-blue-600">£2,000</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Expected Return</label>
                    <div className="flex items-center space-x-2">
                      <input type="range" min="3" max="12" defaultValue="7" className="w-32" data-testid="slider-return-rate" />
                      <span className="text-sm font-semibold text-blue-600">7%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Projection Results</h3>
                <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Interactive charts update here</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">Portfolio Value</div>
                        <div className="text-2xl font-bold text-green-600">£1.2M</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Monthly Income</div>
                        <div className="text-2xl font-bold text-blue-600">£4,800</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Benefits */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-6 font-playfair">
              Transform Your Advisory Practice
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our Financial Planning Platform delivers measurable improvements to advisory practices, 
              enabling advisers to serve more clients with greater efficiency and better outcomes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-blue-400 mb-2">{benefit.metric}</div>
                  <div className="text-gray-300 font-medium">{benefit.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Enterprise-Grade Technology Stack
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Built with modern, scalable technologies and security best practices. 
              Containerized for easy deployment with complete API documentation and modular architecture.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Frontend", desc: "React 18, Vite, TailwindCSS, shadcn/ui", icon: Monitor },
              { name: "Backend", desc: "Node.js Express, TypeScript APIs", icon: Database },
              { name: "Database", desc: "PostgreSQL with Drizzle ORM", icon: Shield },
              { name: "Authentication", desc: "Session-based, OAuth integrations", icon: Lock },
              { name: "State Management", desc: "TanStack Query, React Hook Form", icon: BarChart3 },
              { name: "Integrations", desc: "OpenAI, Stripe, Object Storage", icon: CheckCircle }
            ].map((tech, index) => {
              const Icon = tech.icon;
              return (
                <Card key={index} className="bg-white border hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6 text-center">
                    <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">{tech.name}</h3>
                    <p className="text-sm text-gray-600">{tech.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
            Ready to Transform Your Advisory Practice?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Get started with our comprehensive financial planning platform. 
            Complete with working demos, dummy data, and production-ready features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-launch-platform"
            >
              Launch Demo Platform
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4"
              onClick={() => setLocation("/subscribe")}
              data-testid="button-get-access"
            >
              Get Full Access
            </Button>
          </div>
          
          {/* Feature Highlights */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Database className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Complete CRUD Operations</h3>
              <p className="text-sm text-gray-600">Full client management with households, assets, liabilities, and document storage</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Activity className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Interactive Scenarios</h3>
              <p className="text-sm text-gray-600">Real-time cash flow modeling with sliders, charts, and what-if analysis</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Shield className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Compliance Ready</h3>
              <p className="text-sm text-gray-600">Automated suitability reports, audit trails, and regulatory documentation</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}