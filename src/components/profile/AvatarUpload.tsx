
import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentUser: any;
  avatarUrl: string;
  onAvatarUpdate: (url: string) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const AvatarUpload = ({ currentUser, avatarUrl, onAvatarUpdate, onSuccess, onError }: AvatarUploadProps) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      onError('');

      // Validate file type
      if (!file.type.startsWith('image/')) {
        const errorMsg = "Please select an image file.";
        onError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = "Image must be less than 5MB.";
        onError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Uploading file:', fileName, 'to product-images bucket');

      // Upload to Supabase storage - using product-images bucket which we know exists
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`avatars/${filePath}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(`avatars/${filePath}`);

      console.log('Public URL:', publicUrl);

      // Update the profile in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      onAvatarUpdate(publicUrl);
      onSuccess('Profile picture uploaded successfully!');
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      });

    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = "Failed to upload image. Please try again.";
      onError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <Avatar className="h-32 w-32 border-4 border-border/50 shadow-lg">
        <AvatarImage src={avatarUrl} alt={currentUser?.username} />
        <AvatarFallback className="text-2xl bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground">
          {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        disabled={uploadingImage}
        className="bg-background/50 border-border/50 text-foreground hover:bg-muted/50"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploadingImage ? 'Uploading...' : 'Upload Photo'}
      </Button>
    </div>
  );
};

export default AvatarUpload;
