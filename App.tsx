import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import Subscribe from "@/pages/subscribe";
import SubscriptionSuccess from "@/pages/subscription-success";
import About from "@/pages/about";
import Custom from "@/pages/custom";
import ClientDashboard from "@/pages/client-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Solutions from "@/pages/tools";
import AIGeneration from "@/pages/tools/ai-generation";
import WorkflowTool from "@/pages/tools/workflow";
import Consultancy from "@/pages/tools/consultancy";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/client-dashboard" component={ClientDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/about" component={About} />
      <Route path="/custom" component={Custom} />
      <Route path="/solutions" component={Solutions} />
      <Route path="/solutions/ai-generation" component={AIGeneration} />
      <Route path="/solutions/workflow" component={WorkflowTool} />
      <Route path="/solutions/consultancy" component={Consultancy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
