import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Product } from "@shared/schema";
import CustomizationModal from "./customization-modal";

export default function ProductsSection() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: selectedCategory === "all" ? ["/api/products"] : ["/api/products", { category: selectedCategory }],
  });

  const categories = [
    { key: "all", label: "All Items" },
    { key: "Jewelry", label: "Jewelry" },
    { key: "Home Decor", label: "Home Decor" },
    { key: "Pottery", label: "Pottery" },
    { key: "Textiles", label: "Textiles" }
  ];

  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const renderStars = (rating: string, reviewCount: number) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    return (
      <div className="flex items-center mt-2">
        <div className="flex text-yellow-400 text-sm">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
          {hasHalfStar && <Star className="w-4 h-4 fill-current opacity-50" />}
          {[...Array(5 - Math.ceil(numRating))].map((_, i) => (
            <Star key={i + fullStars} className="w-4 h-4" />
          ))}
        </div>
        <span className="text-gray-500 text-sm ml-2">({reviewCount} reviews)</span>
      </div>
    );
  };

  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold text-artisan-brown mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600">
            Handpicked selection of our most popular customizable items
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                selectedCategory === category.key
                  ? "bg-artisan-brown text-white"
                  : "bg-white text-artisan-brown border border-artisan-brown hover:bg-artisan-brown hover:text-white"
              }`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-xs bg-artisan-green text-white">
                      Customizable
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  <h3 className="font-playfair font-semibold text-lg text-artisan-brown mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-artisan-brown">
                      ${product.basePrice}
                    </span>
                    <Button
                      onClick={() => handleCustomize(product)}
                      className="bg-artisan-brown text-white px-4 py-2 rounded-full text-sm hover:bg-artisan-chocolate transition-colors"
                    >
                      Customize
                    </Button>
                  </div>
                  {renderStars(product.rating || "5.0", product.reviewCount || 0)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button className="bg-artisan-brown text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-artisan-chocolate transition-colors shadow-lg">
            View All Products
          </Button>
        </div>
      </div>

      <CustomizationModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
