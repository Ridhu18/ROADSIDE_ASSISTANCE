"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

interface PetrolPump {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
  operatingHours: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  fuelTypes: Array<{
    type: string;
    price: number;
    available: boolean;
  }>;
  isActive: boolean;
  profilePhoto?: string;
  headerImage?: string;
  location: {
    type: string;
    coordinates: number[];
  };
}

export default function PetrolPumpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfilePhoto, setShowProfilePhoto] = useState(false);
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);
  const [showPetrolPumpForm, setShowPetrolPumpForm] = useState(false);
  const [petrolPump, setPetrolPump] = useState<PetrolPump | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchPetrolPumpInfo();
  }, []);

  const fetchPetrolPumpInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/petrol-pump/info', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch petrol pump info');
      const data = await response.json();
      setPetrolPump(data.petrolPump);
    } catch (error) {
      console.error('Error fetching petrol pump info:', error);
      toast({
        title: "Error",
        description: "Failed to fetch petrol pump information",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePetrolPump = async (formData: FormData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Get the address and coordinates from the form
      const address = formData.get('address') as string;
      const longitude = parseFloat(formData.get('longitude') as string) || 0;
      const latitude = parseFloat(formData.get('latitude') as string) || 0;
      
      // Convert form data to the correct format
      const data = {
        name: formData.get('name') as string,
        address: address,
        contactNumber: formData.get('contactNumber') as string,
        operatingHours: {
          open: formData.get('openTime') as string,
          close: formData.get('closeTime') as string,
          is24Hours: formData.get('is24Hours') === 'true',
        },
        isActive: formData.get('isActive') === 'true',
        fuelTypes: [
          {
            type: 'Regular',
            price: parseFloat(formData.get('regularPrice') as string) || 0,
            available: formData.get('regularAvailable') === 'true',
          },
          {
            type: 'Premium',
            price: parseFloat(formData.get('premiumPrice') as string) || 0,
            available: formData.get('premiumAvailable') === 'true',
          },
          {
            type: 'Diesel',
            price: parseFloat(formData.get('dieselPrice') as string) || 0,
            available: formData.get('dieselAvailable') === 'true',
          },
        ],
        // Add the required location data with the user-provided coordinates
        location: {
          type: "Point",
          coordinates: [longitude, latitude]
        }
      };

      console.log('Sending data to API:', data);

      const response = await fetch('http://localhost:5000/api/petrol-pump/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('API Error Response:', responseData);
        throw new Error(responseData.message || 'Failed to update petrol pump info');
      }

      await fetchPetrolPumpInfo();
      setShowPetrolPumpForm(false);
      toast({
        title: "Success",
        description: "Petrol pump information updated successfully",
      });
    } catch (error) {
      console.error('Error updating petrol pump info:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update petrol pump information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfilePhoto = async (formData: FormData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/petrol-pump/profile-photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update profile photo');

      await fetchPetrolPumpInfo();
      setShowProfilePhoto(false);
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile photo:', error);
      toast({
        title: "Error",
        description: "Failed to update profile photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHeaderImage = async (formData: FormData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/petrol-pump/header-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update header image');

      await fetchPetrolPumpInfo();
      setShowHeaderSettings(false);
      toast({
        title: "Success",
        description: "Header image updated successfully",
      });
    } catch (error) {
      console.error('Error updating header image:', error);
      toast({
        title: "Error",
        description: "Failed to update header image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (isActive: boolean) => {
    try {
      setIsUpdatingStatus(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Create a copy of the current petrol pump data
      const updatedPetrolPump = petrolPump ? { ...petrolPump, isActive } : null;
      
      if (!updatedPetrolPump) {
        toast({
          title: "Error",
          description: "Petrol pump information not found. Please set up your petrol pump first.",
          variant: "destructive",
        });
        return;
      }

      // Send only the necessary data to update the status
      const response = await fetch('http://localhost:5000/api/petrol-pump/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update petrol pump status');
      }

      // Update the local state
      setPetrolPump(updatedPetrolPump);
      
      toast({
        title: "Success",
        description: `Petrol pump is now ${isActive ? 'active' : 'inactive'}`,
      });

      // Refresh the petrol pump info to ensure we have the latest data
      await fetchPetrolPumpInfo();
    } catch (error) {
      console.error('Error updating petrol pump status:', error);
      toast({
        title: "Error",
        description: "Failed to update petrol pump status",
        variant: "destructive",
      });
      // Revert the local state in case of error
      if (petrolPump) {
        setPetrolPump({ ...petrolPump, isActive: !isActive });
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        petrolPumpName={petrolPump?.name}
        onSettingsClick={() => setShowPetrolPumpForm(true)}
        onProfilePhotoClick={() => setShowProfilePhoto(true)}
        onHeaderSettingsClick={() => setShowHeaderSettings(true)}
        isActive={petrolPump?.isActive || false}
        onToggleActive={handleToggleActive}
        isUpdatingStatus={isUpdatingStatus}
      />

      <div className="flex-1">
        {children}
      </div>

      <Dialog open={showPetrolPumpForm} onOpenChange={setShowPetrolPumpForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{petrolPump ? 'Edit Petrol Pump Information' : 'Add Petrol Pump Information'}</DialogTitle>
          </DialogHeader>
          {petrolPump && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdatePetrolPump(formData);
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Petrol Pump Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={petrolPump.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      defaultValue={petrolPump.contactNumber}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={petrolPump.address}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.000001"
                      defaultValue={petrolPump.location.coordinates[0] || 0}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.000001"
                      defaultValue={petrolPump.location.coordinates[1] || 0}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is24Hours"
                    name="is24Hours"
                    defaultChecked={petrolPump.operatingHours.is24Hours}
                  />
                  <Label htmlFor="is24Hours">24 Hours Operation</Label>
                </div>

                {!petrolPump.operatingHours.is24Hours && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="openTime">Opening Time</Label>
                      <Input
                        id="openTime"
                        name="openTime"
                        type="time"
                        defaultValue={petrolPump.operatingHours.open}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="closeTime">Closing Time</Label>
                      <Input
                        id="closeTime"
                        name="closeTime"
                        type="time"
                        defaultValue={petrolPump.operatingHours.close}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-medium">Fuel Types</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regularPrice">Regular Price (₹)</Label>
                      <Input
                        id="regularPrice"
                        name="regularPrice"
                        type="number"
                        step="0.01"
                        defaultValue={petrolPump.fuelTypes.find(f => f.type === 'Regular')?.price}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="regularAvailable"
                        name="regularAvailable"
                        defaultChecked={petrolPump.fuelTypes.find(f => f.type === 'Regular')?.available}
                      />
                      <Label htmlFor="regularAvailable">Available</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="premiumPrice">Premium Price (₹)</Label>
                      <Input
                        id="premiumPrice"
                        name="premiumPrice"
                        type="number"
                        step="0.01"
                        defaultValue={petrolPump.fuelTypes.find(f => f.type === 'Premium')?.price}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="premiumAvailable"
                        name="premiumAvailable"
                        defaultChecked={petrolPump.fuelTypes.find(f => f.type === 'Premium')?.available}
                      />
                      <Label htmlFor="premiumAvailable">Available</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dieselPrice">Diesel Price (₹)</Label>
                      <Input
                        id="dieselPrice"
                        name="dieselPrice"
                        type="number"
                        step="0.01"
                        defaultValue={petrolPump.fuelTypes.find(f => f.type === 'Diesel')?.price}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="dieselAvailable"
                        name="dieselAvailable"
                        defaultChecked={petrolPump.fuelTypes.find(f => f.type === 'Diesel')?.available}
                      />
                      <Label htmlFor="dieselAvailable">Available</Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    name="isActive"
                    defaultChecked={petrolPump.isActive}
                  />
                  <Label htmlFor="isActive">Available for Deliveries</Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showProfilePhoto} onOpenChange={setShowProfilePhoto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateProfilePhoto(new FormData(e.currentTarget));
          }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="profilePhoto">Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="profilePhoto"
                    name="profilePhoto"
                    type="file"
                    accept="image/*"
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recommended size: 200x200 pixels. Maximum file size: 2MB.
                </p>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showHeaderSettings} onOpenChange={setShowHeaderSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Header Image</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateHeaderImage(new FormData(e.currentTarget));
          }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="headerImage">Header Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="headerImage"
                    name="headerImage"
                    type="file"
                    accept="image/*"
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recommended size: 1200x300 pixels. Maximum file size: 5MB.
                </p>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 