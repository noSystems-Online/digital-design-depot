
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

const ProductSearch = ({ searchTerm, onSearchChange, placeholder = "Search products..." }: ProductSearchProps) => {
  return (
    <div className="relative max-w-md mx-auto mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default ProductSearch;
