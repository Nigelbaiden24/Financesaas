import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles, Users, Building2, AlertCircle, ArrowDown, ArrowUp } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function PricingSection() {
  const [, navigate] = useLocation();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user's plan
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get subscription plans from database
  const { data: databasePlans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: () => apiRequest('GET', '/api/subscription-plans').then(r => r.json())
  });

  const currentPlan = (user as any)?.currentPlan || null;

  // Function to get button text and style based on user's current plan vs target plan
  const getButtonConfig = (targetPlan: string) => {
    if (!currentPlan || !user) {
      return {
        text: `Get Started with ${targetPlan}`,
        variant: "default",
        icon: null
      };
    }

    const planHierarchy = { freemium: 0, starter: 1, pro: 2, agency: 3 };
    const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
    const targetLevel = planHierarchy[targetPlan.toLowerCase() as keyof typeof planHierarchy] || 0;

    if (currentLevel === targetLevel) {
      return {
        text: `Continue with ${targetPlan}`,
        variant: "current",
        icon: Check
      };
    } else if (currentLevel > targetLevel) {
      return {
        text: `Downgrade to ${targetPlan}`,
        variant: "downgrade", 
        icon: ArrowDown
      };
    } else {
      return {
        text: `Upgrade to ${targetPlan}`,
        variant: "upgrade",
        icon: ArrowUp
      };
    }
  };

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      console.log("Starting subscription for plan:", planId);
      const response = await apiRequest("POST", "/api/create-checkout-session", {
        planId: planId.toLowerCase(),
        isAnnual
      });
      
      const data = await response.json();
      console.log("Checkout session response:", data);
      
      if (data && data.checkoutUrl) {
        console.log("Opening Stripe checkout in new tab:", data.checkoutUrl);
        // Open Stripe checkout in new tab
        window.open(data.checkoutUrl, '_blank');
      } else {
        console.error("Invalid response structure:", data);
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to start subscription process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };
  
  const getPrice = (monthlyPrice: number) => {
    if (isAnnual) {
      const annualPrice = monthlyPrice * 12 * 0.8; // 20% discount for annual
      return Math.round(annualPrice);
    }
    return monthlyPrice;
  };
  
  const getDisplayPrice = (monthlyPrice: number) => {
    if (isAnnual) {
      const annualTotal = getPrice(monthlyPrice);
      const monthlyEquivalent = Math.round(annualTotal / 12);
      return `£${monthlyEquivalent}`;
    }
    return `£${monthlyPrice}`;
  };
  
  // Convert database plans to display format  
  const plans = databasePlans ? databasePlans.map((plan: any) => {
    const monthlyPrice = parseFloat(plan.price);
    const designLimit = plan.monthlyDesignLimit === -1 ? "Unlimited designs" : `${plan.monthlyDesignLimit} designs per month`;
    
    // Assign icons and colors based on plan name
    let icon = Sparkles;
    let color = "bg-blue-500";
    let popular = false;
    
    if (plan.name === "Free") {
      icon = Sparkles;
      color = "bg-green-500";
    } else if (plan.name === "Starter") {
      icon = Sparkles;
      color = "bg-blue-500";
    } else if (plan.name === "Pro") {
      icon = Users;
      color = "bg-purple-500";
      popular = true;
    } else if (plan.name === "Agency") {
      icon = Building2;
      color = "bg-gray-800";
    }
    
    return {
      id: plan.id,
      slug: plan.slug,
      name: plan.name,
      monthlyPrice: monthlyPrice,
      period: isAnnual ? "per month (billed annually)" : "per month",
      description: `Perfect for ${plan.name.toLowerCase()} level usage`,
      designs: designLimit,
      icon: icon,
      color: color,
      popular: popular,
      features: plan.features || []
    };
  }) : [];

  // Add loading state
  if (plansLoading) {
    return (
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Loading pricing plans...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your design needs. All plans include access to our complete generator suite.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-lg font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <div className="relative">
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual
              </span>
              <Badge className="bg-green-500 text-white text-sm font-bold">
                Save 20%
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto pt-6">
          {plans.map((plan: any) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl shadow-lg overflow-visible border-2 transition-all duration-300 hover:shadow-xl relative ${
                  plan.popular ? "border-purple-500 scale-105 ring-4 ring-purple-200 mt-4" : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-bold shadow-lg whitespace-nowrap">
                      ⭐ MOST POPULAR ⭐
                    </Badge>
                  </div>
                )}
                
                {(() => {
                  const buttonConfig = getButtonConfig(plan.name);
                  if (buttonConfig.variant === "current") {
                    return (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-600 text-white px-3 py-1 flex items-center">
                          <Check className="w-3 h-3 mr-1" />
                          Current Plan
                        </Badge>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${plan.color} rounded-lg flex items-center justify-center mr-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">{getDisplayPrice(plan.monthlyPrice)}</span>
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    </div>
                    {isAnnual && (
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="line-through">£{plan.monthlyPrice}/month</span>
                        <span className="ml-2 text-green-600 font-semibold">Save 20%</span>
                      </div>
                    )}
                    <p className="text-lg font-semibold text-blue-600 mt-2">{plan.designs}</p>
                    <p className="text-sm text-gray-600 mt-1">per seat</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {(() => {
                    const buttonConfig = getButtonConfig(plan.name);
                    const IconComponent = buttonConfig.icon;
                    
                    // Get button styling based on action type
                    const getButtonStyle = (variant: string, isPopular: boolean) => {
                      if (variant === "current") {
                        return "bg-green-600 hover:bg-green-700 text-white border-2 border-green-500";
                      } else if (variant === "upgrade") {
                        return isPopular 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "bg-blue-600 hover:bg-blue-700 text-white";
                      } else if (variant === "downgrade") {
                        return "bg-orange-500 hover:bg-orange-600 text-white";
                      } else {
                        return isPopular 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "bg-gray-900 hover:bg-gray-800 text-white";
                      }
                    };

                    return (
                      <Button 
                        onClick={() => handleSubscribe(plan.name)}
                        disabled={loading === plan.name || buttonConfig.variant === "current"}
                        className={`w-full py-3 text-lg font-semibold transition-colors ${getButtonStyle(buttonConfig.variant, plan.popular)}`}
                      >
                        {loading === plan.name ? (
                          "Loading..."
                        ) : (
                          <div className="flex items-center justify-center">
                            {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                            {buttonConfig.text}
                          </div>
                        )}
                      </Button>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pay-as-you-go disclaimer */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">Pay-as-you-go for Extra Usage</h4>
                <p className="text-amber-700 text-sm leading-relaxed">
                  If you exceed your monthly design limit, additional designs will be charged using pay-as-you-go tokens 
                  at competitive rates similar to industry standards. Extra usage will be automatically billed to your account. 
                  You can monitor your usage and set spending limits in your dashboard to stay in control of your costs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ or additional info */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Need a custom plan for your organization? 
            <a href="#contact" className="text-blue-600 hover:text-blue-700 font-semibold ml-1">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}