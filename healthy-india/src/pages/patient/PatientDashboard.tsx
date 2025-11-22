import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Droplets, Flame, Moon, User, LogOut, Stethoscope, BriefcaseMedical, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DoctorList from "./DoctorList"; // Import the new component

interface TodayStats {
  waterIntake: number;
  waterGoal: number;
  calories: number;
  caloriesGoal: number;
  sleep: number;
  sleepGoal: number;
}

interface WeeklyDataPoint {
  day: string;
  water: number;
  calories: number;
  hours: number;
}

interface Recommendation {
  doctorName: string;
  date: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

interface DashboardData {
  todayStats: TodayStats;
  weeklyData: WeeklyDataPoint[];
  doctorRecommendations: Recommendation[];
}


const PatientDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDoctorListOpen, setIsDoctorListOpen] = useState(false);
  const [assignedDoctors, setAssignedDoctors] = useState<{ id: string; name: string }[]>([]);

  const userToken = localStorage.getItem('userToken');

  // Helper function for handling auth errors
  const handleAuthError = (message: string) => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    toast.error(message || "Session expired or unauthorized. Please log in again.");
    navigate('/patient/login');
  }

  // Function to fetch assigned doctors' details
  const fetchAssignedDoctors = async (token: string) => {
    try {
      const doctorsListResponse = await fetch('http://localhost:5000/api/doctors/list', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!doctorsListResponse.ok) throw new Error('Failed to fetch doctor list');

      const doctorsList = await doctorsListResponse.json();

      const assigned = doctorsList
        .filter((d: any) => d.isAssigned)
        .map((d: any) => ({ id: d.id, name: d.name }));

      setAssignedDoctors(assigned);
    } catch (error) {
      console.error("Assigned Doctors Fetch Error:", error);
    }
  };


  // Refetch data function
  const fetchDashboardData = async () => {
    if (!userToken) {
      handleAuthError("Please log in to view your dashboard.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/patient', {
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
      // Run secondary fetch regardless of success status
      if (userToken) {
        await fetchAssignedDoctors(userToken);
      }
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, [userToken, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    navigate("/patient/login");
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

  const { todayStats, weeklyData, doctorRecommendations } = data;

  const { 
    waterIntake = 0, 
    waterGoal = 8, 
    calories = 0, 
    caloriesGoal = 2000, 
    sleep = 0, 
    sleepGoal = 8 
  } = todayStats;

  const waterProgress = (waterIntake / waterGoal) * 100;
  const caloriesProgress = (calories / caloriesGoal) * 100;
  const sleepProgress = (sleep / sleepGoal) * 100;


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <h1 className="text-xl font-bold text-primary">Healthy India</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Removed redundant Dialog/Book Doctor button from header */}
            <Button variant="ghost" size="sm" onClick={() => navigate("/patient/profile")}>
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
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Here's your health summary for today</p>
        </div>

        {/* Today's Stats (Dynamic) */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
              <Droplets className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{waterIntake}/{waterGoal}</div>
              <p className="text-xs text-muted-foreground mt-1">glasses today</p>
              <Progress value={waterProgress} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Calories</CardTitle>
              <Flame className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{calories}</div>
              <p className="text-xs text-muted-foreground mt-1">of {caloriesGoal} kcal goal</p>
              <Progress value={caloriesProgress} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sleep</CardTitle>
              <Moon className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{sleep}h</div>
              <p className="text-xs text-muted-foreground mt-1">of {sleepGoal}h goal</p>
              <Progress value={sleepProgress} className="mt-3" />
            </CardContent>
          </Card>
        </div>

        {/* Weekly Analytics (Dynamic) */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Weekly Water Intake</CardTitle>
              <CardDescription>Daily glasses of water consumed</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="water"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Weekly Calorie Intake</CardTitle>
              <CardDescription>Daily calorie consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="calories" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md md:col-span-2">
            <CardHeader>
              <CardTitle>Weekly Sleep Pattern</CardTitle>
              <CardDescription>Hours of sleep per night</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--success))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Recommendations (Dynamic) - MODIFIED SECTION */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Doctor Recommendations</h3>
          <div className="space-y-4">
            {doctorRecommendations.length > 0 ? (
              doctorRecommendations.map((rec, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{rec.doctorName}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(rec.date).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={rec.priority === "high" ? "default" : "secondary"}>
                        {rec.priority === "high" ? "High Priority" : rec.priority === "medium" ? "Medium Priority" : "Low Priority"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">{rec.recommendation}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                {assignedDoctors.length > 0 ? (
                  // Case 1: Assigned, awaiting first recommendation
                  <Card className="p-6 text-center shadow-lg border-success/50 border-2 bg-success/5">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-3" />
                    <h4 className="font-semibold text-lg mb-2">
                      Assigned to Dr. {assignedDoctors.map(d => d.name).join(', ')}!
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      Your data is now shared. Please allow your doctor some time to review your profile and post your first recommendation.
                    </p>
                    {/* Option to view/manage doctors */}
                    <Dialog open={isDoctorListOpen} onOpenChange={setIsDoctorListOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="default">
                          <BriefcaseMedical className="h-4 w-4 mr-2" />
                          Manage Doctors
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Find a Doctor</DialogTitle>
                          <CardDescription>Connect with a specialist to get expert recommendations.</CardDescription>
                        </DialogHeader>
                        <DoctorList onBookSuccess={() => { setIsDoctorListOpen(false); fetchDashboardData(); }} />
                      </DialogContent>
                    </Dialog>
                  </Card>
                ) : (
                  // Case 2: Not assigned to any doctor (Initial state)
                  <Card className="p-6 text-center shadow-lg border-primary/50 border-2">
                    <BriefcaseMedical className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold text-lg mb-4">No Doctor Assigned Yet</h4>
                    <p className="text-muted-foreground mb-4">Book a doctor to receive personalized advice and care.</p>
                    <Dialog open={isDoctorListOpen} onOpenChange={setIsDoctorListOpen}>
                      <DialogTrigger asChild>
                        <Button variant="default" className="w-full">
                          <BriefcaseMedical className="h-4 w-4 mr-2" />
                          Find & Book a Doctor
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Find a Doctor</DialogTitle>
                          <CardDescription>Connect with a specialist to get expert recommendations.</CardDescription>
                        </DialogHeader>
                        <DoctorList onBookSuccess={() => { setIsDoctorListOpen(false); fetchDashboardData(); }} />
                      </DialogContent>
                    </Dialog>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;