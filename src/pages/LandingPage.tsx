
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Users, Shield, MapPin, Clock, DollarSign } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Car,
      title: "Easy Ride Sharing",
      description: "Connect with fellow travelers and share rides to save money and reduce environmental impact."
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join a community of verified users for safe and reliable transportation."
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your safety is our priority with verified profiles and secure payment systems."
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get live updates about your rides, pickup times, and route changes."
    },
    {
      icon: MapPin,
      title: "Flexible Routes",
      description: "Create custom routes or join existing ones that match your travel plans."
    },
    {
      icon: DollarSign,
      title: "Cost Effective",
      description: "Split costs with other passengers and save money on your daily commute."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Safar</span>
            </div>
            <div className="flex space-x-3">
              <Link to="/login">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Share Rides,
                <span className="text-blue-600"> Save Money</span>,
                <span className="text-green-600"> Help Planet</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
                Join thousands of travelers who are making their journeys more affordable, 
                sustainable, and social. Find rides or offer seats in your car.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-3">
                    Start Sharing Rides
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-3">
                    Sign In
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Verified Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Real-time Tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>Save up to 70%</span>
                </div>
              </div>
            </div>

            {/* Car Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl p-8 lg:p-12">
                <div className="relative">
                  {/* Simple Car SVG */}
                  <svg
                    viewBox="0 0 400 200"
                    className="w-full h-auto max-w-md mx-auto"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Car Body */}
                    <rect x="50" y="100" width="300" height="60" rx="30" fill="#3B82F6" />
                    <rect x="80" y="80" width="240" height="40" rx="20" fill="#1E40AF" />
                    
                    {/* Windows */}
                    <rect x="90" y="85" width="70" height="30" rx="5" fill="#E0F2FE" />
                    <rect x="170" y="85" width="70" height="30" rx="5" fill="#E0F2FE" />
                    <rect x="250" y="85" width="60" height="30" rx="5" fill="#E0F2FE" />
                    
                    {/* Wheels */}
                    <circle cx="120" cy="160" r="25" fill="#374151" />
                    <circle cx="120" cy="160" r="15" fill="#6B7280" />
                    <circle cx="280" cy="160" r="25" fill="#374151" />
                    <circle cx="280" cy="160" r="15" fill="#6B7280" />
                    
                    {/* Headlights */}
                    <circle cx="350" cy="130" r="8" fill="#FCD34D" />
                    <circle cx="50" cy="130" r="8" fill="#F87171" />
                    
                    {/* People Icons */}
                    <circle cx="110" cy="100" r="6" fill="#10B981" />
                    <circle cx="130" cy="100" r="6" fill="#10B981" />
                    <circle cx="190" cy="100" r="6" fill="#10B981" />
                    <circle cx="270" cy="100" r="6" fill="#10B981" />
                  </svg>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Safar?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of transportation with our comprehensive ride-sharing platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our community today and discover a smarter way to travel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-3">
                Create Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-3 bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <Car className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Safar</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Safar. Making transportation smarter and more sustainable.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
