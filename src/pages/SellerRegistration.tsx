import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, DollarSign, Users, TrendingUp, Shield, Clock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SellerRegistration = () => {
  const { user, isLoggedIn, isSeller, applyToBeSeller } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: "",
    email: user?.email || "",
    phone: "",
    description: "",
    productTypes: [] as string[],
    agreeToTerms: false
  });

  useEffect(() => {
    if (user && isSeller && user.sellerInfo) {
      setFormData({
        businessName: user.sellerInfo.businessName || "",
        email: user.email,
        phone: user.sellerInfo.phone || "",
        description: user.sellerInfo.description || "",
        productTypes: user.sellerInfo.productTypes || [],
        agreeToTerms: true
      });
    }
  }, [user, isSeller]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await applyToBeSeller({
        businessName: formData.businessName,
        phone: formData.phone,
        description: formData.description,
        productTypes: formData.productTypes
      });

      if (result.success) {
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error("Failed to submit seller application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        productTypes: [...prev.productTypes, type]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        productTypes: prev.productTypes.filter(t => t !== type)
      }));
    }
  };

  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      title: "No Upfront Fees",
      description: "Join our marketplace for free. You only pay when you make a sale."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Access to Customers",
      description: "Reach thousands of developers and businesses looking for quality digital products."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      title: "Easy Analytics",
      description: "Track your sales, earnings, and customer feedback with our built-in dashboard."
    },
    {
      icon: <Shield className="h-6 w-6 text-orange-600" />,
      title: "Secure Payments",
      description: "All payments are processed securely and you receive funds directly to your account."
    }
  ];

  const productTypes = [
    "Software Applications",
    "Website Templates",
    "Code Scripts & Libraries",
    "Design Resources",
    "Mobile Apps",
    "WordPress Themes",
    "Other Digital Products"
  ];

  if (submitSuccess) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="text-center">
              <CardContent className="p-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Application Submitted Successfully!
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Thank you for applying to become a seller on CodeMarket. Our team will review your application and get back to you within 24-48 hours.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => navigate("/profile")}>
                    Go to Profile
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isSeller) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Seller Account
              </h1>
              <div className="flex justify-center">
                {user?.sellerStatus === 'approved' ? (
                  <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Approved Seller
                  </Badge>
                ) : user?.sellerStatus === 'pending' ? (
                  <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2 text-lg">
                    <Clock className="h-5 w-5 mr-2" />
                    Application Pending Review
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 px-4 py-2 text-lg">
                    Application Under Review
                  </Badge>
                )}
              </div>
            </div>

            {user?.sellerStatus === 'approved' && (
              <div className="text-center mb-8">
                <Button asChild size="lg">
                  <a href="/seller-dashboard">Go to Seller Dashboard</a>
                </Button>
              </div>
            )}

            {user?.sellerStatus === 'pending' && (
              <Alert className="mb-8">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your seller application is currently being reviewed. We'll notify you via email once it's processed.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <User className="h-6 w-6 mr-2" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="businessName">Business/Brand Name *</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder="Your business or brand name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Business Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell us about your business and the products you plan to sell..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-4 block">
                      What types of products will you sell? (Select all that apply)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {productTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={formData.productTypes.includes(type)}
                            onCheckedChange={(checked) => handleProductTypeChange(type, checked as boolean)}
                          />
                          <Label htmlFor={type} className="text-sm cursor-pointer">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Seller Information"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="text-center">
              <CardContent className="p-8">
                <User className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Login Required
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  You need to be logged in to apply as a seller. Please login or create an account first.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => navigate("/login")}>
                    Login
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/register")}>
                    Create Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Become a Seller
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Start selling your digital products today with zero upfront costs
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
              <div className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Only pay when you sell - No monthly fees, no setup costs</span>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{benefit.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing Info */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-blue-800">
                Simple, Fair Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5%</div>
              <p className="text-lg text-gray-700 mb-4">
                Commission per sale - that's it!
              </p>
              <p className="text-gray-600">
                We only succeed when you succeed. No hidden fees, no monthly charges, no setup costs.
              </p>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Seller Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="businessName">Business/Brand Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Your business or brand name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-50"
                      placeholder="Logged in email will be used"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell us about your business and the products you plan to sell..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block">
                    What types of products will you sell? (Select all that apply)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {productTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={formData.productTypes.includes(type)}
                          onCheckedChange={(checked) => handleProductTypeChange(type, checked as boolean)}
                        />
                        <Label htmlFor={type} className="text-sm cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    I agree to the Terms of Service and understand that I will only be charged a 5% commission when I make a sale. There are no upfront fees or monthly charges.
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                  disabled={!formData.agreeToTerms || isSubmitting}
                >
                  {isSubmitting ? "Submitting Application..." : "Apply to Become a Seller"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center text-gray-600">
            <p>
              After registration, our team will review your application and get back to you within 24-48 hours.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerRegistration;
