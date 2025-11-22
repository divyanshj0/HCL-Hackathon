import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, User, Mail, Phone, Heart, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PatientProfile {
    name: string;
    email: string;
    phone: string;
    age: number;
    weight: number;
    height: number;
}

interface GoalDataPoint {
    date: string;
    value: number;
    target: number;
}

interface Goals {
    water?: GoalDataPoint[];
    calories?: GoalDataPoint[];
    sleep?: GoalDataPoint[];
}

interface PatientDetails {
    profile: PatientProfile;
    goals: Goals;
    recommendations: any[]; // Assuming complex structure
}

const AssignedPatientDetail = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const [details, setDetails] = useState<PatientDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const userToken = localStorage.getItem('userToken');

    useEffect(() => {
        if (!userToken || !patientId) {
            toast.error("Invalid request.");
            navigate('/doctor/dashboard');
            return;
        }

        const fetchPatientDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/doctors/patient/${patientId}`, {
                    headers: { 'Authorization': `Bearer ${userToken}` },
                });

                if (response.status === 403) {
                    toast.error("Access denied. Patient is not assigned to you.");
                    navigate('/doctor/dashboard');
                    return;
                }
                
                const result = await response.json();

                if (response.ok) {
                    setDetails(result);
                } else {
                    toast.error(result.message || "Failed to load patient details.");
                }
            } catch (error) {
                console.error("Patient Detail Fetch Error:", error);
                toast.error("Network error fetching patient details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientDetails();
    }, [patientId, userToken, navigate]);

    const formatChartData = (goalData?: GoalDataPoint[], key: string = 'value') => {
        if (!goalData) return [];
        return goalData.map(d => ({
            date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            [key]: d.value,
        }));
    };
    
    const waterChartData = formatChartData(details?.goals.water, 'glasses');
    const sleepChartData = formatChartData(details?.goals.sleep, 'hours');
    const caloriesChartData = formatChartData(details?.goals.calories, 'kcal');

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-muted-foreground">Loading patient details...</p></div>;
    }

    if (!details) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-destructive">Patient details unavailable.</p></div>;
    }
    
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/doctor/dashboard")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-xl font-bold text-accent">{details.profile.name}'s Health Profile</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Patient Contact & Basic Info */}
                    <Card className="col-span-1 shadow-lg">
                        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                            <User className="h-6 w-6 text-primary" />
                            <CardTitle className="text-xl">{details.profile.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center space-x-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <p>{details.profile.email}</p>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <p>{details.profile.phone}</p>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Heart className="h-4 w-4 text-muted-foreground" />
                                <p>Age: {details.profile.age || 'N/A'}</p>
                            </div>
                            <div className="space-y-1 pt-2">
                                <p className="text-sm font-medium">Physical Stats:</p>
                                <p className="text-sm text-muted-foreground pl-4">Weight: {details.profile.weight || 'N/A'} kg</p>
                                <p className="text-sm text-muted-foreground pl-4">Height: {details.profile.height || 'N/A'} cm</p>
                            </div>
                            
                            <Button className="w-full mt-4" variant="accent">
                                Add New Recommendation
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Charts and History */}
                    <div className="md:col-span-2 space-y-8">
                        
                        {/* Water Intake Chart */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Water Intake History (Glasses)</CardTitle>
                                <CardDescription>Tracking water data logged by the patient.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={waterChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="glasses" stroke="#00bcd4" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        
                        {/* Calories Chart */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Calorie Intake History (Kcal)</CardTitle>
                                <CardDescription>Tracking calorie data logged by the patient.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={caloriesChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="kcal" stroke="#ff8c00" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Sleep Hours Chart */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Sleep Hours History</CardTitle>
                                <CardDescription>Tracking sleep hours logged by the patient.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={sleepChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 10]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="hours" stroke="#4CAF50" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssignedPatientDetail;