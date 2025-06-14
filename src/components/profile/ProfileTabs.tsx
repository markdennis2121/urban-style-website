
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import PersonalInfoForm from './PersonalInfoForm';
import ShippingAddressForm from './ShippingAddressForm';

interface ProfileTabsProps {
  currentUser: any;
  username: string;
  fullName: string;
  avatarUrl: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  onUsernameChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onAvatarUpdate: (url: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ProfileTabs = ({
  currentUser,
  username,
  fullName,
  avatarUrl,
  phone,
  address,
  city,
  state,
  postalCode,
  country,
  onUsernameChange,
  onFullNameChange,
  onAvatarUpdate,
  onPhoneChange,
  onAddressChange,
  onCityChange,
  onStateChange,
  onPostalCodeChange,
  onCountryChange,
  onSuccess,
  onError
}: ProfileTabsProps) => {
  return (
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
          <AvatarUpload
            currentUser={currentUser}
            avatarUrl={avatarUrl}
            onAvatarUpdate={onAvatarUpdate}
            onSuccess={onSuccess}
            onError={onError}
          />

          <PersonalInfoForm
            currentUser={currentUser}
            username={username}
            fullName={fullName}
            phone={phone}
            onUsernameChange={onUsernameChange}
            onFullNameChange={onFullNameChange}
            onPhoneChange={onPhoneChange}
          />
        </div>
      </TabsContent>

      <TabsContent value="shipping" className="space-y-6">
        <ShippingAddressForm
          address={address}
          city={city}
          state={state}
          postalCode={postalCode}
          country={country}
          onAddressChange={onAddressChange}
          onCityChange={onCityChange}
          onStateChange={onStateChange}
          onPostalCodeChange={onPostalCodeChange}
          onCountryChange={onCountryChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
