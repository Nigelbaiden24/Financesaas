import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Sparkles, FileText, Presentation, Users, Smartphone, Download, Edit3, Share2 } from "lucide-react";

export function LaptopShowcase() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-yellow-600 mb-6 font-playfair">
            See Jenrate.Ai in Action
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Watch how our AI transforms your ideas into professional documents in seconds. 
            From pitch decks to CVs, our platform delivers stunning results.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Device mockups */}
          <div className="flex flex-col items-center space-y-8">
            {/* Tablet mockup - Document Creation Interface */}
            <div className="relative">
              <div className="relative bg-gray-200 rounded-3xl p-3 shadow-2xl">
                {/* Tablet screen bezel - more realistic with lighter frame */}
                <div className="bg-black rounded-2xl p-3">
                  {/* High-resolution screen content - more rectangular like real tablets */}
                  <div className="bg-black rounded-xl overflow-hidden" style={{ width: '480px', height: '320px' }}>
                    {/* Mock browser interface */}
                    <div className="bg-gray-900 p-2 flex items-center space-x-2 border-b border-gray-700">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-gray-800 rounded px-3 py-1 text-xs text-gray-300">
                        🔒 jenrate.ai/dashboard
                      </div>
                    </div>
                    
                    {/* Document Creation Interface */}
                    <div className="p-6 h-full bg-gradient-to-br from-white to-gray-50">
                      <div className="space-y-4">
                        {/* Header with logo */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-black" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 text-lg">Jenrate.Ai</span>
                              <div className="text-sm text-gray-600">Professional Document Generator</div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-600 text-sm">
                              Templates
                            </Button>
                            <Button size="sm" className="bg-yellow-500 text-black text-sm">
                              Dashboard
                            </Button>
                          </div>
                        </div>
                        
                        {/* Active Generation Interface */}
                        <div className="bg-white rounded-2xl border-2 border-yellow-400 shadow-lg p-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-black" />
                              </div>
                              <div>
                                <span className="text-gray-900 font-semibold text-lg">Creating Business Proposal</span>
                                <div className="text-yellow-600 text-sm">AI Generation in Progress...</div>
                              </div>
                            </div>
                            
                            {/* Input area */}
                            <div className="bg-gray-50 rounded-xl border border-yellow-500 p-4">
                              <div className="text-gray-900 text-sm leading-relaxed">
                                "Create a comprehensive business proposal for a sustainable energy consulting firm. Include executive summary, market analysis, service offerings, competitive landscape, and financial projections..."
                              </div>
                            </div>
                            
                            {/* Progress indicators */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-600 text-sm font-medium">Executive Summary Generated</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span className="text-yellow-600 text-sm font-medium">Market Analysis in Progress...</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <span className="text-gray-500 text-sm">Financial Projections Pending</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Recent documents preview */}
                        <div className="grid grid-cols-4 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-yellow-500 transition-colors shadow-sm">
                            <div className="aspect-square bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg mb-2 flex items-center justify-center">
                              <Presentation className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-xs text-gray-700 font-medium">Pitch Deck</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-yellow-500 transition-colors shadow-sm">
                            <div className="aspect-square bg-gradient-to-br from-green-500 to-green-700 rounded-lg mb-2 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-xs text-gray-700 font-medium">CV Resume</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-yellow-500 transition-colors shadow-sm">
                            <div className="aspect-square bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg mb-2 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-xs text-gray-700 font-medium">Report</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border-2 border-yellow-500 transition-colors shadow-md">
                            <div className="aspect-square bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg mb-2 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-black" />
                            </div>
                            <div className="text-xs text-yellow-600 font-medium">New</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow effect for tablet */}
              <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-2xl -z-10 scale-110"></div>
            </div>

            {/* iPhone mockup - Document Management */}
            <div className="relative">
              <div className="relative bg-gray-900 rounded-3xl p-2 shadow-2xl">
                {/* Phone screen */}
                <div className="bg-black rounded-3xl p-1">
                  <div className="bg-black rounded-2xl overflow-hidden" style={{ width: '200px', height: '400px' }}>
                    {/* Status bar */}
                    <div className="bg-black px-4 py-2 flex items-center justify-between">
                      <div className="text-white text-sm font-semibold">9:41</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-2 bg-white rounded-sm"></div>
                        <div className="w-1 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Mobile app content */}
                    <div className="px-4 py-4 bg-gradient-to-b from-black to-gray-900 h-full">
                      {/* Mobile header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-black" />
                          </div>
                          <span className="font-bold text-yellow-400 text-sm">Jenrate.Ai</span>
                        </div>
                        <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 text-xs">
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Quick actions */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-800 rounded-lg p-3 border border-yellow-500/30">
                          <FileText className="w-5 h-5 text-yellow-400 mb-1" />
                          <div className="text-white text-xs font-semibold">Create New</div>
                          <div className="text-gray-400 text-xs">AI Document</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <Download className="w-5 h-5 text-gray-400 mb-1" />
                          <div className="text-white text-xs font-semibold">Export</div>
                          <div className="text-gray-400 text-xs">PDF, Word</div>
                        </div>
                      </div>
                      
                      {/* Document list */}
                      <div className="space-y-2">
                        <div className="text-white font-semibold text-sm mb-2">Recent Documents</div>
                        
                        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-white font-semibold text-xs">Marketing Brochure</div>
                              <div className="text-gray-400 text-xs">Tech Startup • 3 pages</div>
                              <div className="text-yellow-400 text-xs mt-1">Ready to export</div>
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" className="p-1">
                                <Share2 className="w-3 h-3 text-gray-400" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-1">
                                <Download className="w-3 h-3 text-yellow-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-white font-semibold text-xs">Financial Report</div>
                              <div className="text-gray-400 text-xs">Q4 2024 • 12 pages</div>
                              <div className="text-green-400 text-xs mt-1">Completed</div>
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" className="p-1">
                                <Share2 className="w-3 h-3 text-gray-400" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-1">
                                <Download className="w-3 h-3 text-yellow-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-white font-semibold text-xs">Executive CV</div>
                              <div className="text-gray-400 text-xs">Professional • 2 pages</div>
                              <div className="text-blue-400 text-xs mt-1">Shared</div>
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" className="p-1">
                                <Share2 className="w-3 h-3 text-gray-400" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-1">
                                <Download className="w-3 h-3 text-yellow-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow effect for phone */}
              <div className="absolute inset-0 bg-yellow-500/15 rounded-3xl blur-xl -z-10 scale-105"></div>
            </div>
          </div>

          {/* Features list */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-yellow-500 p-2 rounded-lg">
                      <Sparkles className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                        AI-Powered Generation
                      </h3>
                      <p className="text-yellow-100">
                        Our advanced AI understands your requirements and creates professional documents 
                        tailored to your industry and needs.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-yellow-500 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                        Multiple Document Types
                      </h3>
                      <p className="text-yellow-100">
                        From pitch decks and CVs to brochures and reports - generate any business 
                        document with professional formatting and design.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-yellow-500 p-2 rounded-lg">
                      <Monitor className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                        Instant Results
                      </h3>
                      <p className="text-yellow-100">
                        Get professional-quality documents in seconds, not hours. Our AI works 
                        instantly to bring your ideas to life.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="pt-4">
              <Button 
                size="lg" 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                onClick={() => window.location.href = "#pricing"}
              >
                Try It Now - Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}