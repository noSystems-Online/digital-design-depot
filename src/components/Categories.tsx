
import { Code, FileText, Package, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Categories = () => {
  const categories = [
    {
      id: "software",
      icon: Package,
      title: "Software",
      description: "Desktop applications, mobile apps, and web software",
      count: "200+ products"
    },
    {
      id: "templates",
      icon: FileText,
      title: "Templates",
      description: "Website templates, design mockups, and UI kits",
      count: "500+ templates"
    },
    {
      id: "scripts",
      icon: Code,
      title: "Code Scripts",
      description: "Ready-to-use scripts, plugins, and code snippets",
      count: "800+ scripts"
    },
    {
      id: "resources",
      icon: Wrench,
      title: "Resources",
      description: "Tools, utilities, and development resources",
      count: "300+ resources"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find exactly what you need from our extensive collection of digital products
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.id} 
                id={category.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-gray-600 mb-3">{category.description}</p>
                  <span className="text-sm text-blue-600 font-medium">{category.count}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
