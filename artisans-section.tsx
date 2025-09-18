import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { Artisan } from "@shared/schema";

export default function ArtisansSection() {
  const { data: artisans = [], isLoading } = useQuery({
    queryKey: ["/api/artisans"],
  });

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    return (
      <div className="flex text-yellow-400 text-sm">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
        {hasHalfStar && <Star className="w-4 h-4 fill-current opacity-50" />}
        {[...Array(5 - Math.ceil(numRating))].map((_, i) => (
          <Star key={i + fullStars} className="w-4 h-4" />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <section id="artisans" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-artisan-brown mb-4">
              Meet Our Artisans
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Talented creators from around the world, each with their own unique story and craftsmanship
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-artisan-beige/20 rounded-xl p-6 text-center animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-16 bg-gray-200 rounded w-full mb-4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="artisans" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold text-artisan-brown mb-4">
            Meet Our Artisans
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Talented creators from around the world, each with their own unique story and craftsmanship
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artisans.map((artisan: Artisan) => (
            <div
              key={artisan.id}
              className="bg-artisan-beige/20 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <img
                src={artisan.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&h=150&fit=crop"}
                alt={`Artisan ${artisan.name}`}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-playfair font-semibold text-artisan-brown mb-2">
                {artisan.name}
              </h3>
              <p className="text-artisan-chocolate font-medium mb-3">{artisan.specialty}</p>
              <p className="text-gray-600 text-sm mb-4">{artisan.bio}</p>
              <div className="flex justify-center items-center gap-2 mb-3">
                {renderStars(artisan.rating || "5.0")}
                <span className="text-gray-500 text-sm">({artisan.reviewCount} reviews)</span>
              </div>
              <Button variant="ghost" className="text-artisan-brown hover:text-artisan-chocolate font-medium">
                View Portfolio
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
