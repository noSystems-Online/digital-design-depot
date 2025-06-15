
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createProduct, ProductCreationData } from "@/services/productService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0.01, "Price must be a positive number"),
  category: z.enum(["software", "templates", "code-scripts", "resources"]),
  image_url: z.string().url("Please enter a valid image URL").or(z.literal("")).optional(),
  download_url: z.string().url("Please enter a valid product file URL").or(z.literal("")).optional(),
  tags: z.string().optional(),
});

const ProductUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "software",
      image_url: "",
      download_url: "",
      tags: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to create a product." });
      return;
    }
    setIsLoading(true);

    const productData: ProductCreationData = {
      title: values.title,
      description: values.description,
      price: values.price,
      category: values.category,
      image_url: values.image_url || undefined,
      download_url: values.download_url || undefined,
      tags: values.tags?.split(",").map(tag => tag.trim()).filter(tag => tag) || [],
      seller_id: user.id,
    };

    console.log("Submitting product data:", productData);
    const result = await createProduct(productData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Product Submitted!",
        description: "Your product has been submitted for review. You will be notified upon approval.",
      });
      navigate("/seller-dashboard");
    } else {
      console.error("Product submission failed:", result.error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your product. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Upload New Product</h1>
            <p className="text-gray-600 mt-2">Fill out the details below. Your product will be reviewed by an admin before it goes live.</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ultimate React Boilerplate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Describe your product in detail..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 49.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="templates">Templates</SelectItem>
                        <SelectItem value="code-scripts">Code Scripts</SelectItem>
                        <SelectItem value="resources">Resources</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.png" {...field} />
                    </FormControl>
                    <FormDescription>This will be the main display image for your product.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="download_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product File URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/product.zip" {...field} />
                    </FormControl>
                    <FormDescription>The link to the file customers will download after purchase.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., react, tailwind, typescript" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated tags to help users find your product.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>{isLoading ? "Submitting..." : "Submit for Review"}</Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductUpload;
