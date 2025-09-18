import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Crown, Users, Building2 } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionSuccess() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get session_id from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    
    if (id) {
      setSessionId(id);
      // Verify the session with backend
      verifySession(id);
    } else {
      setLoading(false);
    }
  }, []);

  const verifySession = async (sessionId: string) => {
    try {
      const data = await apiRequest("POST", "/api/verify-checkout-session", {
        sessionId
      });
      
      if (data.success) {
        setPlanDetails(data.planDetails);
        toast({
          title: "Subscription Successful!",
          description: `Welcome to ${data.planDetails?.name || 'your new plan'}!`
        });
      }
    } catch (error) {
      console.error("Session verification failed:", error);
      toast({
        title: "Verification Error",
        description: "There was an issue verifying your subscription.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'starter': return CheckCircle;
      case 'pro': return Users;
      case 'agency': return Building2;
      default: return Crown;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'starter': return 'text-green-600 bg-green-50';
      case 'pro': return 'text-blue-600 bg-blue-50';
      case 'agency': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-lg text-gray-900">Verifying your subscription...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className={`w-16 h-16 rounded-full ${getPlanColor(planDetails?.name)} flex items-center justify-center mx-auto mb-4`}>
              {getPlanIcon(planDetails?.name) && (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {sessionId ? "Subscription Successful!" : "Welcome Back!"}
            </CardTitle>
            <CardDescription>
              {sessionId 
                ? `You've successfully subscribed to ${planDetails?.name || 'your new plan'}`
                : "Let's get you started with your subscription"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {planDetails && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Your Plan</div>
                <div className="text-lg font-semibold text-gray-900 capitalize">
                  {planDetails.name} Plan
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {planDetails.designs} per month
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">What's Next?</h4>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Access all premium templates and generators
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Start creating professional documents
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Track your usage in the dashboard
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Start Creating
              </Button>
            </div>
            
            {sessionId && (
              <div className="text-xs text-gray-500 border-t pt-4">
                <p>Session ID: {sessionId}</p>
                <p>A confirmation email has been sent to your email address.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}