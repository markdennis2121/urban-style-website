
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Lock } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import PersonalInfoForm from './PersonalInfoForm';
import ShippingAddressForm from './ShippingAddressForm';
import PasswordChangeForm from './PasswordChangeForm';

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
    <Tabs defaultValue="personal" className="space-y-4 sm:space-y-6">
      <TabsList className="bg-muted/60 backdrop-blur-md border border-border/50 w-full h-auto p-1 grid grid-cols-3 gap-1">
        <TabsTrigger 
          value="personal" 
          className="data-[state=active]:bg-background/90 data-[state=active]:shadow-sm text-foreground text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-md transition-all duration-300"
        >
          <User className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Personal Info</span>
          <span className="sm:hidden">Personal</span>
        </TabsTrigger>
        <TabsTrigger 
          value="shipping" 
          className="data-[state=active]:bg-background/90 data-[state=active]:shadow-sm text-foreground text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-md transition-all duration-300"
        >
          <MapPin className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Address</span>
          <span className="sm:hidden">Address</span>
        </TabsTrigger>
        <TabsTrigger 
          value="security" 
          className="data-[state=active]:bg-background/90 data-[state=active]:shadow-sm text-foreground text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-md transition-all duration-300"
        >
          <Lock className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Security</span>
          <span className="sm:hidden">Security</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-6 sm:space-y-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          <div className="order-1 lg:order-1">
            <AvatarUpload
              currentUser={currentUser}
              avatarUrl={avatarUrl}
              onAvatarUpdate={onAvatarUpdate}
              onSuccess={onSuccess}
              onError={onError}
            />
          </div>

          <div className="order-2 lg:order-2">
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
        </div>
      </TabsContent>

      <TabsContent value="shipping" className="space-y-6 mt-6">
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

      <TabsContent value="security" className="space-y-6 mt-6">
        <PasswordChangeForm />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
