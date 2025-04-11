"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";

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
}

interface FuelRequest {
  _id: string;
  userId: {
    name: string;
    mobileNumber: string;
  };
  location: {
    coordinates: [number, number];
    address: string;
  };
  fuelType: string;
  amount: number;
  totalPrice: number;
  deliveryMode: string;
  status: string;
  estimatedDeliveryTime?: Date;
  createdAt: Date;
}

export default function PetrolPumpDashboard() {
  const { toast } = useToast();
  const [petrolPump, setPetrolPump] = useState<PetrolPump | null>(null);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPetrolPumpInfo();
    fetchRequests();
    // Set up periodic refresh for requests
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
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

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/petrol-pump/requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: string, estimatedTime?: Date) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/petrol-pump/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          estimatedDeliveryTime: estimatedTime,
        }),
      });

      if (!response.ok) throw new Error('Failed to update request status');

      toast({
        title: "Success",
        description: "Request status updated successfully",
      });

      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePetrolPump = async (data: Partial<PetrolPump>) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/petrol-pump/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update petrol pump info');

      toast({
        title: "Success",
        description: "Petrol pump information updated successfully",
      });

      fetchPetrolPumpInfo();
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating petrol pump info:', error);
      toast({
        title: "Error",
        description: "Failed to update petrol pump information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ... existing sidebar ... */}

      <div className="flex-1">
        {/* ... existing header ... */}

        <main className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Fuel Delivery Dashboard</h1>
              <p className="text-muted-foreground">Manage fuel delivery requests and inventory</p>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              {petrolPump && (
                <>
                  <Badge variant="outline" className={petrolPump.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {petrolPump.isActive ? "Available" : "Offline"}
                  </Badge>
                  <Button variant="outline" className="ml-2" onClick={() => setShowSettings(true)}>
                    Settings
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Pending Requests */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pending Fuel Requests</CardTitle>
              <CardDescription>New fuel delivery requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests
                  .filter(request => request.status === 'Pending')
                  .map(request => (
                    <div key={request._id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{request.userId.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.fuelType} • {request.amount} gallons • ₹{request.totalPrice}
                          </p>
                          <div className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{request.location.address}</p>
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Requested {new Date(request.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(request._id, 'Rejected')}
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(
                              request._id, 
                              'Accepted',
                              new Date(Date.now() + 30 * 60000) // 30 minutes from now
                            )}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Deliveries */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Active Deliveries</CardTitle>
              <CardDescription>Currently ongoing fuel deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests
                  .filter(request => ['Accepted', 'OnTheWay'].includes(request.status))
                  .map(request => (
                    <div key={request._id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{request.userId.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.fuelType} • {request.amount} gallons • ₹{request.totalPrice}
                          </p>
                          <div className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{request.location.address}</p>
                          </div>
                          {request.estimatedDeliveryTime && (
                            <div className="flex items-center mt-1">
                              <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                ETA: {new Date(request.estimatedDeliveryTime).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {request.status === 'Accepted' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateStatus(request._id, 'OnTheWay')}
                            >
                              Start Delivery
                            </Button>
                          )}
                          {request.status === 'OnTheWay' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateStatus(request._id, 'Delivered')}
                            >
                              Mark as Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Petrol Pump Settings</DialogTitle>
          </DialogHeader>
          {petrolPump && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdatePetrolPump({
                name: formData.get('name') as string,
                address: formData.get('address') as string,
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
                    price: Number(formData.get('regularPrice')),
                    available: formData.get('regularAvailable') === 'true',
                  },
                  {
                    type: 'Premium',
                    price: Number(formData.get('premiumPrice')),
                    available: formData.get('premiumAvailable') === 'true',
                  },
                  {
                    type: 'Diesel',
                    price: Number(formData.get('dieselPrice')),
                    available: formData.get('dieselAvailable') === 'true',
                  },
                ],
              });
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={petrolPump.name}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={petrolPump.address}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactNumber" className="text-right">Contact</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    defaultValue={petrolPump.contactNumber}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">24/7</Label>
                  <Switch
                    name="is24Hours"
                    defaultChecked={petrolPump.operatingHours.is24Hours}
                  />
                </div>
                {!petrolPump.operatingHours.is24Hours && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="openTime" className="text-right">Opens At</Label>
                      <Input
                        id="openTime"
                        name="openTime"
                        type="time"
                        defaultValue={petrolPump.operatingHours.open}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="closeTime" className="text-right">Closes At</Label>
                      <Input
                        id="closeTime"
                        name="closeTime"
                        type="time"
                        defaultValue={petrolPump.operatingHours.close}
                        className="col-span-3"
                      />
                    </div>
                  </>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Status</Label>
                  <Switch
                    name="isActive"
                    defaultChecked={petrolPump.isActive}
                  />
                </div>
                {/* Fuel Types */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Fuel Types</h4>
                  {['Regular', 'Premium', 'Diesel'].map((type) => {
                    const fuel = petrolPump.fuelTypes.find(f => f.type === type);
                    return (
                      <div key={type} className="grid grid-cols-4 items-center gap-4 mb-2">
                        <Label className="text-right">{type}</Label>
                        <div className="col-span-3 flex items-center gap-2">
                          <Input
                            name={`${type.toLowerCase()}Price`}
                            type="number"
                            step="0.01"
                            defaultValue={fuel?.price || 0}
                            className="w-24"
                          />
                          <Switch
                            name={`${type.toLowerCase()}Available`}
                            defaultChecked={fuel?.available || false}
                          />
                          <span className="text-sm text-muted-foreground">Available</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 