
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return null;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB.",
          variant: "destructive",
        });
        return null;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};
