import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import LoginPage from "@/pages/login";
import SecretaryPage from "@/pages/secretary";
import DraftingLawyerPage from "@/pages/drafting-lawyer";
import ApprovingLawyerPage from "@/pages/approving-lawyer";
import ManagingPartnerPage from "@/pages/managing-partner";
import LegalSecretaryPage from "@/pages/legal-secretary";
import AccountantPage from "@/pages/accountant";
import AutomationLawyerPage from "@/pages/automation-lawyer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/secretary" component={SecretaryPage} />
      <Route path="/drafting-lawyer" component={DraftingLawyerPage} />
      <Route path="/approving-lawyer" component={ApprovingLawyerPage} />
      <Route path="/managing-partner" component={ManagingPartnerPage} />
      <Route path="/legal-secretary" component={LegalSecretaryPage} />
      <Route path="/accountant" component={AccountantPage} />
      <Route path="/automation-lawyer" component={AutomationLawyerPage} />
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
