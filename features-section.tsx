import { Sparkles, Zap, FileText, MessageCircle, Palette, Download } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Advanced AI understands your prompts and generates professional content that matches your brand and style perfectly."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Create professional documents in seconds, not hours. Our AI works instantly to deliver high-quality results."
    },
    {
      icon: FileText,
      title: "Multiple Formats",
      description: "Generate pitch decks, resumes, brochures, reports, and more. All professionally designed and AI-powered."
    },
    {
      icon: Palette,
      title: "Fully Customizable",
      description: "Every element is editable. Adjust colors, fonts, layouts, and content to match your exact requirements."
    },
    {
      icon: Download,
      title: "Export Anywhere",
      description: "Download in multiple formats: PDF, PowerPoint, Word, or share directly with your team and clients."
    },
    {
      icon: MessageCircle,
      title: "Live Chat Support",
      description: "Get instant help with templates, AI generation, or design questions from our expert support team."
    }
  ];

  return (
    <section id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create stunning business documents, presentations, and marketing materials with the power of AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Workflow?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of professionals who save hours every week with our AI-powered design platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors">
                Start Free Trial
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
