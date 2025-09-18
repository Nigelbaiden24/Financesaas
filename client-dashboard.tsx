import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Clock,
  Sparkles,
  Languages,
  TrendingUp,
  Calendar,
  RefreshCw,
  Edit3,
  Globe,
  BarChart3,
  User,
  CreditCard,
  Settings,
  Upload,
  ArrowLeft,
  FileCheck,
  AlertCircle,
  Star
} from "lucide-react";

interface DashboardStats {
  totalDocuments: number;
  documentsThisMonth: number;
  totalDownloads: number;
  downloadsThisMonth: number;
  monthlyUsage: number;
  planLimit: number;
  currentPlan: string;
  planExpiry: string;
}

interface Document {
  id: string;
  title: string;
  serviceType: string;
  status: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RewriteOptions {
  type: "tone_change" | "content_expansion" | "simplification" | "professional" | "casual" | "custom";
  label: string;
  description: string;
}

interface DocumentReview {
  id: string;
  filename: string;
  serviceType: string;
  score: number;
  rating: number;
  summary: string;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
  createdAt: string;
}

interface ServiceOption {
  value: string;
  label: string;
  description: string;
}

const languageOptions = [
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  // Pro and Agency tiers get additional languages
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
];

const serviceOptions: ServiceOption[] = [
  { value: "cv", label: "CV/Resume", description: "Professional resume and CV review" },
  { value: "pitch-deck", label: "Pitch Deck", description: "Business presentation and pitch deck analysis" },
  { value: "brochure", label: "Brochure", description: "Marketing brochure and promotional material review" },
  { value: "report", label: "Business Report", description: "Comprehensive business report evaluation" },
  { value: "newsletter", label: "Newsletter", description: "Newsletter content and design review" },
  { value: "invoice", label: "Invoice", description: "Invoice format and content assessment" },
  { value: "general", label: "General Document", description: "General document review and analysis" },
];

export default function ClientDashboard() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rewriteType, setRewriteType] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedService, setSelectedService] = useState<string>("");
  const [uploadReviews, setUploadReviews] = useState<DocumentReview[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's subscription plan for feature restrictions
  const getUserPlan = () => {
    return stats?.currentPlan?.toLowerCase() || "starter";
  };

  // Check if user has access to specific features based on their plan
  const hasFeatureAccess = (feature: string) => {
    const plan = getUserPlan();
    const featureAccess = {
      "document_rewrite": ["pro", "agency"],
      "advanced_rewrite": ["agency"],
      "translation": ["pro", "agency"],
      "advanced_translation": ["agency"],
      "document_review": ["pro", "agency"],
      "comprehensive_review": ["agency"],
      "usage_analytics": ["pro", "agency"],
      "advanced_analytics": ["agency"],
      "team_collaboration": ["agency"],
      "unlimited_history": ["agency"],
      "priority_support": ["agency"],
    };
    return featureAccess[feature]?.includes(plan) || false;
  };

  // Define available rewrite options based on user's plan
  const getRewriteOptions = () => {
    const baseOptions = [
      { type: "professional", label: "Professional Tone", description: "Make content more formal and business-appropriate" },
      { type: "casual", label: "Casual Tone", description: "Make content more conversational and friendly" },
      { type: "simplification", label: "Simplify", description: "Make content easier to understand and more concise" },
    ];

    if (hasFeatureAccess("document_rewrite")) {
      baseOptions.push(
        { type: "content_expansion", label: "Expand Content", description: "Add more details and elaborate on existing content" },
        { type: "tone_change", label: "Change Tone", description: "Adjust the overall tone and style of the content" }
      );
    }

    if (hasFeatureAccess("advanced_rewrite")) {
      baseOptions.push({ type: "custom", label: "Custom Rewrite", description: "Provide specific instructions for rewriting" });
    }

    return baseOptions;
  };

  // Filter language options based on plan
  const getAvailableLanguages = () => {
    const basicLanguages = languageOptions.slice(0, 9); // First 9 languages
    
    if (hasFeatureAccess("translation")) {
      return languageOptions; // All languages for Pro and Agency
    }
    
    return basicLanguages; // Basic languages for Starter
  };

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch user documents
  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Rewrite document mutation
  const rewriteMutation = useMutation({
    mutationFn: async ({ documentId, rewriteType, prompt }: { documentId: string; rewriteType: string; prompt: string }) => {
      return apiRequest("POST", `/api/documents/${documentId}/rewrite`, {
        rewriteType,
        rewritePrompt: prompt,
      });
    },
    onSuccess: () => {
      toast({
        title: "Document Rewritten",
        description: "Your document has been successfully rewritten with AI improvements.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setSelectedDocument(null);
      setRewriteType("");
      setCustomPrompt("");
    },
    onError: () => {
      toast({
        title: "Rewrite Failed",
        description: "Failed to rewrite document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Translate document mutation
  const translateMutation = useMutation({
    mutationFn: async ({ documentId, targetLanguage }: { documentId: string; targetLanguage: string }) => {
      return apiRequest("POST", `/api/documents/${documentId}/translate`, {
        targetLanguage,
      });
    },
    onSuccess: () => {
      toast({
        title: "Document Translated",
        description: "Your document has been successfully translated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setSelectedDocument(null);
      setSelectedLanguage("");
    },
    onError: () => {
      toast({
        title: "Translation Failed",
        description: "Failed to translate document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload and review document mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, serviceType }: { file: File; serviceType: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("serviceType", serviceType);
      
      const response = await fetch("/api/documents/upload-review", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document Reviewed",
        description: "Your document has been successfully uploaded and reviewed by AI.",
      });
      setUploadReviews(prev => [data, ...prev]);
      setUploadFile(null);
      setSelectedService("");
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload and review document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRewrite = () => {
    if (!selectedDocument || !rewriteType) return;
    
    const prompt = rewriteType === "custom" ? customPrompt : rewriteOptions.find(opt => opt.type === rewriteType)?.description || "";
    
    rewriteMutation.mutate({
      documentId: selectedDocument.id,
      rewriteType,
      prompt,
    });
  };

  const handleTranslate = () => {
    if (!selectedDocument || !selectedLanguage) return;
    
    translateMutation.mutate({
      documentId: selectedDocument.id,
      targetLanguage: selectedLanguage,
    });
  };

  const handleUpload = () => {
    if (!uploadFile || !selectedService) return;
    
    uploadMutation.mutate({
      file: uploadFile,
      serviceType: selectedService,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (documentId: string, title: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9\s]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your PDF is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (statsLoading || documentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const usagePercentage = stats ? (stats.monthlyUsage / stats.planLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/"}
              className="flex items-center gap-2 hover:bg-gray-100"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Client Dashboard</h1>
          <p className="text-gray-600">Manage your AI-generated documents and track your usage</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalDocuments || 0}</p>
              <p className="text-sm text-green-600">+{stats?.documentsThisMonth || 0} this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Total Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalDownloads || 0}</p>
              <p className="text-sm text-green-600">+{stats?.downloadsThisMonth || 0} this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Monthly Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats?.monthlyUsage || 0}/{stats?.planLimit || 0}</p>
              <Progress value={usagePercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 capitalize">{stats?.currentPlan || "Starter"}</p>
              <p className="text-sm text-gray-500">Expires: {stats?.planExpiry || "Never"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My Documents
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload & Review
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Usage Analytics
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account Settings
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  Your Generated Documents
                  <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                    <Globe className="w-3 h-3 mr-1" />
                    Live Data Enhanced
                  </Badge>
                </CardTitle>
                <CardDescription>
                  View, download, rewrite, and translate your AI-generated documents - now enhanced with real-time web data for accuracy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <Badge variant="outline">{doc.serviceType.replace('-', ' ')}</Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {doc.downloadCount} downloads
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Download Button */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownload(doc.id, doc.title)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>

                        {/* AI Rewrite Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedDocument(doc)}
                              disabled={!hasFeatureAccess("document_rewrite")}
                              className={!hasFeatureAccess("document_rewrite") ? "opacity-50" : ""}
                            >
                              <Sparkles className="w-4 h-4 mr-1" />
                              AI Rewrite
                              {!hasFeatureAccess("document_rewrite") && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                  Pro+
                                </Badge>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Rewrite Document with AI</DialogTitle>
                              <DialogDescription>
                                Choose how you'd like to improve your document
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select value={rewriteType} onValueChange={setRewriteType}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rewrite type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getRewriteOptions().map((option) => (
                                    <SelectItem key={option.type} value={option.type}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {rewriteType === "custom" && (
                                <Textarea
                                  placeholder="Describe how you want to rewrite the document..."
                                  value={customPrompt}
                                  onChange={(e) => setCustomPrompt(e.target.value)}
                                  rows={3}
                                />
                              )}
                              
                              <Button 
                                onClick={handleRewrite} 
                                disabled={!rewriteType || (rewriteType === "custom" && !customPrompt) || rewriteMutation.isPending}
                                className="w-full"
                              >
                                {rewriteMutation.isPending ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Rewriting...
                                  </>
                                ) : (
                                  <>
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Rewrite Document
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Translate Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedDocument(doc)}
                              disabled={!hasFeatureAccess("translation")}
                              className={!hasFeatureAccess("translation") ? "opacity-50" : ""}
                            >
                              <Languages className="w-4 h-4 mr-1" />
                              Translate
                              {!hasFeatureAccess("translation") && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                  Pro+
                                </Badge>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Translate Document</DialogTitle>
                              <DialogDescription>
                                Choose the language to translate your document
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select target language" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableLanguages().map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                      <span className="flex items-center gap-2">
                                        {lang.flag} {lang.name}
                                      </span>
                                    </SelectItem>
                                  ))}
                                  {!hasFeatureAccess("translation") && (
                                    <div className="p-2 text-xs text-gray-500 border-t">
                                      <p>🔒 Upgrade to Pro for translation features</p>
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              
                              <Button 
                                onClick={handleTranslate} 
                                disabled={!selectedLanguage || translateMutation.isPending}
                                className="w-full"
                              >
                                {translateMutation.isPending ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Translating...
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-4 h-4 mr-2" />
                                    Translate Document
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                  
                  {documents?.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No documents created yet</p>
                      <p className="text-sm">Start generating your first document!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload & Review Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Document for AI Review
                    {!hasFeatureAccess("document_review") && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                        Pro Feature
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Upload your PDF documents and get intelligent AI analysis, scoring, and recommendations
                    {!hasFeatureAccess("document_review") && (
                      <span className="text-yellow-600 font-medium"> - Available with Pro and Agency plans</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Service Type
                    </label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose the type of document you're uploading" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{service.label}</span>
                              <span className="text-xs text-gray-500">{service.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Upload PDF Document
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        data-testid="input-file-upload"
                      />
                      <label 
                        htmlFor="file-upload" 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {uploadFile ? uploadFile.name : "Click to upload or drag and drop PDF"}
                        </span>
                        <span className="text-xs text-gray-400">PDF files only, up to 10MB</span>
                      </label>
                    </div>
                  </div>

                  {hasFeatureAccess("document_review") ? (
                    <Button 
                      onClick={handleUpload}
                      disabled={!uploadFile || !selectedService || uploadMutation.isPending}
                      className="w-full"
                      data-testid="button-upload-review"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Document...
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4 mr-2" />
                          Upload & Get AI Review
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <h4 className="font-semibold text-yellow-800">Upgrade Required</h4>
                        </div>
                        <p className="text-sm text-yellow-700 mb-3">
                          Document upload and AI review features are available with Pro and Agency plans.
                        </p>
                        <Button 
                          onClick={() => window.location.href = "/#pricing"}
                          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                        >
                          Upgrade Now
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Recent Reviews
                  </CardTitle>
                  <CardDescription>
                    AI analysis results for your uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uploadReviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No reviews yet</p>
                      <p className="text-sm">Upload a document to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {uploadReviews.map((review) => (
                        <div key={review.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{review.filename}</h4>
                              <Badge variant="outline" className="mt-1">
                                {review.serviceType.replace('-', ' ')}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'stroke-current fill-none'}`} 
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">Score: {review.score}/100</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Summary</p>
                              <p className="text-sm text-gray-600">{review.summary}</p>
                            </div>
                            
                            {review.strengths.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-green-700">Strengths</p>
                                <ul className="text-sm text-green-600 list-disc list-inside">
                                  {review.strengths.map((strength, i) => (
                                    <li key={i}>{strength}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {review.improvements.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-orange-700">Improvements</p>
                                <ul className="text-sm text-orange-600 list-disc list-inside">
                                  {review.improvements.map((improvement, i) => (
                                    <li key={i}>{improvement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {review.recommendations.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-blue-700">Recommendations</p>
                                <ul className="text-sm text-blue-600 list-disc list-inside">
                                  {review.recommendations.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-400">
                            Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Analytics Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Usage Overview
                  {!hasFeatureAccess("usage_analytics") && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                      Pro Feature
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Track your document generation and usage patterns
                  {!hasFeatureAccess("usage_analytics") && (
                    <span className="text-yellow-600 font-medium"> - Available with Pro and Agency plans</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasFeatureAccess("usage_analytics") ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Monthly Usage</span>
                        <span className="text-sm text-gray-500">
                          {stats?.monthlyUsage || 0} / {stats?.planLimit || 0} documents
                        </span>
                      </div>
                      <Progress value={usagePercentage} className="h-3" />
                      <p className="text-xs text-gray-500 mt-2">
                        {usagePercentage >= 80 ? "You're near your monthly limit!" : 
                         usagePercentage >= 50 ? "You're halfway through your monthly allowance" : 
                         "You have plenty of usage remaining"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">This Month</h4>
                        <p className="text-2xl font-bold text-blue-600">{stats?.documentsThisMonth || 0}</p>
                        <p className="text-sm text-gray-500">Documents created</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Downloads</h4>
                        <p className="text-2xl font-bold text-green-600">{stats?.downloadsThisMonth || 0}</p>
                        <p className="text-sm text-gray-500">PDFs downloaded</p>
                      </div>
                      {hasFeatureAccess("advanced_analytics") && (
                        <>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Avg. Generation Time</h4>
                            <p className="text-2xl font-bold text-purple-600">2.4s</p>
                            <p className="text-sm text-gray-500">Average per document</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Success Rate</h4>
                            <p className="text-2xl font-bold text-emerald-600">98.7%</p>
                            <p className="text-sm text-gray-500">Generation success</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-800">Detailed Analytics Available with Pro</h4>
                      </div>
                      <p className="text-sm text-yellow-700 mb-4">
                        Get detailed usage insights, performance metrics, and trend analysis with Pro and Agency plans.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={() => window.location.href = "/#pricing"}
                          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                    
                    {/* Basic stats still visible for Starter users */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Basic Usage Summary</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{stats?.monthlyUsage || 0}</p>
                          <p className="text-sm text-gray-600">Documents This Month</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{stats?.totalDocuments || 0}</p>
                          <p className="text-sm text-gray-600">Total Documents</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your subscription and account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Plan</h4>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{stats?.currentPlan || "Starter"} Plan</p>
                        <p className="text-sm text-gray-600">
                          {stats?.planLimit || 0} documents per month
                        </p>
                      </div>
                      <Button variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Plan
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Usage Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded">
                      <p className="text-sm text-gray-600">Total Documents</p>
                      <p className="text-xl font-semibold">{stats?.totalDocuments || 0}</p>
                    </div>
                    <div className="p-3 border rounded">
                      <p className="text-sm text-gray-600">Total Downloads</p>
                      <p className="text-xl font-semibold">{stats?.totalDownloads || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}