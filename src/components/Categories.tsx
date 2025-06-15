
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Categories = () => {
  const categories = [
    {
      title: "Web Applications",
      description: "Full-stack web apps, SaaS templates, and admin dashboards",
      count: "240+",
      color: "bg-blue-500",
      items: ["React Apps", "Vue Templates", "Admin Panels", "SaaS Kits"]
    },
    {
      title: "Mobile Apps",
      description: "React Native, Flutter, and native mobile applications",
      count: "180+",
      color: "bg-green-500",
      items: ["React Native", "Flutter", "iOS Apps", "Android Apps"]
    },
    {
      title: "Code Scripts",
      description: "Automation scripts, utilities, and development tools",
      count: "320+",
      color: "bg-purple-500",
      items: ["Python Scripts", "Node.js Tools", "Automation", "APIs"]
    },
    {
      title: "UI Templates",
      description: "Landing pages, portfolios, and design templates",
      count: "450+",
      color: "bg-orange-500",
      items: ["Landing Pages", "Portfolios", "E-commerce", "Blogs"]
    },
    {
      title: "Developer Tools",
      description: "Libraries, frameworks, and development utilities",
      count: "150+",
      color: "bg-red-500",
      items: ["Libraries", "Frameworks", "CLI Tools", "Extensions"]
    },
    {
      title: "Design Assets",
      description: "Icons, illustrations, and design system components",
      count: "280+",
      color: "bg-indigo-500",
      items: ["Icon Packs", "Illustrations", "Components", "Themes"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find exactly what you need from our curated collection of digital products
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {category.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item, itemIndex) => (
                    <Badge key={itemIndex} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
