
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Code, Download, Settings, Users, CreditCard } from "lucide-react";

const Documentation = () => {
  const docSections = [
    {
      icon: <Book className="h-8 w-8 text-blue-600" />,
      title: "Getting Started",
      description: "Everything you need to know to start using Codigs Store",
      topics: [
        { title: "Account Registration", status: "Complete" },
        { title: "Profile Setup", status: "Complete" },
        { title: "First Purchase Guide", status: "Complete" },
        { title: "Download Instructions", status: "Complete" }
      ]
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "For Buyers",
      description: "Learn how to find, purchase, and use digital products",
      topics: [
        { title: "Browsing Products", status: "Complete" },
        { title: "Payment Methods", status: "Complete" },
        { title: "Download Management", status: "Complete" },
        { title: "Refund Policy", status: "Complete" }
      ]
    },
    {
      icon: <Code className="h-8 w-8 text-purple-600" />,
      title: "For Sellers",
      description: "Guidelines for selling your digital products",
      topics: [
        { title: "Seller Registration", status: "Complete" },
        { title: "Product Upload", status: "Complete" },
        { title: "Pricing Guidelines", status: "Complete" },
        { title: "Sales Analytics", status: "Complete" }
      ]
    },
    {
      icon: <CreditCard className="h-8 w-8 text-orange-600" />,
      title: "Payments & Billing",
      description: "Understanding payments, fees, and billing",
      topics: [
        { title: "Payment Processing", status: "Complete" },
        { title: "Fee Structure", status: "Complete" },
        { title: "Payout Schedule", status: "Complete" },
        { title: "Tax Information", status: "Complete" }
      ]
    },
    {
      icon: <Download className="h-8 w-8 text-red-600" />,
      title: "Technical Guides",
      description: "Technical documentation and troubleshooting",
      topics: [
        { title: "File Formats Supported", status: "Complete" },
        { title: "Download Limits", status: "Complete" },
        { title: "Browser Requirements", status: "Complete" },
        { title: "API Documentation", status: "Coming Soon" }
      ]
    },
    {
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      title: "Account Management",
      description: "Managing your account settings and preferences",
      topics: [
        { title: "Profile Settings", status: "Complete" },
        { title: "Notification Preferences", status: "Complete" },
        { title: "Security Settings", status: "Complete" },
        { title: "Data Export", status: "Complete" }
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
            <p className="text-xl text-gray-600">
              Comprehensive guides and documentation for using Codigs Store
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docSections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-2">
                    {section.icon}
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </div>
                  <p className="text-gray-600">{section.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center justify-between">
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                          {topic.title}
                        </span>
                        <Badge 
                          variant={topic.status === "Complete" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {topic.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Need more help?</h3>
                  <p className="text-gray-600 mb-6">
                    Can't find what you're looking for in our documentation? 
                    Our support team is ready to assist you.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                      Contact Support
                    </button>
                    <button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100">
                      Join Community
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;
