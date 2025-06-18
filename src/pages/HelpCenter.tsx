
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, FileText, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const helpCategories = [
    {
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
      title: "Getting Started",
      description: "Learn the basics of using our platform",
      articles: ["Creating an Account", "Making Your First Purchase", "Understanding Digital Products"]
    },
    {
      icon: <FileText className="h-8 w-8 text-green-600" />,
      title: "Account & Billing",
      description: "Manage your account and payment information",
      articles: ["Payment Methods", "Billing History", "Account Settings"]
    },
    {
      icon: <HelpCircle className="h-8 w-8 text-purple-600" />,
      title: "Technical Support",
      description: "Get help with technical issues",
      articles: ["Download Problems", "Browser Compatibility", "File Formats"]
    },
    {
      icon: <Phone className="h-8 w-8 text-orange-600" />,
      title: "Contact Us",
      description: "Reach out to our support team",
      articles: ["Live Chat", "Email Support", "Phone Support"]
    }
  ];

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.articles.some(article => article.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 mb-8">Find answers to your questions and get the help you need</p>
            
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    {category.icon}
                    <div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        • {article}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Still need help?</h3>
                <p className="text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Contact Support
                  </button>
                  <button className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100">
                    Start Live Chat
                  </button>
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

export default HelpCenter;
