import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { Chatbot } from "@/components/Chatbot";
import MapPage from "@/pages/MapPage";
import FeedPage from "@/pages/FeedPage";
import AddReportPage from "@/pages/AddReportPage";
import InfoPage from "@/pages/InfoPage";
import ReportDetailPage from "@/pages/ReportDetailPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/*"
            element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<MapPage />} />
                  <Route path="/feed" element={<FeedPage />} />
                  <Route path="/add-report" element={<AddReportPage />} />
                  <Route path="/info" element={<InfoPage />} />
                  <Route path="/report/:id" element={<ReportDetailPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Chatbot />
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
