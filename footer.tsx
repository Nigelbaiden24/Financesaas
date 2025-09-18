import { Sparkles, Facebook, Instagram, Twitter, Send, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="text-yellow-600 text-2xl" />
              <h3 className="text-xl font-bold">Jenrate.Ai</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Empowering professionals to create stunning business documents and marketing materials with the power of AI.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a></li>
              <li><a href="#templates" className="text-gray-600 hover:text-gray-900 transition-colors">Templates</a></li>
              <li><a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Generators */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Document Generators</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Pitch Deck Generator</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Resume Builder</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Business Plan Creator</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Brochure Designer</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Report Generator</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Invoice Creator</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-sm">support@jenrate.ai</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">+1 (555) 987-6543</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">24/7 AI Support Available</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h5 className="font-medium mb-2">Stay Updated</h5>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-white border border-gray-300 rounded-l-md text-sm placeholder-gray-400 text-gray-900 focus:ring-yellow-500/20"
                />
                <Button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-r-md transition-colors rounded-l-none">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Jenrate.Ai. All rights reserved. | Privacy Policy | Terms of Service | API Terms</p>
        </div>
      </div>
    </footer>
  );
}
