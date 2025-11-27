import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTheme } from "next-themes";
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
import AvailabilityScheduler from "./components/AvailabilityScheduler";
import FixedSlotPoll from "./components/FixedSlotPoll";
import JobPortal from "./pages/JobPortal";
import JobDetails from "./pages/JobDetails";
import JobApplicationSuccess from "./pages/JobApplicationSuccess";
import MyApplications from "./pages/MyApplications";
import CompanyDashboard from "./pages/CompanyDashboard";
import CVEnhancer from "@/pages/CVEnhancer";


const queryClient = new QueryClient();

const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <>
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
        theme={theme === "dark" ? "dark" : "light"}
        style={{
          zIndex: 2147483647
        }}
        toastClassName="bg-primary text-primary-foreground border border-primary rounded-lg shadow-lg"
        bodyClassName={() => "text-sm font-medium"}
        progressClassName="!bg-primary-foreground/30"
      />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/resources" element={<ResourceHub />} />
          <Route path="/outlines" element={<OutlinesHub />} />
          
          <Route path="/outlines/:id" element={<OutlineView />} />
          <Route path="/availability" element={<FixedSlotPoll />} />
          <Route path="/matchup" element={<MatchupPage />} />
          <Route path="/apalsa-mentorship" element={<Index mentorshipPage={true} />} />
          <Route path="/mentorship-selection" element={<Index mentorshipPage={true} initialState="selection" />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/jobs" element={<JobPortal />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/job-application-success" element={<JobApplicationSuccess />} />
          <Route path="/my-applications" element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          } />
          <Route path="/company-dashboard" element={
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireSuperAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/cv-enhancer/:jobId" element={<CVEnhancer />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
