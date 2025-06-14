
import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Camera, X } from 'lucide-react';
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName, 'to avatars bucket');

      // First, try to delete any existing avatar for this user
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list('', {
          search: currentUser.id
        });

      if (existingFiles && existingFiles.length > 0) {
        for (const file of existingFiles) {
          await supabase.storage
            .from('avatars')
            .remove([file.name]);
        }
      }

      // Upload to Supabase storage - using dedicated avatars bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
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
        .from('avatars')
        .getPublicUrl(fileName);

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
      setImagePreview(null);
      onSuccess('Profile picture uploaded successfully!');
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      });

    } catch (err) {
      console.error('Upload error:', err);
      setImagePreview(null);
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

  const clearPreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gradient-to-br from-background via-muted/20 to-background rounded-xl border border-border/50">
      <div className="relative group">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 border-4 border-border/50 shadow-xl ring-4 ring-primary/10 transition-all duration-300 group-hover:ring-primary/20">
          <AvatarImage 
            src={imagePreview || avatarUrl} 
            alt={currentUser?.username}
            className="object-cover object-center transition-all duration-300 group-hover:scale-105"
          />
          <AvatarFallback className="text-xl sm:text-2xl md:text-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 text-foreground font-semibold">
            {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay camera icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
      </div>

      {/* Preview controls */}
      {imagePreview && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
          <span className="text-sm text-muted-foreground">Preview ready</span>
          <Button
            onClick={clearPreview}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-xs">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          disabled={uploadingImage}
          className="flex-1 bg-background/80 border-border/50 text-foreground hover:bg-muted/80 hover:border-primary/50 transition-all duration-300 h-10 sm:h-11"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploadingImage ? 'Uploading...' : 'Upload Photo'}
        </Button>
        
        {avatarUrl && (
          <Button
            onClick={() => {
              onAvatarUpdate('');
              setImagePreview(null);
            }}
            variant="ghost"
            className="text-muted-foreground hover:text-destructive transition-colors duration-300 h-10 sm:h-11"
            disabled={uploadingImage}
          >
            Remove
          </Button>
        )}
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Recommended: Square image, at least 400x400px
        </p>
        <p className="text-xs text-muted-foreground/80">
          JPG, PNG or WebP. Max 5MB.
        </p>
      </div>
    </div>
  );
};

export default AvatarUpload;
