import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import ResourceHub from "./pages/ResourceHub";
import OutlinesHub from "./components/OutlinesHub";
import OutlineView from "./pages/OutlineView";
import { AdminDashboard } from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import MatchupPage from "./pages/MatchupPage";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastContainer 
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          zIndex: 2147483647
        }}
        toastStyle={{
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          border: '1px solid hsl(var(--primary))'
        }}
      />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/resources" element={<ResourceHub />} />
          <Route path="/outlines" element={<OutlinesHub />} />
          
          <Route path="/outlines/:id" element={<OutlineView />} />
          <Route path="/matchup" element={<MatchupPage />} />
          <Route path="/apalsa-mentorship" element={<Index mentorshipPage={true} />} />
          <Route path="/mentorship-selection" element={<Index mentorshipPage={true} initialState="selection" />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;