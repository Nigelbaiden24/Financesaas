import { DatabaseTemplateGenerator } from "@/components/database-template-generator";

export default function DatabaseGeneratorPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Database Template Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate professional content using templates stored in your Replit database. 
            Select a category and provide your input to create customized content with AI.
          </p>
        </div>
        
        <DatabaseTemplateGenerator />
      </div>
    </div>
  );
}