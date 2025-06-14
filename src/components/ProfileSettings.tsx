
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

const ProfileSettings = ({ currentUser, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
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

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      setSuccess('Profile picture uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
      
      // Refresh profile data
      const updatedProfile = await getCurrentProfile();
      onProfileUpdate?.(updatedProfile);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
        <div className="p-8">
          <div className="flex items-center space-x-2 mb-8">
            <User className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          </div>

          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-300">
              {error}
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-500/10 border-green-500/20 text-green-300">
              {success}
            </Alert>
          )}

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="bg-white/10 backdrop-blur-md border-white/20">
              <TabsTrigger value="personal" className="data-[state=active]:bg-white/20 text-white">
                <User className="w-4 h-4 mr-2" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:bg-white/20 text-white">
                <MapPin className="w-4 h-4 mr-2" />
                Shipping Address
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-6">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarUrl} alt={username} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
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
                    disabled={loading}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>

                {/* Personal Information Form */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-white text-sm font-medium mb-2 block">
                      Username
                    </Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div>
                    <Label className="text-white text-sm font-medium mb-2 block">
                      Full Name
                    </Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div>
                    <Label className="text-white text-sm font-medium mb-2 block">
                      Email
                    </Label>
                    <Input
                      value={currentUser?.email}
                      disabled
                      className="bg-white/5 border-white/10 text-white/70"
                    />
                  </div>

                  <div>
                    <Label className="text-white text-sm font-medium mb-2 block">
                      Phone Number
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">
                    Street Address
                  </Label>
                  <Textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your street address"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-white text-sm font-medium mb-2 block">
                      City
                    </Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">
                        State/Province
                      </Label>
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Enter state"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>

                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">
                        Postal Code
                      </Label>
                      <Input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Enter postal code"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-sm font-medium mb-2 block">
                      Country
                    </Label>
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Enter country"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-6 border-t border-white/10">
            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
