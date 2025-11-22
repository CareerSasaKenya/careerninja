import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import EmployerDashboard from "@/components/dashboards/EmployerDashboard";
import CandidateDashboard from "@/components/dashboards/CandidateDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-73px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {role === "employer" && <EmployerDashboard />}
        {role === "candidate" && <CandidateDashboard />}
        {role === "admin" && <AdminDashboard />}
        {!role && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No role assigned. Please contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
