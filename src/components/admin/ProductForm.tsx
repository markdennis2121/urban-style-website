
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { categories } from '@/data/products';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Product } from '@/hooks/useAdminData';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: any) => void;
  onCancel: () => void;
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
    name: product?.name || '',
    brand: product?.brand || '',
    price: product?.price || 0,
    description: product?.description || '',
    category: product?.category || '',
    stock: product?.stock || 0,
    image: product?.image || '',
    is_featured: product?.is_featured || false,
    is_new_arrival: product?.is_new_arrival || false,
  });

  const { uploadImage, uploading, error: uploadError } = useImageUpload();
  const [imagePreview, setImagePreview] = useState<string>(product?.image || '');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImage(file);
      handleInputChange('image', imageUrl);
      setImagePreview(imageUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const clearImage = () => {
    handleInputChange('image', '');
    setImagePreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <CardTitle className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                required
                className="rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="price">Price (₱)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                required
                className="rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                required
                className="rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="image-url">Image URL (Optional)</Label>
              <Input
                id="image-url"
                value={formData.image}
                onChange={(e) => {
                  handleInputChange('image', e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="https://example.com/image.jpg"
                className="rounded-lg"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              className="rounded-lg"
              rows={4}
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <Label>Product Image</Label>
            <div className="mt-2 space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload image or drag and drop'}
                    </span>
                    <span className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</span>
                  </div>
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={clearImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {uploadError && (
                <div className="text-red-600 text-sm">{uploadError}</div>
              )}
            </div>
          </div>

          {/* Feature Flags */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Product Features</Label>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured" className="text-sm">
                  Featured Product (will appear in Featured Products section)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_new_arrival"
                  checked={formData.is_new_arrival}
                  onCheckedChange={(checked) => handleInputChange('is_new_arrival', checked)}
                />
                <Label htmlFor="is_new_arrival" className="text-sm">
                  New Arrival (will appear in New Arrivals section)
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading || uploading}
              className="bg-green-600 hover:bg-green-700 rounded-lg"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
