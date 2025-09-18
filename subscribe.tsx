import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = ({ planSlug }: { planSlug: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?subscribed=true`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed! Welcome to your new plan.",
      });
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
        size="lg"
      >
        {isLoading ? "Processing..." : `Subscribe to ${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} Plan`}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Get plan from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planFromUrl = urlParams.get('plan');
    if (planFromUrl) {
      setSelectedPlan(planFromUrl);
    }
  }, []);

  // Don't auto-start subscription - let users see pricing first

  // Get subscription plans
  const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: () => apiRequest('GET', '/api/subscription-plans').then(r => r.json())
  });

  // Debug logging
  console.log('Plans loading:', plansLoading);
  console.log('Plans data:', plans);
  console.log('Plans error:', plansError);

  // Remove redirect - allow viewing pricing without authentication

  const createSubscription = async (planSlug: string) => {
    try {
      const response = await apiRequest("POST", "/api/create-subscription", { planSlug });
      const data = await response.json();
      
      if (data.message) {
        toast({
          title: "Subscription Status",
          description: data.message,
        });
        navigate('/dashboard');
        return;
      }
      
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    }
  };

  // Show pricing page even if user is not authenticated
  if (plansLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (clientSecret) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
            <p className="text-gray-700">Secure payment powered by Stripe</p>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Complete your subscription to unlock unlimited AI-powered design generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm planSlug={selectedPlan} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-700">Start free, upgrade to unlock unlimited AI-powered designs</p>
        </div>

        {/* Debug info */}
        <div className="text-center mb-4 text-sm text-gray-500">
          Loading: {plansLoading ? 'Yes' : 'No'} | Plans count: {plans?.length || 0} | User: {user ? 'Logged in' : 'Not logged in'}
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Freemium Plan - Always shown */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Free
              </CardTitle>
              <div className="text-3xl font-bold text-gray-700">
                £0
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <CardDescription>
                1 design per month
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1 AI-generated design per month
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic templates
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  PDF download
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Admin approval required
                </li>
              </ul>
              
              <Button 
                disabled={true}
                className="w-full mt-6"
                variant="outline"
                size="lg"
              >
                {user?.currentPlan === 'freemium' ? 'Current Plan' : 'Get Started Free'}
              </Button>
            </CardContent>
          </Card>

          {/* Paid Plans - Filter out freemium */}
          {plans?.filter((plan: any) => plan.slug !== 'freemium').map((plan: any) => (
            <Card 
              key={plan.id} 
              className={`shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
                plan.slug === 'pro' ? 'ring-2 ring-orange-500 relative' : ''
              }`}
              onClick={() => setSelectedPlan(plan.slug)}
            >
              {plan.slug === 'pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="text-3xl font-bold text-gray-700">
                  £{plan.price}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <CardDescription>
                  {plan.monthlyDesignLimit === -1 
                    ? 'Unlimited designs' 
                    : `${plan.monthlyDesignLimit} designs per month`
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features?.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Sign In Required",
                        description: "Please sign in to subscribe to a plan.",
                        variant: "destructive",
                      });
                      navigate('/auth');
                      return;
                    }
                    createSubscription(plan.slug);
                  }}
                  className="w-full mt-6"
                  variant={plan.slug === 'pro' ? 'default' : 'outline'}
                  size="lg"
                >
                  {user?.currentPlan === plan.slug ? 'Current Plan' : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">All plans include:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
            <span>✓ AI-powered content generation</span>
            <span>✓ Professional templates</span>
            <span>✓ Export to multiple formats</span>
            <span>✓ 24/7 customer support</span>
          </div>
        </div>
      </div>
    </div>
  );
}