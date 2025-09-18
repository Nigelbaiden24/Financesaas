import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Workflow, 
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Shield
} from "lucide-react";
import { Link } from "wouter";

export default function Solutions() {
  const solutionsData = [
    {
      title: "AI Generation Tool",
      description: "Advanced AI-powered document generation with intelligent content creation and template optimization for professional business documents.",
      icon: Sparkles,
      path: "/solutions/ai-generation",
      features: ["Smart Template Selection", "AI Content Generation", "Professional Formatting", "Multi-format Export"],
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Workflow Tool",
      description: "Streamline business processes with automated workflow management, task routing, and team collaboration features.",
      icon: Workflow,
      path: "/solutions/workflow",
      features: ["Process Automation", "Task Management", "Team Collaboration", "Progress Tracking"],
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Outsourced Paraplanning",
      description: "Comprehensive paraplanning services for financial advisers, providing professional research, compliance, and client documentation support.",
      icon: Shield,
      path: "/solutions/consultancy",
      features: ["Suitability Assessments", "Fact Find Data Packs", "Research & Analysis", "Compliance Support"],
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-playfair">
              Business <span className="text-yellow-600">Solutions</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Comprehensive suite of AI-powered business solutions designed to streamline operations, 
              enhance productivity, and drive growth across your organization.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutionsData.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <Card 
                  key={index}
                  className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`bg-gradient-to-r ${solution.color} w-16 h-16 rounded-xl flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link href={solution.path} data-testid={`link-${solution.title.toLowerCase().replace(/\s+/g, '-')}`}>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-playfair">
                      {solution.title}
                    </h3>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {solution.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {solution.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                      asChild
                      data-testid={`button-explore-${solution.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={solution.path}>
                        Explore {solution.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Why Choose Our Solutions?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Integrated solutions that work seamlessly together to transform your business operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-700">
                Process tasks in seconds, not hours. Our AI-powered solutions deliver instant results 
                with enterprise-grade performance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Precision Focused</h3>
              <p className="text-gray-700">
                Each solution is specifically designed for your business needs with industry-specific 
                features and customization options.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Growth Driven</h3>
              <p className="text-gray-700">
                Built to scale with your business, our solutions grow with you and adapt to 
                changing requirements and expanding teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 font-playfair">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start with any of our solutions and experience the power of AI-driven business automation.
          </p>
          <Button 
            size="lg"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4"
            onClick={() => window.location.href = "/dashboard"}
            data-testid="button-get-started"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}