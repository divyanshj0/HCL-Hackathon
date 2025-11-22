import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Stethoscope, User, Activity, TrendingUp, Shield } from "lucide-react";
import heroImage from "@/assets/hero-health.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Healthy India
            </h1>
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/about">About</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/contact">Contact</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Your Health,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Connecting patients with healthcare professionals for a healthier tomorrow.
                Track your wellness journey and get expert care, all in one place.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link to="/patient/login">
                    <User className="mr-2 h-5 w-5" />
                    Patient Portal
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all" asChild>
                  <Link to="/doctor/login">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Doctor Portal
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-200">
              <img
                src={heroImage}
                alt="Healthcare professionals"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Healthy India?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-all border-0 bg-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Track Your Health</h4>
              <p className="text-muted-foreground">
                Monitor daily activities, water intake, calories, and sleep patterns with beautiful visualizations.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all border-0 bg-card">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Weekly Analytics</h4>
              <p className="text-muted-foreground">
                Get insights into your health trends with comprehensive weekly reports and charts.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all border-0 bg-card">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Secure & Private</h4>
              <p className="text-muted-foreground">
                Your health data is protected with industry-standard security and privacy measures.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Start Your Wellness Journey?</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of patients and healthcare providers on Healthy India platform.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg" asChild>
              <Link to="/patient/register">Get Started as Patient</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2" asChild>
              <Link to="/doctor/register">Register as Doctor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Healthy India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
