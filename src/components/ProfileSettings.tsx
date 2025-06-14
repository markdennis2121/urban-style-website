
import React, { useState, useRef } from 'react';
import { supabase, getCurrentProfile } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Upload, Save, MapPin, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProfileSettings = ({ currentUser, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [username, setUsername] = useState(currentUser?.username || '');
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [state, setState] = useState(currentUser?.state || '');
  const [postalCode, setPostalCode] = useState(currentUser?.postal_code || '');
  const [country, setCountry] = useState(currentUser?.country || 'Philippines');
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        const errorMsg = "Please select an image file.";
        setError(errorMsg);
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
        setError(errorMsg);
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
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase storage - using avatars bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setSuccess('Profile picture uploaded successfully!');
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      });

    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = "Failed to upload image. Please try again.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
          avatar_url: avatarUrl,
          phone,
          address,
          city,
          state,
          postal_code: postalCode,
          country,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
      // Refresh profile data
      const updatedProfile = await getCurrentProfile();
      onProfileUpdate?.(updatedProfile);
    } catch (err) {
      console.error('Update error:', err);
      const errorMsg = "Failed to update profile. Please try again.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background p-4">
      <Card className="max-w-4xl mx-auto bg-card/80 backdrop-blur-md border border-border/50 shadow-xl">
        <div className="p-8">
          <div className="flex items-center space-x-2 mb-8">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
          </div>

          {error && (
            <Alert className="mb-6 bg-destructive/10 border-destructive/20 text-destructive">
              {error}
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-500/10 border-green-500/20 text-green-600">
              {success}
            </Alert>
          )}

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="bg-muted/50 backdrop-blur-md border border-border/50">
              <TabsTrigger value="personal" className="data-[state=active]:bg-background/80 text-foreground">
                <User className="w-4 h-4 mr-2" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:bg-background/80 text-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                Shipping Address
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-6">
                  <Avatar className="h-32 w-32 border-4 border-border/50 shadow-lg">
                    <AvatarImage src={avatarUrl} alt={username} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground">
                      {username?.charAt(0)?.toUpperCase() || 'U'}
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
                    disabled={uploadingImage || loading}
                    className="bg-background/50 border-border/50 text-foreground hover:bg-muted/50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </div>

                {/* Personal Information Form */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-foreground text-sm font-medium mb-2 block">
                      Username
                    </Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground text-sm font-medium mb-2 block">
                      Full Name
                    </Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground text-sm font-medium mb-2 block">
                      Email
                    </Label>
                    <Input
                      value={currentUser?.email}
                      disabled
                      className="bg-muted/30 border-border/30 text-muted-foreground"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground text-sm font-medium mb-2 block">
                      Phone Number
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="text-foreground text-sm font-medium mb-2 block">
                    Street Address
                  </Label>
                  <Textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your street address"
                    className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground text-sm font-medium mb-2 block">
                      City
                    </Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground text-sm font-medium mb-2 block">
                        State/Province
                      </Label>
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Enter state"
                        className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div>
                      <Label className="text-foreground text-sm font-medium mb-2 block">
                        Postal Code
                      </Label>
                      <Input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Enter postal code"
                        className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-foreground text-sm font-medium mb-2 block">
                      Country
                    </Label>
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Enter country"
                      className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-6 border-t border-border/10">
            <Button
              onClick={handleSaveProfile}
              disabled={loading || uploadingImage}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSettings;
