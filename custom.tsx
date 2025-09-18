import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Building, User, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const services = [
  "Pitch Deck",
  "CV/Resume",
  "Business Proposal",
  "Marketing Brochure",
  "Financial Report",
  "Annual Report",
  "Newsletter",
  "Invoice",
  "Presentation",
  "Business Plan",
  "White Paper",
  "Case Study",
  "Product Catalog",
  "Company Profile",
  "Training Manual",
  "Policy Document",
  "Research Report",
  "Marketing Materials",
  "Brand Guidelines",
  "Other (Please specify in details)"
];

const customRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  service: z.string().min(1, "Please select a service"),
  projectDetails: z.string().min(20, "Please provide at least 20 characters of project details"),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  additionalRequirements: z.string().optional(),
});

type CustomRequestForm = z.infer<typeof customRequestSchema>;

export default function Custom() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomRequestForm>({
    resolver: zodResolver(customRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      service: "",
      projectDetails: "",
      timeline: "",
      budget: "",
      additionalRequirements: "",
    },
  });

  const onSubmit = async (data: CustomRequestForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/custom-requests", data);
      toast({
        title: "Request Submitted Successfully!",
        description: "We'll review your project details and get back to you within 24 hours.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mr-4">
              <Sparkles className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                <span className="text-yellow-600">Custom</span>
              </h1>
              <p className="text-xl text-gray-700">
                Need something special? We'll create it for you.
              </p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
              Our expert team can manually create any document or design you need. 
              From complex business proposals to custom presentations, we deliver 
              professional results tailored to your exact requirements.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          {/* Service Information */}
          <div className="space-y-8">
            <Card className="bg-white border-yellow-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <Building className="w-6 h-6 text-yellow-600 mr-3" />
                  What We Offer
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Professional document creation and design services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {services.slice(0, 8).map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      <span className="text-gray-700 text-sm">{service}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-yellow-600 text-sm">...and many more!</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-yellow-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <Mail className="w-6 h-6 text-yellow-600 mr-3" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold">Submit Your Request</h4>
                    <p className="text-gray-600 text-sm">Tell us about your project and requirements</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold">Get a Quote</h4>
                    <p className="text-gray-600 text-sm">We'll provide a detailed proposal and timeline</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold">Professional Delivery</h4>
                    <p className="text-gray-600 text-sm">Receive your custom document, ready to use</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-white border-yellow-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <User className="w-6 h-6 text-yellow-600 mr-3" />
                Request Custom Service
              </CardTitle>
              <CardDescription className="text-gray-600">
                Fill out the form below and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900">Full Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your name" 
                              {...field} 
                              className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900">Email Address *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              type="email"
                              {...field} 
                              className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900">Company</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your company" 
                              {...field} 
                              className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+1 (555) 123-4567" 
                              {...field} 
                              className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900">Service Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500">
                              <SelectValue placeholder="Select the service you need" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-gray-300">
                            {services.map((service) => (
                              <SelectItem key={service} value={service} className="text-gray-900 focus:bg-gray-100">
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900">Project Details *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please describe your project in detail. Include purpose, target audience, content requirements, style preferences, and any specific elements you need included..."
                            {...field}
                            rows={4}
                            className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-600">
                          The more details you provide, the better we can serve you
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900">Timeline</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 1 week, ASAP, flexible" 
                              {...field} 
                              className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900">Budget Range</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., £500-1000, flexible" 
                              {...field} 
                              className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900">Additional Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information, special requirements, or questions..."
                            {...field}
                            rows={3}
                            className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="text-center mt-16 p-8 bg-gray-50 rounded-2xl border border-yellow-300">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need to speak with us directly?</h3>
          <div className="flex justify-center items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-yellow-600" />
              <span className="text-gray-700">custom@jenrate.ai</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-yellow-600" />
              <span className="text-gray-700">+44 20 7946 0958</span>
            </div>
          </div>
          <p className="text-gray-600 mt-4">
            We're here to help bring your vision to life with professional, custom-designed documents.
          </p>
        </div>
      </div>
    </div>
  );
}