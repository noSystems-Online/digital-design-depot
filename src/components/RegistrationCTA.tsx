
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Star, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const RegistrationCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Start Building?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of developers who trust Codigs for their digital product needs. 
              Get instant access to premium tools and resources.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center p-6 border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Access</h3>
                <p className="text-gray-600">Start downloading and using premium products immediately after registration.</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-2 hover:border-purple-200 transition-colors">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-gray-600">Access vetted, high-quality digital products from top developers worldwide.</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-2 hover:border-green-200 transition-colors">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Trusted</h3>
                <p className="text-gray-600">Your data is protected with enterprise-grade security and privacy measures.</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Join 10,000+ Happy Developers
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Create your free account today and discover why developers choose Codigs for their digital product needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10 px-8 py-4 text-lg">
                  Already have an account? Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm mt-4 opacity-75">
              No credit card required • Free forever • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationCTA;
