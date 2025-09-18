import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface CustomizationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CustomizationState {
  color: string;
  size: string;
  material: string;
  engraving: string;
  specialInstructions: string;
  quantity: number;
}

export default function CustomizationModal({ product, isOpen, onClose }: CustomizationModalProps) {
  const [customizations, setCustomizations] = useState<CustomizationState>({
    color: "",
    size: "",
    material: "",
    engraving: "",
    specialInstructions: "",
    quantity: 1
  });
  
  const [totalPrice, setTotalPrice] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async (cartData: any) => {
      const response = await apiRequest("POST", "/api/cart", cartData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Your customized item has been added to your cart.",
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (product) {
      calculateTotalPrice();
    }
  }, [product, customizations]);

  const calculateTotalPrice = () => {
    if (!product) return;
    
    let price = parseFloat(product.basePrice);
    const options = product.customizationOptions as any;
    
    // Add material cost
    if (options?.materials) {
      const selectedMaterial = options.materials.find((m: any) => m.name === customizations.material);
      if (selectedMaterial) {
        price += selectedMaterial.price || 0;
      }
    }
    
    // Add engraving cost
    if (options?.engraving?.available && customizations.engraving) {
      price += options.engraving.price || 0;
    }
    
    setTotalPrice(price * customizations.quantity);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartData = {
      productId: product.id,
      quantity: customizations.quantity,
      customizations: customizations,
      totalPrice: totalPrice.toString()
    };
    
    addToCartMutation.mutate(cartData);
  };

  const handleCustomizationChange = (key: keyof CustomizationState, value: string | number) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!product) return null;

  const options = product.customizationOptions as any;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair font-bold text-artisan-brown">
            Customize Your Product
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid lg:grid-cols-2 gap-8 mt-6">
          {/* Product Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-artisan-brown">Preview</h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-64 h-64 object-cover rounded-lg shadow-md mx-auto"
              />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-artisan-brown">
                ${totalPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Estimated delivery: 2-3 weeks</p>
            </div>
          </div>
          
          {/* Customization Options */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-artisan-brown">Customization Options</h3>
            
            {/* Color Selection */}
            {options?.colors && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Color
                </Label>
                <div className="flex gap-3">
                  {options.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => handleCustomizationChange('color', color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        customizations.color === color 
                          ? 'border-artisan-brown border-4' 
                          : 'border-gray-300 hover:border-artisan-brown'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Size Selection */}
            {options?.sizes && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-3">Size</Label>
                <div className="grid grid-cols-3 gap-2">
                  {options.sizes.map((size: string) => (
                    <Button
                      key={size}
                      variant={customizations.size === size ? "default" : "outline"}
                      onClick={() => handleCustomizationChange('size', size)}
                      className={`${
                        customizations.size === size 
                          ? 'bg-artisan-brown text-white' 
                          : 'border-gray-300 hover:border-artisan-brown hover:bg-artisan-brown hover:text-white'
                      }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Material Selection */}
            {options?.materials && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-3">Material</Label>
                <Select onValueChange={(value) => handleCustomizationChange('material', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.materials.map((material: any) => (
                      <SelectItem key={material.name} value={material.name}>
                        {material.name} {material.price > 0 && `(+$${material.price})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Personal Engraving */}
            {options?.engraving?.available && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-3">
                  Personal Engraving (Optional)
                </Label>
                <Input
                  type="text"
                  placeholder="Enter your text here..."
                  maxLength={options.engraving.maxChars}
                  value={customizations.engraving}
                  onChange={(e) => handleCustomizationChange('engraving', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum {options.engraving.maxChars} characters. Additional ${options.engraving.price}
                </p>
              </div>
            )}
            
            {/* Quantity */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">Quantity</Label>
              <Input
                type="number"
                min="1"
                value={customizations.quantity}
                onChange={(e) => handleCustomizationChange('quantity', parseInt(e.target.value) || 1)}
                className="w-20"
              />
            </div>
            
            {/* Special Instructions */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">
                Special Instructions
              </Label>
              <Textarea
                rows={3}
                placeholder="Any special requests or notes for the artisan..."
                value={customizations.specialInstructions}
                onChange={(e) => handleCustomizationChange('specialInstructions', e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="flex-1 bg-artisan-brown text-white py-3 rounded-full font-semibold hover:bg-artisan-chocolate transition-colors"
              >
                {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                className="px-6 py-3 border border-artisan-brown text-artisan-brown rounded-full font-semibold hover:bg-artisan-brown hover:text-white transition-colors"
              >
                Save for Later
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
