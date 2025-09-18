import Header from "@/components/header";
import Footer from "@/components/footer";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  BarChart3,
  Sparkles,
  CheckCircle,
  Star,
  Building2
} from "lucide-react";
import financeImageUrl from "@assets/generated_images/Finance_boardroom_meeting_London_2e9fda89.png";

export default function Home() {
  const services = [
    {
      title: "AI Document Generation",
      description: "Transform your client communication with AI-powered document creation. Generate sophisticated pitch decks, investment proposals, due diligence reports, and client presentations that meet institutional standards. Our advanced algorithms understand financial terminology, regulatory requirements, and client expectations to produce documents that enhance your professional credibility and streamline your workflow.",
      icon: Sparkles,
      color: "bg-gray-100 text-gray-800",
      features: ["Institutional-grade templates", "Regulatory compliance built-in", "Multi-format export", "Real-time collaboration"]
    },
    {
      title: "HNWI Lead Generation",
      description: "Leverage sophisticated targeting algorithms to identify and connect with qualified high-net-worth individuals. Our platform analyzes wealth indicators, investment patterns, and behavioral data to help you build a pipeline of prospects who match your ideal client profile. Advanced CRM integration ensures seamless follow-up and relationship management.",
      icon: Users,
      color: "bg-gray-100 text-gray-800",
      features: ["Wealth verification systems", "Behavioral analysis", "CRM integration", "Compliance tracking"]
    },
    {
      title: "Regulatory Compliance Consultancy",
      description: "Navigate the complex regulatory landscape with confidence. Our expert consultancy provides comprehensive FCA, MiFID II, and AML compliance guidance tailored specifically for investment professionals. From policy development to audit preparation, we ensure your practice meets all regulatory requirements while maintaining operational efficiency.",
      icon: Shield,
      color: "bg-gray-100 text-gray-800",
      features: ["FCA compliance frameworks", "MiFID II implementation", "AML monitoring", "Audit preparation"]
    },
    {
      title: "Financial Analytics & Reporting",
      description: "Gain deeper insights into portfolio performance, risk exposure, and client behavior with our advanced analytics platform. Real-time data visualization, predictive modeling, and customizable reporting tools help you make informed investment decisions and provide superior client service. Integration with major custodians and data providers ensures accuracy and timeliness.",
      icon: BarChart3,
      color: "bg-gray-100 text-gray-800",
      features: ["Real-time portfolio analysis", "Risk assessment tools", "Performance attribution", "Client reporting automation"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Dynamic Hero Section with Professional Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${financeImageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto">
            <Badge className="bg-white/10 text-white border-white/20 mb-8 px-6 py-3 text-sm tracking-wide" data-testid="badge-hero">
              TRUSTED BY LEADING INVESTMENT PROFESSIONALS
            </Badge>
            
            <h1 className="text-5xl md:text-8xl font-light text-white mb-10 tracking-tight leading-none" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Sophisticated <span className="font-normal">AI Solutions</span> for 
              <br />Elite Investment Services
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              Transform your wealth management practice with institutional-grade AI technology. 
              Purpose-built for investment professionals managing substantial portfolios for discerning 
              high-net-worth clients who demand excellence in every interaction.
            </p>
            
          </div>
        </div>
      </section>

      {/* Professional Services Section */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="bg-gray-100 text-gray-800 mb-6 px-4 py-2 tracking-wide" data-testid="badge-services">
              INSTITUTIONAL-GRADE TECHNOLOGY
            </Badge>
            <h2 className="text-4xl md:text-6xl font-light text-black mb-8 tracking-tight leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Purpose-Built Solutions for 
              <br />Investment Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Our comprehensive suite of AI-powered tools addresses the unique challenges faced by investment 
              professionals managing substantial wealth for sophisticated clients. Each solution is meticulously 
              crafted to enhance your practice's efficiency, compliance, and client service capabilities.
            </p>
          </div>
          
          <div className="space-y-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="grid md:grid-cols-2 gap-12 items-center">
                  <div className={index % 2 === 1 ? "md:order-2" : ""}>
                    <div className="flex items-center mb-6">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mr-6 ${service.color}`}>
                        <Icon className="w-10 h-10" />
                      </div>
                      <h3 className="text-3xl font-light text-black tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed mb-8 font-light">
                      {service.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-black mr-3 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`bg-gray-50 rounded-3xl p-8 ${index % 2 === 1 ? "md:order-1" : ""}`}>
                    <div className="aspect-video bg-white rounded-2xl shadow-lg flex items-center justify-center">
                      <Icon className="w-24 h-24 text-gray-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Expertise & Commitment Section */}
      <section className="py-32 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="bg-white/10 text-white border-white/20 mb-6 px-4 py-2 tracking-wide" data-testid="badge-clientele">
              SERVING ELITE INVESTMENT PROFESSIONALS
            </Badge>
            <h2 className="text-4xl md:text-6xl font-light text-white mb-8 tracking-tight leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Designed for HNWI 
              <br />Investment Excellence
            </h2>
            <p className="text-xl text-gray-300 mb-16 max-w-5xl mx-auto leading-relaxed font-light">
              Our platform represents the pinnacle of financial technology, meticulously engineered for investment 
              professionals who manage substantial wealth for the world's most discerning clients. From family offices 
              overseeing generational wealth to boutique advisory firms serving ultra-high-net-worth individuals, 
              we deliver the sophistication, security, and discretion that defines exceptional wealth management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <div className="text-center">
              <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <Building2 className="w-12 h-12 text-black" />
              </div>
              <h3 className="text-2xl font-light text-white mb-6 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Institutional Standards
              </h3>
              <p className="text-gray-300 leading-relaxed font-light text-lg">
                Every document, report, and presentation generated through our platform meets the rigorous 
                standards expected by institutional investors, regulatory bodies, and sophisticated family offices. 
                Our AI understands the nuances of financial communication and regulatory requirements across 
                multiple jurisdictions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <Shield className="w-12 h-12 text-black" />
              </div>
              <h3 className="text-2xl font-light text-white mb-6 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Regulatory Excellence
              </h3>
              <p className="text-gray-300 leading-relaxed font-light text-lg">
                Navigate complex regulatory landscapes with confidence. Our comprehensive compliance framework 
                encompasses FCA regulations, MiFID II requirements, anti-money laundering protocols, and 
                international best practices. Built-in safeguards ensure every client interaction maintains 
                the highest standards of regulatory compliance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <Star className="w-12 h-12 text-black" />
              </div>
              <h3 className="text-2xl font-light text-white mb-6 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Exceptional Service
              </h3>
              <p className="text-gray-300 leading-relaxed font-light text-lg">
                Deliver the extraordinary level of service that high-net-worth clients expect and deserve. 
                Our platform enables you to provide personalized attention, rapid response times, and 
                sophisticated solutions that reflect the caliber of your practice and the quality of 
                your client relationships.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-3xl font-light text-white mb-8 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Elevate Your Practice
            </h3>
            <p className="text-lg text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Join the select group of investment professionals who leverage our institutional-grade platform 
              to enhance their service delivery and operational excellence.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
