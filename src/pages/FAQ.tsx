
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, ShoppingCart, CreditCard, Download, Users, Settings } from "lucide-react";

const FAQ = () => {
  const faqCategories = [
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: "General",
      faqs: [
        {
          question: "What is Codigs Store?",
          answer: "Codigs Store is a marketplace for digital products including web applications, mobile apps, code scripts, and templates. We connect buyers with sellers of high-quality digital assets."
        },
        {
          question: "How do I create an account?",
          answer: "Click the 'Register' button in the top right corner, fill out the required information, and verify your email address. It's free and takes less than 2 minutes."
        },
        {
          question: "Is it free to browse products?",
          answer: "Yes, browsing and searching for products is completely free. You only pay when you decide to purchase a product."
        }
      ]
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Payments & Billing",
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept PayPal (including credit and debit cards through PayPal) and bank transfers. All payments are processed securely."
        },
        {
          question: "Are transactions secure?",
          answer: "Yes, all transactions are secured with SSL encryption and processed through trusted payment providers like PayPal."
        },
        {
          question: "Can I get a refund?",
          answer: "Refunds are handled on a case-by-case basis. Due to the digital nature of our products, refunds are typically only provided for technical issues or if the product doesn't match its description."
        },
        {
          question: "Do you charge any additional fees?",
          answer: "The price you see is the price you pay. We don't charge any additional fees to buyers. All fees are included in the listed price."
        }
      ]
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Downloads & Products",
      faqs: [
        {
          question: "How do I download my purchased products?",
          answer: "After successful payment, you'll receive download links via email and can also access them from your profile page. Downloads are available immediately after purchase."
        },
        {
          question: "How long do download links remain active?",
          answer: "Download links never expire. You can re-download your purchased products anytime from your profile page."
        },
        {
          question: "What file formats are supported?",
          answer: "We support various file formats including ZIP, PDF, HTML, CSS, JS, and more. Each product listing specifies the included file formats."
        },
        {
          question: "Can I download products multiple times?",
          answer: "Yes, you can download your purchased products as many times as you need. There are no download limits."
        }
      ]
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Selling",
      faqs: [
        {
          question: "How can I become a seller?",
          answer: "Click 'Become a Seller' in the navigation menu, complete the seller registration form, and wait for approval. Our team reviews all seller applications."
        },
        {
          question: "What can I sell on Codigs Store?",
          answer: "You can sell digital products including web applications, mobile apps, code scripts, templates, and other digital assets. All products must be original or properly licensed."
        },
        {
          question: "What commission do you charge sellers?",
          answer: "We charge a competitive commission on each sale. The exact percentage depends on your seller level and is detailed in the seller terms."
        },
        {
          question: "How do I receive payments as a seller?",
          answer: "Seller payments are processed automatically and sent to your registered PayPal account according to our payout schedule."
        }
      ]
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Account & Support",
      faqs: [
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page, enter your email address, and follow the instructions in the reset email we send you."
        },
        {
          question: "Can I change my email address?",
          answer: "Yes, you can update your email address in your profile settings. You'll need to verify the new email address."
        },
        {
          question: "How can I contact customer support?",
          answer: "You can reach us through the Contact Us page, via email at support@codigsstore.com, or through our live chat feature."
        },
        {
          question: "What are your support hours?",
          answer: "Our support team is available Monday through Friday, 9 AM to 6 PM EST. We respond to all inquiries within 24 hours."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">
              Find quick answers to the most common questions about Codigs Store
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    {category.icon}
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                    <Badge variant="secondary">{category.faqs.length}</Badge>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left hover:text-blue-600">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
                <p className="text-gray-600 mb-4">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                  Contact Support
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
