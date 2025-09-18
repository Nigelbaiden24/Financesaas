import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Presentation, Image, BarChart, FileSpreadsheet, FileCheck, Book, Mail, Receipt, Briefcase, Gift, Sparkles } from "lucide-react";

export default function AIToolsSection() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTool, setSelectedTool] = useState("");

  const categories = [
    { key: "all", label: "All Tools", icon: Sparkles },
    { key: "presentations", label: "Presentations", icon: Presentation },
    { key: "documents", label: "Documents", icon: FileCheck },
    { key: "marketing", label: "Marketing", icon: Image },
    { key: "analytics", label: "Analytics", icon: BarChart },
    { key: "financial", label: "Financial", icon: Receipt },
    { key: "reports", label: "Reports", icon: FileSpreadsheet },
    { key: "content", label: "Content", icon: Book },
    { key: "communication", label: "Communication", icon: Mail },
    { key: "business", label: "Business", icon: Briefcase }
  ];

  const aiTools = [
    {
      id: "pitch-deck",
      name: "Pitch Deck Generator",
      description: "Create compelling investor presentations with AI-generated content and professional layouts",
      category: "presentations",
      icon: Presentation,
      color: "bg-blue-500",
      tags: ["startup", "investor", "presentation"]
    },
    {
      id: "resume-builder",
      name: "CV Builder",
      description: "Build professional CVs tailored to your industry with AI-powered content suggestions",
      category: "documents",
      icon: FileCheck,
      color: "bg-green-500",
      tags: ["career", "professional", "cv"]
    },
    {
      id: "brochure-designer",
      name: "Brochure Designer",
      description: "Design eye-catching marketing brochures with AI-generated copy and layouts",
      category: "marketing",
      icon: Image,
      color: "bg-purple-500",
      tags: ["marketing", "design", "print"]
    },
    {
      id: "report-generator",
      name: "Report Generator",
      description: "Generate comprehensive business reports with data analysis and insights",
      category: "reports",
      icon: FileSpreadsheet,
      color: "bg-orange-500",
      tags: ["analytics", "business", "data"]
    },
    {
      id: "invoice-creator",
      name: "Invoice Creator",
      description: "Create professional invoices with automated calculations and customizable designs",
      category: "financial",
      icon: Receipt,
      color: "bg-emerald-500",
      tags: ["finance", "billing", "business"]
    },
    {
      id: "business-plan",
      name: "Business Plan Creator",
      description: "Develop comprehensive business plans with AI-powered market analysis and projections",
      category: "business",
      icon: Briefcase,
      color: "bg-red-500",
      tags: ["strategy", "planning", "startup"]
    },
    {
      id: "ebook-creator",
      name: "E-book Creator",
      description: "Generate comprehensive e-books with structured content and professional formatting",
      category: "content",
      icon: Book,
      color: "bg-indigo-500",
      tags: ["publishing", "content", "writing"]
    },
    {
      id: "newsletter-designer",
      name: "Newsletter Designer",
      description: "Create engaging newsletters with AI-generated content and eye-catching layouts",
      category: "communication",
      icon: Mail,
      color: "bg-pink-500",
      tags: ["email", "marketing", "content"]
    },
    {
      id: "chart-generator",
      name: "Chart & Graph Generator",
      description: "Create professional charts and graphs with data visualization and insights",
      category: "analytics",
      icon: BarChart,
      color: "bg-cyan-500",
      tags: ["data", "visualization", "analytics"]
    }
  ];

  const filteredTools = selectedCategory === "all" 
    ? aiTools 
    : aiTools.filter(tool => tool.category === selectedCategory);

  return (
    <section id="ai-tools" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Creation Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose from our intelligent AI tools to create professional documents instantly. 
            Each tool understands your needs and generates content tailored to your requirements.
          </p>
          
          {/* Quick Tool Selector */}
          <div className="max-w-md mx-auto">
            <Select value={selectedTool} onValueChange={setSelectedTool}>
              <SelectTrigger className="w-full h-12 text-lg border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Quick select an AI tool..." />
              </SelectTrigger>
              <SelectContent>
                {aiTools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <SelectItem key={tool.id} value={tool.id}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {tool.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 max-w-6xl mx-auto">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                variant={selectedCategory === category.key ? "default" : "outline"}
                className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category.key
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* AI Tools Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <div
                key={tool.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mr-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {tool.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tool.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full text-lg font-semibold"
          >
            Explore All AI Tools
          </Button>
        </div>
      </div>
    </section>
  );
}