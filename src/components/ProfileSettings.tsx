
import React, { useState } from 'react';
import { supabase, getCurrentProfile } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { User, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProfileTabs from './profile/ProfileTabs';

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
  const { toast } = useToast();

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background p-2 sm:p-4 md:p-6">
      <Card className="max-w-5xl mx-auto bg-card/90 backdrop-blur-md border border-border/50 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center space-x-2 mb-6 sm:mb-8">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Profile Settings</h2>
          </div>

          {error && (
            <Alert className="mb-4 sm:mb-6 bg-destructive/10 border-destructive/20 text-destructive text-sm">
              {error}
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 sm:mb-6 bg-green-500/10 border-green-500/20 text-green-600 text-sm">
              {success}
            </Alert>
          )}

          <ProfileTabs
            currentUser={currentUser}
            username={username}
            fullName={fullName}
            avatarUrl={avatarUrl}
            phone={phone}
            address={address}
            city={city}
            state={state}
            postalCode={postalCode}
            country={country}
            onUsernameChange={setUsername}
            onFullNameChange={setFullName}
            onAvatarUpdate={setAvatarUrl}
            onPhoneChange={setPhone}
            onAddressChange={setAddress}
            onCityChange={setCity}
            onStateChange={setState}
            onPostalCodeChange={setPostalCode}
            onCountryChange={setCountry}
            onSuccess={setSuccess}
            onError={setError}
          />

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/20">
            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 sm:h-12 text-sm sm:text-base font-medium transition-all duration-300 hover:shadow-lg"
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
