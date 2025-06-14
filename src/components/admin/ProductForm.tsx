
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit2, Upload, X } from 'lucide-react';
import { Product } from '@/hooks/useAdminData';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (productData: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  loading = false,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    image: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [useUrlInput, setUseUrlInput] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        price: product.price.toString(),
        description: product.description,
        category: product.category,
        stock: product.stock.toString(),
        image: product.image
      });
      setImagePreview(product.image);
    }
  }, [product]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setFormData(prev => ({ ...prev, image: uploadedUrl }));
      setImagePreview(uploadedUrl);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    });
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
          <div className={`p-2 rounded-lg ${isEditing ? 'bg-blue-500' : 'bg-green-500'}`}>
            {isEditing ? (
              <Edit2 className="h-5 w-5 text-white" />
            ) : (
              <PlusCircle className="h-5 w-5 text-white" />
            )}
          </div>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 rounded-lg border-gray-300"
                required
              />
            </div>
            <div>
              <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="mt-1 rounded-lg border-gray-300"
                required
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="mt-1 rounded-lg border-gray-300"
                required
              />
            </div>
            <div>
              <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="mt-1 rounded-lg border-gray-300"
                required
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="t-shirts">T-Shirts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Product Image</Label>
            
            {/* Toggle between upload and URL input */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={useUrlInput ? "default" : "outline"}
                size="sm"
                onClick={() => setUseUrlInput(true)}
              >
                Image URL
              </Button>
              <Button
                type="button"
                variant={!useUrlInput ? "default" : "outline"}
                size="sm"
                onClick={() => setUseUrlInput(false)}
              >
                Upload Image
              </Button>
            </div>

            {useUrlInput ? (
              <div>
                <Input
                  placeholder="Enter image URL"
                  value={formData.image}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="rounded-lg border-gray-300"
                />
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 p-6"
                >
                  <Upload className="h-6 w-6 mr-2" />
                  {uploading ? 'Uploading...' : 'Click to upload image'}
                </Button>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 rounded-lg border-gray-300"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={loading || uploading} 
              className={`flex-1 rounded-lg py-3 font-medium ${
                isEditing 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading || uploading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Product' : 'Add Product')}
            </Button>
            {isEditing && onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="px-8 rounded-lg"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
