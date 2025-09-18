import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  FileCheck, 
  Users, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  Clock,
  Award,
  Building2,
  BarChart3,
  Search,
  FileText,
  AlertTriangle,
  Calculator,
  Target
} from "lucide-react";

export default function Consultancy() {
  const services = [
    {
      title: "Suitability Assessments & Reports",
      description: "Comprehensive suitability analysis and report preparation ensuring regulatory compliance and client best interests",
      icon: FileCheck,
      color: "bg-blue-100 text-blue-600",
      features: ["Client Risk Profiling", "Product Suitability Analysis", "Regulatory Compliance", "Professional Reporting"]
    },
    {
      title: "Fact Find & Data Packs", 
      description: "Detailed client data gathering and comprehensive fact-finding to support informed financial planning decisions",
      icon: Search,
      color: "bg-green-100 text-green-600",
      features: ["Client Information Gathering", "Financial Position Analysis", "Objective Setting", "Data Validation"]
    },
    {
      title: "Research & Analysis",
      description: "In-depth market research, product analysis, and investment evaluation to support advisor recommendations",
      icon: BarChart3,
      color: "bg-purple-100 text-purple-600",
      features: ["Market Research", "Product Comparison", "Performance Analysis", "Risk Assessment"]
    },
    {
      title: "Illustration & Quote Gathering",
      description: "Professional illustration preparation and comprehensive quote gathering across multiple providers",
      icon: Calculator,
      color: "bg-orange-100 text-orange-600",
      features: ["Product Illustrations", "Multi-Provider Quotes", "Cost Analysis", "Benefit Comparisons"]
    },
    {
      title: "Scenario & Stress Testing",
      description: "Comprehensive scenario modeling and stress testing to evaluate portfolio resilience and outcomes",
      icon: Target,
      color: "bg-red-100 text-red-600",
      features: ["Scenario Modeling", "Stress Testing", "Risk Analysis", "Outcome Projections"]
    },
    {
      title: "Compliance & Report Preparation",
      description: "Professional report writing and compliance documentation ensuring regulatory standards are met",
      icon: Shield,
      color: "bg-indigo-100 text-indigo-600",
      features: ["Regulatory Compliance", "Professional Reports", "Documentation", "Quality Assurance"]
    }
  ];

  const expertise = [
    {
      icon: Building2,
      title: "Investment Planning",
      description: "Comprehensive investment analysis and portfolio construction support for high net worth clients"
    },
    {
      icon: Users,
      title: "Pension Planning",
      description: "Specialist pension transfer analysis, scheme comparisons, and retirement planning solutions"
    },
    {
      icon: TrendingUp,
      title: "Protection Planning",
      description: "Life insurance, critical illness, and income protection analysis and recommendation support"
    },
    {
      icon: FileText,
      title: "Estate Planning",
      description: "Inheritance tax planning, trust analysis, and estate structuring for wealth preservation"
    }
  ];

  const benefits = [
    { metric: "500+", label: "Reports Completed", icon: FileCheck },
    { metric: "50+", label: "Financial Advisers Supported", icon: Users },
    { metric: "10+", label: "Years Paraplanning Experience", icon: Award },
    { metric: "48hr", label: "Turnaround Time", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4" data-testid="badge-paraplanning">
              Professional Paraplanning Services
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-playfair">
              Outsourced <span className="text-blue-600">Paraplanning</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Professional paraplanning support for financial advisers. From suitability reports to compliance 
              documentation, we provide comprehensive back-office services to enhance your client proposition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4"
                onClick={() => window.location.href = "/dashboard"}
                data-testid="button-start-service"
              >
                <FileCheck className="mr-2 h-5 w-5" />
                Start Service
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4"
                onClick={() => window.location.href = "/about"}
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Comprehensive Paraplanning Services
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Professional paraplanning support covering all aspects of financial planning, 
              from initial fact-finding through to final compliance documentation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="bg-white border-2 border-blue-200 hover:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${service.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">{service.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specialist Areas */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Specialist Planning Areas
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Expert knowledge across all major financial planning disciplines, 
              providing comprehensive support for complex client cases.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {expertise.map((area, index) => {
              const Icon = area.icon;
              return (
                <Card key={index} className="bg-white border hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{area.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{area.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Additional Paraplanning Services
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Comprehensive support services to enhance your financial planning practice and client experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Portfolio Reviews", desc: "Comprehensive portfolio analysis and rebalancing recommendations" },
              { name: "Annual Reviews", desc: "Complete client review preparation and documentation" },
              { name: "Pension Transfer Analysis", desc: "DB to DC transfer analysis and reporting" },
              { name: "Adviser Charging", desc: "Fee analysis and charging structure recommendations" },
              { name: "Cash Flow Modeling", desc: "Lifetime cash flow projections and planning" },
              { name: "Fund Research", desc: "Investment fund analysis and due diligence" },
              { name: "Document Templates", desc: "Professional client communication templates" },
              { name: "Regulatory Updates", desc: "Ongoing regulatory change impact analysis" },
              { name: "Training Support", desc: "Technical training and professional development" }
            ].map((service, index) => (
              <Card key={index} className="bg-white border hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Track Record */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-6 font-playfair">
              Proven Paraplanning Excellence
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Delivering professional paraplanning services to financial advisers 
              across the UK, supporting high-quality client outcomes.
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

      {/* Call to Action */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
            Ready to Enhance Your Advisory Practice?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Partner with our professional paraplanning team to deliver exceptional client outcomes 
            while focusing on business development and client relationships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4"
              onClick={() => window.location.href = "/dashboard"}
              data-testid="button-start-paraplanning"
            >
              Start Paraplanning Service
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4"
              onClick={() => window.location.href = "/subscribe"}
              data-testid="button-view-packages"
            >
              View Service Packages
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}