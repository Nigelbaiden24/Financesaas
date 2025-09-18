import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Users, Shield, Lightbulb, Award, ArrowRight, CheckCircle, Presentation, FileText, Receipt, Book, Mail, BarChart, Briefcase, FileSpreadsheet, TrendingUp, Image, FileCheck, Building2, DollarSign } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-playfair">
              About <span className="text-yellow-600">Jenrate.Ai</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Revolutionizing business document creation through advanced artificial intelligence, 
              empowering professionals to generate high-quality content in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white border-yellow-500/30 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <Target className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-6 font-playfair">Our Mission</h2>
                <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                  To democratize professional document creation by leveraging cutting-edge artificial intelligence, 
                  enabling businesses of all sizes to produce exceptional presentations, reports, and marketing materials 
                  that drive results and accelerate growth.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Complete Services Overview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">Complete Document Generation Suite</h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Jenrate.Ai provides 14 specialized AI-powered document generation services, each designed to create 
              professional, industry-specific content that drives business results and accelerates growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {/* Pitch Deck Generator */}
            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Presentation className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Pitch Deck Generator</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Create compelling investor presentations with financial projections, market analysis, and strategic roadmaps.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  Series A • Series B • IPO Ready • Acquisition Pitches
                </div>
              </CardContent>
            </Card>

            {/* CV & Resume Builder */}
            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">CV & Resume Builder</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Professional resumes and CVs tailored for specific industries, roles, and career levels.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  Executive • Technical • Marketing • Finance • Fresh Graduate
                </div>
              </CardContent>
            </Card>

            {/* Business Brochure Designer */}
            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Business Brochure Designer</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Marketing brochures showcasing products, services, and company capabilities with compelling visuals.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  Product • Corporate • Medical • Technology • Manufacturing
                </div>
              </CardContent>
            </Card>

            {/* Report Generator */}
            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Report Generator</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Comprehensive business reports with analytics, performance metrics, and strategic insights.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  Quarterly • Annual • Market Analysis • Compliance • Performance
                </div>
              </CardContent>
            </Card>

            {/* Invoice Creator */}
            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Invoice Creator</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Professional invoices with detailed service breakdowns, payment terms, and milestone structures.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  Service • Product • Consulting • Enterprise • Multi-Phase
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Designer */}
            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Newsletter Designer</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Engaging newsletters for customer communication, investor updates, and team announcements.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  Customer • Investor • Employee • Industry • Community
                </div>
              </CardContent>
            </Card>

            {/* Business Proposal */}
            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Business Proposal</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Comprehensive proposals for partnerships, contracts, and strategic business initiatives.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  Partnership • Contract • Government • Enterprise • M&A
                </div>
              </CardContent>
            </Card>

            {/* Financial Report */}
            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Financial Report</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Detailed financial analysis with performance metrics, budget breakdowns, and projections.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  P&L • Cash Flow • Investment • Budget • Compliance
                </div>
              </CardContent>
            </Card>

            {/* Chart & Graph Generator */}
            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Chart & Graph Generator</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Data visualizations and charts that transform complex information into clear insights.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  Performance • Trends • Comparison • Forecasting • Analytics
                </div>
              </CardContent>
            </Card>

            {/* Additional Services */}
            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Compliance Documents</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Regulatory compliance documents, audit reports, and policy documentation.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  GDPR • SOX • FDA • Banking • Healthcare
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Company Profiles</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Professional company overviews, capability statements, and corporate presentations.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  About Us • Capabilities • Team • History • Values
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Data Analytics Reports</h3>
                <p className="text-sm text-gray-700 mb-4">
                  In-depth analytics reports with insights, trends, and actionable recommendations.
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  KPIs • Metrics • Benchmarking • Forecasting • ROI
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Value Proposition Section */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-8 border-2 border-yellow-300">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 font-playfair">Why Choose Jenrate.Ai?</h3>
              <p className="text-lg text-gray-700 max-w-4xl mx-auto">
                Transform your document creation process with AI-powered intelligence that delivers professional results in seconds, not hours.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-black" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Intelligence</h4>
                <p className="text-gray-700 text-sm">
                  GPT-4o enhanced with live web data ensures your documents contain current, relevant, and accurate information tailored to your industry.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-black" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Industry-Specific Templates</h4>
                <p className="text-gray-700 text-sm">
                  50+ professionally designed templates optimized for different industries, from healthcare to fintech, ensuring perfect formatting every time.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-black" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Enterprise Security</h4>
                <p className="text-gray-700 text-sm">
                  Bank-level encryption, GDPR compliance, and secure cloud infrastructure protect your sensitive business data throughout the process.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-black" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Professional Results</h4>
                <p className="text-gray-700 text-sm">
                  99.7% accuracy rate with documents that meet Fortune 500 standards, ready for boardroom presentations and investor meetings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-playfair">How It Works</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our streamlined process makes professional document creation effortless and efficient.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Describe Your Vision</h3>
              <p className="text-gray-700">
                Simply tell us what you want to create using natural language. Our AI understands 
                context, industry requirements, and specific details.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Processing</h3>
              <p className="text-gray-700">
                Our advanced AI analyzes your requirements, selects appropriate templates, and 
                generates professional content tailored to your specifications.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Results</h3>
              <p className="text-gray-700">
                Receive your professionally formatted document in seconds, ready for presentation, 
                sharing, or further customization as needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Innovation */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white border-yellow-500 shadow-lg">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Lightbulb className="w-12 h-12 text-yellow-600 mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 font-playfair">Technology & Innovation</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Jenrate.Ai leverages state-of-the-art artificial intelligence technologies to deliver 
                    unprecedented document generation capabilities. Our platform combines advanced natural 
                    language processing, intelligent template selection, and sector-specific optimization 
                    to produce documents that meet professional standards across industries.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-600">
                      <Award className="w-5 h-5 mr-3 text-yellow-600" />
                      OpenAI GPT-4o integration for superior content quality
                    </li>
                    <li className="flex items-center text-gray-600">
                      <Award className="w-5 h-5 mr-3 text-yellow-600" />
                      Proprietary template optimization algorithms
                    </li>
                    <li className="flex items-center text-gray-600">
                      <Award className="w-5 h-5 mr-3 text-yellow-600" />
                      Real-time processing and instant delivery
                    </li>
                    <li className="flex items-center text-gray-600">
                      <Award className="w-5 h-5 mr-3 text-yellow-600" />
                      Continuous learning and improvement systems
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-8 border border-yellow-300">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-yellow-600">99.7%</div>
                      <div className="text-gray-700 text-sm font-medium">Document generation accuracy</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-600">&lt;10s</div>
                      <div className="text-gray-700 text-sm font-medium">Average generation time</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-600">14+</div>
                      <div className="text-gray-700 text-sm font-medium">Document types supported</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-600">50+</div>
                      <div className="text-gray-700 text-sm font-medium">Industry templates available</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 font-playfair">
            Ready to Transform Your Document Creation?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have revolutionized their workflow with Jenrate.Ai. 
            Start creating professional documents in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4"
              onClick={() => window.location.href = "/"}
              data-testid="button-start-generating"
            >
              Start Generating Documents
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-8 py-4"
              onClick={() => window.location.href = "/pricing"}
              data-testid="button-view-pricing"
            >
              View Pricing Plans
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}