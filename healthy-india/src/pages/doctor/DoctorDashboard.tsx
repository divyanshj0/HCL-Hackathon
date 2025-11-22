import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Users, Calendar, Activity, User, LogOut } from "lucide-react";
import { toast } from "sonner";

interface RecentPatient {
    id: string; // Added ID for navigation
    name: string;
    lastVisit: string;
    condition: string;
}

interface DoctorDashboardData {
    totalPatients: number;
    todayAppointments: number;
    activeCases: number;
    totalConsultations: number;
    recentPatients: RecentPatient[];
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DoctorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userToken = localStorage.getItem('userToken');

  // Helper function for handling auth errors
  const handleAuthError = (message: string) => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    toast.error(message || "Session expired or unauthorized. Please log in again.");
    navigate('/doctor/login');
  }

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (!userToken) {
        handleAuthError("Please log in to view your dashboard.");
        return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard/doctor', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        });
        
        if (response.status === 401 || response.status === 403) {
            return handleAuthError(response.statusText);
        }

        const result = await response.json();

        if (response.ok) {
          setData(result);
        } else {
          toast.error(result.message || "Failed to load dashboard data.");
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        toast.error("Network error fetching dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userToken, navigate]);


  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    navigate("/doctor/login");
  };
  
  // NEW: Navigation handler to patient detail page
  const handleViewPatientDetail = (patientId: string) => {
    navigate(`/doctor/patient/${patientId}`);
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl text-muted-foreground">Loading dashboard...</p>
        </div>
    );
  }

  if (!data) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <p className="text-xl text-destructive mb-4">Could not load dashboard data.</p>
            <Button onClick={handleLogout}>Go to Login</Button>
        </div>
    );
  }

  const { totalPatients, todayAppointments, activeCases, totalConsultations, recentPatients } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-bold text-accent">Healthy India</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/doctor/profile")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Doctor's Dashboard</h2>
          <p className="text-muted-foreground">Overview of your practice</p>
        </div>

        {/* Stats (Dynamic) */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPatients}</div>
              <p className="text-xs text-muted-foreground mt-1">Assigned to you</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayAppointments}</div>
              <p className="text-xs text-muted-foreground mt-1">Today (Estimate)</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <Activity className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeCases}</div>
              <p className="text-xs text-muted-foreground mt-1">Under monitoring</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
              <Stethoscope className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalConsultations}</div>
              <p className="text-xs text-muted-foreground mt-1">Historical</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients (Dynamic and Clickable) */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Assigned Patients</CardTitle>
            <CardDescription>Click a patient to view their detailed health record</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.length > 0 ? (
                recentPatients.map((patient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewPatientDetail(patient.id)} 
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.condition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Assigned on</p>
                        <p className="text-sm font-medium">{patient.lastVisit}</p>
                      </div>
                    </div>
                ))
              ) : (
                  <p className="text-muted-foreground">No patients have booked you yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DoctorDashboard;