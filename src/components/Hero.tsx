
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, UserPlus, ChevronLeft, ChevronRight, Calendar, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedNews } from "@/services/newsService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { data: featuredNews, isLoading } = useQuery({
    queryKey: ['featuredNews'],
    queryFn: fetchFeaturedNews,
  });

  useEffect(() => {
    if (featuredNews && featuredNews.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredNews]);

  const nextSlide = () => {
    if (featuredNews) {
      setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    }
  };

  const prevSlide = () => {
    if (featuredNews) {
      setCurrentSlide((prev) => (prev - 1 + featuredNews.length) % featuredNews.length);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          {/* News/Promotions Carousel */}
          {!isLoading && featuredNews && featuredNews.length > 0 && (
            <div className="mb-12">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Latest News & Promotions</h2>
                  {featuredNews.length > 1 && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={prevSlide}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={nextSlide}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {featuredNews.map((news, index) => (
                      <div key={news.id} className="w-full flex-shrink-0">
                        <Card className="border-0 shadow-none bg-transparent">
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge 
                                    variant={news.type === 'promotion' ? 'destructive' : news.type === 'announcement' ? 'default' : 'secondary'}
                                    className="capitalize"
                                  >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {news.type}
                                  </Badge>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {format(new Date(news.valid_from), 'PPP')}
                                  </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{news.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{news.content}</p>
                              </div>
                              {news.image_url && (
                                <div className="w-full md:w-48 h-32 md:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                  <img 
                                    src={news.image_url} 
                                    alt={news.title}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                {featuredNews.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {featuredNews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Hero Content */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-gray-600 ml-2">Trusted by 10,000+ developers</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Premium Digital
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Products
              </span>
              <br />
              for Developers
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover high-quality software, templates, and code scripts to accelerate your projects. 
              Built by developers, for developers.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link to="/software">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community Today!</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Create your free account to access exclusive deals, save your favorites, and connect with top developers. 
                Start building amazing projects faster than ever before.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Free to join
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Instant access to products
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Exclusive member deals
                </div>
              </div>
              <div className="mt-6">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
                    Create Account Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </section>
  );
};

export default Hero;
