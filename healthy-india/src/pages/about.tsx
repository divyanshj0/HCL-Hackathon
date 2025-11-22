import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Stethoscope, Users, Shield, Cloud, Brain,HeartHandshake } from "lucide-react";

// The Image component for the hero section is omitted for simplicity in this file, 
// using a basic image tag pointing to a placeholder.

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <h1 className="text-xl font-bold text-primary">Healthy India Connect</h1>
          </div>
          <nav className="space-x-4 flex items-center">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/patient/login">
              <Button variant="default" size="sm">
                Patient Login
              </Button>
            </Link>
            <Link to="/doctor/login">
              <Button variant="outline" size="sm">
                Doctor Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section - About Us */}
        <section className="relative w-full h-[60vh] flex items-center justify-center text-center bg-gray-100 dark:bg-gray-800">
          <div className="relative z-10 container mx-auto px-4">
            <h2 className="text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-4">
              Our Mission: Better Health for India
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              We build the bridge between technology and accessible healthcare. Track your wellness journey and get expert care, all in one place.
            </p>
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-10">Why We Exist</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Stethoscope className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Personalized Care</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Connect with doctors and receive health recommendations tailored specifically to your tracked metrics and profile.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Seamless Collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Doctors can monitor assigned patient data, goals, and history in real-time, improving treatment efficacy.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Secure Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    All health data is stored securely, ensuring patient privacy and compliance with health information standards.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Essential Health Information Cards Section (AQI, Mental, Yoga) */}
        <section id="health-info" className="py-16 bg-gray-50 dark:bg-gray-850">
            <div className="container mx-auto px-4">
                <h3 className="text-3xl font-bold text-center mb-10">Latest Health Information</h3>
                <div className="grid md:grid-cols-3 gap-8">
                    
                    {/* AQI (Air Quality Index) Card */}
                    <Card className="shadow-lg border-blue-200 hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <Cloud className="h-8 w-8 text-blue-500 mb-2" />
                            <CardTitle>Air Quality Index (AQI)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Monitor local air pollution levels to protect your respiratory health. Important for outdoor activity planning and managing conditions like asthma.
                            </CardDescription>
                            <Link to="#" className="text-sm text-blue-600 hover:underline mt-4 block">
                                Read More
                            </Link>
                        </CardContent>
                    </Card>
                    
                    {/* Mental Health Card */}
                    <Card className="shadow-lg border-purple-200 hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <Brain className="h-8 w-8 text-purple-500 mb-2" />
                            <CardTitle>Mental Wellness</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Resources and tools to track your mood, manage stress, and connect with support for better emotional well-being.
                            </CardDescription>
                            <Link to="#" className="text-sm text-purple-600 hover:underline mt-4 block">
                                Read More
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Yoga & Physical Activity Card */}
                    <Card className="shadow-lg border-green-200 hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <HeartHandshake className="h-8 w-8 text-purple-500 mb-2"/>
                            <CardTitle>Yoga & Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Discover yoga routines, physical activity guides, and tips to improve flexibility, strength, and overall vitality.
                            </CardDescription>
                            <Link to="#" className="text-sm text-green-600 hover:underline mt-4 block">
                                Read More
                            </Link>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </section>


        {/* Footer */}
        <footer className="border-t bg-card py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Healthy India Connect. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
};

export default About;