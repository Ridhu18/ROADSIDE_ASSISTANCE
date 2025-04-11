"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Loader2 } from "lucide-react";

interface Mechanic {
  _id: string;
  name: string;
  contactNumber: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  specialization: string;
  isActive: boolean;
  services: Array<{
    type: string;
    price: number;
    available: boolean;
  }>;
  operatingHours: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
}

export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfilePhoto, setShowProfilePhoto] = useState(false);
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);
  const [showMechanicForm, setShowMechanicForm] = useState(false);
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMechanicInfo();
  }, []);

  const fetchMechanicInfo = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/signin';
        return;
      }

      const response = await fetch('http://localhost:5000/api/mechanic/info', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch mechanic info');
      const data = await response.json();
      setMechanic(data.mechanic);
    } catch (error) {
      console.error('Error fetching mechanic info:', error);
      toast({
        title: "Error",
        description: "Failed to fetch mechanic information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMechanic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData(e.currentTarget);
      
      // Get all form values
      const name = formData.get('name') as string;
      const contactNumber = formData.get('contactNumber') as string;
      const address = formData.get('address') as string;
      const longitude = parseFloat(formData.get('longitude') as string);
      const latitude = parseFloat(formData.get('latitude') as string);

      // Validate coordinates
      if (isNaN(longitude) || isNaN(latitude)) {
        toast({
          title: "Error",
          description: "Invalid coordinates. Please enter valid longitude and latitude values.",
          variant: "destructive",
        });
        return;
      }

      // Validate coordinate ranges
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        toast({
          title: "Error",
          description: "Coordinates out of range. Longitude must be between -180 and 180, latitude between -90 and 90.",
          variant: "destructive",
        });
        return;
      }

      // Get all form values
      const isActive = formData.get('isActive') === 'true';
      const is24Hours = formData.get('is24Hours') === 'true';
      const openTime = formData.get('openTime') as string || "09:00";
      const closeTime = formData.get('closeTime') as string || "17:00";

      // Validate required fields
      if (!name || !contactNumber || !address) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const data = {
        name,
        contactNumber,
        address,
        location: {
          type: "Point",
          coordinates: [longitude, latitude] // MongoDB expects [longitude, latitude]
        },
        specialization: "General",
        isActive,
        operatingHours: {
          is24Hours,
          open: is24Hours ? "00:00" : openTime,
          close: is24Hours ? "23:59" : closeTime
        },
        services: [
          {
            type: 'Basic Service',
            price: parseFloat(formData.get('basicServicePrice') as string) || 0,
            available: formData.get('basicServiceAvailable') === 'true'
          },
          {
            type: 'Full Service',
            price: parseFloat(formData.get('fullServicePrice') as string) || 0,
            available: formData.get('fullServiceAvailable') === 'true'
          },
          {
            type: 'Emergency Service',
            price: parseFloat(formData.get('emergencyServicePrice') as string) || 0,
            available: formData.get('emergencyServiceAvailable') === 'true'
          }
        ]
      };

      // Log the data being sent
      console.log('Location data being sent:', {
        longitude,
        latitude,
        locationObject: data.location
      });

      const response = await fetch('http://localhost:5000/api/mechanic/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'Failed to update mechanic info');
      }

      const responseData = await response.json();
      console.log('API Success Response:', responseData);

      // Verify the saved location
      if (!responseData.mechanic?.location?.coordinates || 
          responseData.mechanic.location.coordinates.length !== 2) {
        console.error('Warning: Location data may not have been saved correctly:', responseData.mechanic?.location);
      }
      
      await fetchMechanicInfo();
      setIsSettingsOpen(false);
      toast({
        title: "Success",
        description: "Mechanic information updated successfully",
      });
    } catch (error) {
      console.error('Error updating mechanic info:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update mechanic info",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProfilePhoto = async (formData: FormData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/mechanic/profile-photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update profile photo');

      await fetchMechanicInfo();
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

      const response = await fetch('http://localhost:5000/api/mechanic/header-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update header image');

      await fetchMechanicInfo();
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

  const handleToggleActive = async (newStatus: boolean) => {
    try {
      setIsUpdatingStatus(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/mechanic/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      await fetchMechanicInfo();
      toast({
        title: "Success",
        description: `Status updated to ${newStatus ? 'Active' : 'Inactive'}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        mechanicName={mechanic?.name}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onProfilePhotoClick={() => setShowProfilePhoto(true)}
        onHeaderSettingsClick={() => setShowHeaderSettings(true)}
        isActive={mechanic?.isActive}
        onToggleActive={handleToggleActive}
        isUpdatingStatus={isUpdatingStatus}
      />
      <div className="flex-1 overflow-auto">
        <main className="p-4">{children}</main>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mechanic Settings</DialogTitle>
            <DialogDescription>
              Update your personal and service information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateMechanic} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={mechanic?.name || ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Mobile Number</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  defaultValue={mechanic?.contactNumber || ''}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={mechanic?.address || ''}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  defaultValue={mechanic?.location?.coordinates[0] || 0}
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
                  defaultValue={mechanic?.location?.coordinates[1] || 0}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-2"
                onClick={async () => {
                  try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                      navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    
                    const longitudeInput = document.getElementById('longitude') as HTMLInputElement;
                    const latitudeInput = document.getElementById('latitude') as HTMLInputElement;
                    
                    if (longitudeInput && latitudeInput) {
                      longitudeInput.value = position.coords.longitude.toString();
                      latitudeInput.value = position.coords.latitude.toString();
                    }

                    toast({
                      title: "Success",
                      description: "Location detected successfully",
                    });
                  } catch (error) {
                    console.error('Error getting location:', error);
                    toast({
                      title: "Error",
                      description: "Could not get your location. Please enter coordinates manually.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Detect Location
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                name="isActive"
                defaultChecked={mechanic?.isActive}
              />
              <Label htmlFor="isActive">Available for Services</Label>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Operating Hours</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is24Hours"
                  name="is24Hours"
                  defaultChecked={mechanic?.operatingHours?.is24Hours}
                />
                <Label htmlFor="is24Hours">24 Hours Operation</Label>
              </div>

              {!mechanic?.operatingHours?.is24Hours && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openTime">Opening Time</Label>
                    <Input
                      id="openTime"
                      name="openTime"
                      type="time"
                      defaultValue={mechanic?.operatingHours?.open}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeTime">Closing Time</Label>
                    <Input
                      id="closeTime"
                      name="closeTime"
                      type="time"
                      defaultValue={mechanic?.operatingHours?.close}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Service Types and Pricing</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basicServicePrice">Basic Service Price (₹)</Label>
                  <Input
                    id="basicServicePrice"
                    name="basicServicePrice"
                    type="number"
                    step="0.01"
                    defaultValue={mechanic?.services?.find(s => s.type === 'Basic Service')?.price || 0}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="basicServiceAvailable"
                    name="basicServiceAvailable"
                    defaultChecked={mechanic?.services?.find(s => s.type === 'Basic Service')?.available}
                  />
                  <Label htmlFor="basicServiceAvailable">Available</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullServicePrice">Full Service Price (₹)</Label>
                  <Input
                    id="fullServicePrice"
                    name="fullServicePrice"
                    type="number"
                    step="0.01"
                    defaultValue={mechanic?.services?.find(s => s.type === 'Full Service')?.price || 0}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fullServiceAvailable"
                    name="fullServiceAvailable"
                    defaultChecked={mechanic?.services?.find(s => s.type === 'Full Service')?.available}
                  />
                  <Label htmlFor="fullServiceAvailable">Available</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyServicePrice">Emergency Service Price (₹)</Label>
                  <Input
                    id="emergencyServicePrice"
                    name="emergencyServicePrice"
                    type="number"
                    step="0.01"
                    defaultValue={mechanic?.services?.find(s => s.type === 'Emergency Service')?.price || 0}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emergencyServiceAvailable"
                    name="emergencyServiceAvailable"
                    defaultChecked={mechanic?.services?.find(s => s.type === 'Emergency Service')?.available}
                  />
                  <Label htmlFor="emergencyServiceAvailable">Available</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
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