
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubscribing(true);
    
    // Simulate newsletter subscription
    setTimeout(() => {
      toast({
        title: "Successfully Subscribed!",
        description: "Thank you for subscribing to our newsletter. You'll receive the latest updates and products in your inbox.",
      });
      setEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Codigs Store
            </h3>
            <p className="text-gray-400 mb-4">
              The premier marketplace for digital products, templates, and code solutions.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <span className="text-xs">f</span>
              </div>
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                <span className="text-xs">t</span>
              </div>
              <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-900 transition-colors">
                <span className="text-xs">in</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/software" className="hover:text-white transition-colors">Web Applications</Link></li>
              <li><Link to="/software" className="hover:text-white transition-colors">Mobile Apps</Link></li>
              <li><Link to="/code-scripts" className="hover:text-white transition-colors">Code Scripts</Link></li>
              <li><Link to="/templates" className="hover:text-white transition-colors">Templates</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact-us" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4 text-sm">
              Get the latest products and updates delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
              <Input 
                type="email"
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                disabled={isSubscribing}
              />
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isSubscribing}
              >
                {isSubscribing ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Codigs Store. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
