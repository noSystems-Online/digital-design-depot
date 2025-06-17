
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Settings, ShoppingBag, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Purchase {
  id: string;
  total_amount: number;
  created_at: string;
  status: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      title: string;
      download_url: string;
    };
  }[];
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: ""
  });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [userStats, setUserStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    memberSince: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchPurchases();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        setProfileData({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          phone: "", // Add phone field to profiles table if needed
          country: "" // Add country field to profiles table if needed
        });

        setUserStats(prev => ({
          ...prev,
          memberSince: new Date(profile.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          })
        }));
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    }
  };

  const fetchPurchases = async () => {
    if (!user) return;

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          status,
          order_items (
            id,
            quantity,
            price,
            products (
              id,
              title,
              download_url
            )
          )
        `)
        .eq('buyer_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        return;
      }

      if (orders) {
        const formattedPurchases = orders.map(order => ({
          id: order.id,
          total_amount: order.total_amount,
          created_at: order.created_at,
          status: order.status,
          order_items: order.order_items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.products.id,
              title: item.products.title,
              download_url: item.products.download_url
            }
          }))
        }));

        setPurchases(formattedPurchases);

        // Calculate user stats
        const totalPurchases = formattedPurchases.length;
        const totalSpent = formattedPurchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);

        setUserStats(prev => ({
          ...prev,
          totalPurchases,
          totalSpent
        }));
      }
    } catch (error) {
      console.error('Error in fetchPurchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (downloadUrl: string, productTitle: string) => {
    try {
      if (!downloadUrl) {
        toast({
          title: "Download Unavailable",
          description: "Download link is not available for this product.",
          variant: "destructive"
        });
        return;
      }

      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = productTitle;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${productTitle}...`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the file.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please log in to view your profile</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profileData.firstName} {profileData.lastName || user.name}
              </h1>
              <p className="text-gray-600">Member since {userStats.memberSince}</p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Purchases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{userStats.totalPurchases}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">${userStats.totalSpent.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Account Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : purchases.length === 0 ? (
                    <div className="text-center py-4 text-gray-600">No purchases yet</div>
                  ) : (
                    <div className="space-y-4">
                      {purchases.slice(0, 3).map((purchase) => (
                        <div key={purchase.id} className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {purchase.order_items.map(item => item.product.title).join(', ')}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(purchase.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${purchase.total_amount.toFixed(2)}</p>
                            <Badge variant="secondary">{purchase.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Purchase History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">Loading purchases...</div>
                  ) : purchases.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No purchases yet</p>
                      <p className="text-sm">Start shopping to see your purchase history here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {purchases.map((purchase) => (
                        <div key={purchase.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">Order #{purchase.id.slice(0, 8)}</h4>
                              <p className="text-sm text-gray-600">
                                Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${purchase.total_amount.toFixed(2)}</p>
                              <Badge variant="secondary">{purchase.status}</Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {purchase.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm">
                                <span>{item.product.title} (x{item.quantity})</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downloads">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Available Downloads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">Loading downloads...</div>
                  ) : purchases.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <Download className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No downloads available</p>
                      <p className="text-sm">Purchase products to access downloads here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {purchases.flatMap(purchase => 
                        purchase.order_items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{item.product.title}</h4>
                              <p className="text-sm text-gray-600">
                                Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              onClick={() => handleDownload(item.product.download_url, item.product.title)}
                              disabled={!item.product.download_url}
                            >
                              Download
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Not stored yet - add to database schema if needed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={profileData.country}
                        onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                        placeholder="Not stored yet - add to database schema if needed"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
