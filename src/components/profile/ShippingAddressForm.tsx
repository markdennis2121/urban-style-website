
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ShippingAddressFormProps {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onCountryChange: (value: string) => void;
}

const ShippingAddressForm = ({
  address,
  city,
  state,
  postalCode,
  country,
  onAddressChange,
  onCityChange,
  onStateChange,
  onPostalCodeChange,
  onCountryChange
}: ShippingAddressFormProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Label className="text-foreground text-sm font-medium mb-2 block">
          Street Address
        </Label>
        <Textarea
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
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
            onChange={(e) => onCityChange(e.target.value)}
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
              onChange={(e) => onStateChange(e.target.value)}
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
              onChange={(e) => onPostalCodeChange(e.target.value)}
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
            onChange={(e) => onCountryChange(e.target.value)}
            placeholder="Enter country"
            className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressForm;
