import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  age: string | number;
  weight: string | number;
  height: string | number;
}

const PatientProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    age: "",
    weight: "",
    height: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const userToken = localStorage.getItem('userToken');

  // Helper function for handling auth errors
  const handleAuthError = (message: string) => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    toast.error(message || "Session expired or unauthorized. Please log in again.");
    navigate('/patient/login');
  }

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (!userToken) {
      handleAuthError("Please log in to view your profile.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile/patient', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
            return handleAuthError(response.statusText);
        }

        const data = await response.json();

        if (response.ok) {
          setFormData({
            ...data,
            // Ensure numeric values are strings for input fields
            age: data.age?.toString() || '',
            weight: data.weight?.toString() || '',
            height: data.height?.toString() || '',
          });
        } else {
          toast.error(data.message || "Failed to load profile data.");
        }
      } catch (error) {
        console.error("Fetch Profile Error:", error);
        toast.error("Network error fetching profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userToken, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // --- Form Submission Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userToken) {
        toast.error("You must be logged in to update your profile.");
        return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/profile/patient', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          // Convert string inputs back to numbers if needed, or rely on backend to handle
          age: parseInt(formData.age as string) || null,
          weight: parseFloat(formData.weight as string) || null,
          height: parseFloat(formData.height as string) || null,
        }),
      });

      if (response.status === 401 || response.status === 403) {
          return handleAuthError(response.statusText);
      }
      
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Profile updated successfully!");
        // Update local state with fresh data from response
        setFormData({
            ...data,
            age: data.age?.toString() || '',
            weight: data.weight?.toString() || '',
            height: data.height?.toString() || '',
        });
      } else {
        toast.error(data.message || "Profile update failed.");
      }
    } catch (error) {
      console.error("Update Profile Error:", error);
      toast.error("Network error updating profile.");
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl text-muted-foreground">Loading profile...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/patient/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <h1 className="text-xl font-bold text-primary">Healthy India</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
            <CardDescription>Update your personal health information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Read Only)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="cursor-not-allowed bg-muted/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PatientProfile;