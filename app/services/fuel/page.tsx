"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { ArrowLeft, MapPin, CreditCard, Info, Clock, Zap, Calendar, AlertCircle, History, RefreshCw, Phone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address: string;
}

interface PetrolPump {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
  distance: number;
  fuelTypes: Array<{
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

interface FuelRequest {
  _id: string;
  status: string;
  estimatedDeliveryTime?: Date;
  fuelType: string;
  amount: number;
  totalPrice: number;
  deliveryMode: string;
  createdAt?: Date;
  petrolPumpId?: string | PetrolPump;
  petrolPumpName?: string;
  petrolPump?: {
    name: string;
    address: string;
    operatingHours: {
      open: string;
      close: string;
      is24Hours: boolean;
    };
    phone?: string;
  };
}

export default function FuelDeliveryPage() {
  const { toast } = useToast();
  const [location, setLocation] = useState<Location | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [address, setAddress] = useState<string>("");
  const [nearbyPumps, setNearbyPumps] = useState<PetrolPump[]>([]);
  const [selectedPump, setSelectedPump] = useState<PetrolPump | null>(null);
  const [selectedFuelType, setSelectedFuelType] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<string>("Standard");
  const [activeRequest, setActiveRequest] = useState<FuelRequest | null>(null);
  const [requestHistory, setRequestHistory] = useState<FuelRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("request");
  const router = useRouter();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Fetch nearby petrol pumps when location is updated
  useEffect(() => {
    if (location) {
      fetchNearbyPumps(location.latitude, location.longitude);
    }
  }, [location]);

  // Fetch active request if any
  useEffect(() => {
    if (activeTab !== "history") {
      fetchActiveRequest();
    }
    fetchRequestHistory();
    
    const interval = setInterval(() => {
      if (activeTab !== "history") {
        fetchActiveRequest();
      }
      if (activeRequest?.status === 'Delivered' || 
          activeRequest?.status === 'Rejected' || 
          activeRequest?.status === 'Cancelled') {
        setActiveRequest(null);
        fetchRequestHistory();
      }
      fetchRequestHistory();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [activeTab, activeRequest?.status]);

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || "Address not found";
    } catch (error) {
      console.error('Error getting address:', error);
      return "Address not found";
    }
  };

  const updateLocationOnServer = async (newLocation: Location) => {
    try {
      const response = await fetch('http://localhost:5000/api/location/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLocation,
          service: 'fuel'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update location on server');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location on server",
        variant: "destructive",
      });
    }
  };

  const startLocationUpdates = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Get address from coordinates
          const addressResult = await getAddressFromCoordinates(latitude, longitude);
          
          const newLocation: Location = {
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp,
            address: addressResult
          };
          
          setLocation(newLocation);
          setAddress(addressResult);
          
          // Update location on server
          updateLocationOnServer(newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: getLocationErrorMessage(error),
            variant: "destructive",
          });
          setIsUpdating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      setWatchId(id);
      toast({
        title: "Location Updates Started",
        description: "Your location is being tracked for fuel delivery",
      });
    } catch (error) {
      console.error('Error starting location updates:', error);
      toast({
        title: "Error",
        description: "Failed to start location updates",
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  const stopLocationUpdates = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsUpdating(false);
      toast({
        title: "Location Updates Stopped",
        description: "Your location is no longer being tracked",
      });
    }
  };

  // Helper function to get location error messages
  const getLocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Please enable location services to use this feature";
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable";
      case error.TIMEOUT:
        return "Location request timed out";
      default:
        return "An unknown error occurred";
    }
  };

  const fetchNearbyPumps = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/petrol-pump/nearby?latitude=${latitude}&longitude=${longitude}`
      );
      if (!response.ok) throw new Error('Failed to fetch nearby pumps');
      const pumps = await response.json();
      setNearbyPumps(pumps);
    } catch (error) {
      console.error('Error fetching nearby pumps:', error);
      toast({
        title: "Error",
        description: "Failed to fetch nearby petrol pumps",
        variant: "destructive",
      });
    }
  };

  const fetchActiveRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        'http://localhost:5000/api/petrol-pump/fuel-requests?status=Pending,Accepted,OnTheWay',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch active request');
      
      const requests = await response.json();
      const activeReq = requests.find((req: { status: string }) => 
        req.status !== 'Delivered' && 
        req.status !== 'Rejected' && 
        req.status !== 'Cancelled'
      );
      
      if (activeReq) {
        // If petrolPumpId is an object with pump details, use it directly
        if (activeReq.petrolPumpId && typeof activeReq.petrolPumpId === 'object') {
          setActiveRequest({
            ...activeReq,
            petrolPump: {
              name: activeReq.petrolPumpId.name,
              address: activeReq.petrolPumpId.address,
              phone: activeReq.petrolPumpId.contactNumber,
              operatingHours: activeReq.petrolPumpId.operatingHours || { is24Hours: false, open: '', close: '' }
            }
          });
        } else {
          // If no pump details, just set the request as is
          setActiveRequest(activeReq);
        }
      } else {
        setActiveRequest(null);
      }
    } catch (error) {
      console.error('Error fetching active request:', error);
    }
  };

  const fetchRequestHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        'http://localhost:5000/api/petrol-pump/fuel-requests?status=Delivered,Rejected,Cancelled',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch request history');
      
      const requests = await response.json();
      setRequestHistory(requests);
    } catch (error) {
      console.error('Error fetching request history:', error);
    }
  };

  const handleSendRequest = async () => {
    if (!location || !selectedPump || !selectedFuelType || !selectedAmount) {
      toast({
        title: "Error",
        description: "Please select all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const fuelType = selectedPump.fuelTypes.find(f => f.type === selectedFuelType);
      if (!fuelType) throw new Error('Invalid fuel type');

      const response = await fetch('http://localhost:5000/api/petrol-pump/fuel-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petrolPumpId: selectedPump._id,
          location: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude],
            address: location.address,
          },
          fuelType: selectedFuelType,
          amount: selectedAmount,
          totalPrice: selectedAmount * fuelType.price,
          deliveryMode: selectedDeliveryMode,
        }),
      });

      if (!response.ok) throw new Error('Failed to create fuel request');

      const result = await response.json();
      setActiveRequest(result.request);
      
      // Switch to active tab after creating a request
      setActiveTab("active");
      
      toast({
        title: "Success",
        description: "Fuel delivery request sent successfully",
      });
    } catch (error) {
      console.error('Error sending fuel request:', error);
      toast({
        title: "Error",
        description: "Failed to send fuel request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeRequest) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/petrol-pump/fuel-request/${activeRequest._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to cancel request');

      // Immediately update the UI
      setActiveRequest(null);
      
      // Fetch updated history to show the cancelled request
      await fetchRequestHistory();
      
      // Switch back to request tab
      setActiveTab("request");
      
      toast({
        title: "Request Cancelled",
        description: "Your fuel delivery request has been cancelled",
      });

      // Reset selection states
      setSelectedPump(null);
      setSelectedFuelType("");
      setSelectedAmount(0);
      
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the StationCard component to handle selection
  const StationCard = ({ pump, selected, onSelect }: { 
    pump: PetrolPump; 
    selected: boolean;
    onSelect: () => void;
  }) => {
    return (
      <div 
        className={`p-3 rounded-lg border ${selected ? 'border-primary' : 'dark:border-gray-700/50'} cursor-pointer`}
        onClick={onSelect}
      >
        <div className="flex items-start">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{pump.name}</h4>
            <div className="flex items-center mb-1">
              <MapPin className="w-3 h-3 mr-1 text-muted-foreground dark:text-gray-400" />
              <span className="text-xs text-muted-foreground dark:text-gray-400">{pump.address}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1 text-muted-foreground dark:text-gray-400" />
              {pump.operatingHours.is24Hours ? (
                <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                  Open 24/7
                </span>
              ) : (
                <span className="text-xs text-muted-foreground dark:text-gray-400">
                  {pump.operatingHours.open} - {pump.operatingHours.close}
                </span>
              )}
            </div>
            <div className="mt-1">
              {pump.fuelTypes.map(fuel => (
                <span key={fuel.type} className="text-xs font-medium text-gray-900 dark:text-white mr-2">
                  {fuel.type}: ₹{fuel.price}/litre
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800/95 border-b dark:border-gray-700/50 shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">Fuel Delivery</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* Location Card */}
          <Card className="mb-6 overflow-hidden dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                <h2 className="text-lg font-semibold">Your Current Location</h2>
              </div>

              {location ? (
                <div className="space-y-2">
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {address || "Getting address..."}
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>GPS Coordinates: {location.latitude.toFixed(6)}° N, {location.longitude.toFixed(6)}° E</p>
                    <p>Accuracy: ±{Math.round(location.accuracy)} meters</p>
                    <p className="text-xs">Last Updated: {new Date(location.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Start location updates to see your current position
                </p>
              )}

              <div className="mt-4">
                {!isUpdating ? (
                  <Button 
                    onClick={startLocationUpdates}
                    className="w-full sm:w-auto"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Update Location
                  </Button>
                ) : (
                  <Button 
                    onClick={stopLocationUpdates}
                    variant="destructive"
                    className="w-full sm:w-auto"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Stop Updates
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Tabs for Request, Active Request, and History */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="request">New Request</TabsTrigger>
              <TabsTrigger value="active">Active Request</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            {/* New Request Tab */}
            <TabsContent value="request" className="mt-4">
              {!activeRequest && (
                <>
                  {/* Nearby Petrol Pumps */}
                  <Card className="mb-6">
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3">Select Petrol Pump</h3>
                      <div className="space-y-3">
                        {nearbyPumps.length > 0 ? (
                          nearbyPumps.map((pump) => (
                            <StationCard
                              key={pump._id}
                              pump={pump}
                              selected={selectedPump?._id === pump._id}
                              onSelect={() => setSelectedPump(pump)}
                            />
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <p>No petrol pumps found nearby.</p>
                            <p className="text-sm">Make sure your location is updated.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {selectedPump && (
                    <>
                      {/* Fuel Type Selection */}
                      <Card className="mb-6">
                        <CardContent className="p-4">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Select Fuel Type</h3>
                          <RadioGroup value={selectedFuelType} onValueChange={setSelectedFuelType}>
                            <div className="space-y-3">
                              {selectedPump.fuelTypes.filter(f => f.available).map((fuel) => (
                                <div key={fuel.type} className="flex items-center space-x-2 border rounded-lg p-3">
                                  <RadioGroupItem value={fuel.type} id={fuel.type} />
                                  <Label htmlFor={fuel.type} className="flex-1">
                                    <div className="font-medium">{fuel.type}</div>
                                    <div className="text-sm text-muted-foreground">₹{fuel.price}/litre</div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </CardContent>
                      </Card>

                      {/* Amount Selection */}
                      <Card className="mb-6">
                        <CardContent className="p-4">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Select Amount</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {[5, 10, 15, 20].map((amount) => {
                              const fuelPrice = selectedPump.fuelTypes.find(f => f.type === selectedFuelType)?.price || 0;
                              const totalPrice = amount * fuelPrice;
                              return (
                                <Button
                                  key={amount}
                                  variant={selectedAmount === amount ? "default" : "outline"}
                                  className="h-auto py-3"
                                  onClick={() => setSelectedAmount(amount)}
                                >
                                  <div className="flex flex-col items-center">
                                    <span className="text-lg font-bold">{amount} litres</span>
                                    <span className="text-sm text-muted-foreground">
                                      ₹{totalPrice.toFixed(2)}
                                    </span>
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Delivery Options */}
                      <Card className="mb-6">
                        <CardContent className="p-4">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Delivery Options</h3>
                          <RadioGroup value={selectedDeliveryMode} onValueChange={setSelectedDeliveryMode}>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2 border rounded-lg p-3">
                                <RadioGroupItem value="Standard" id="standard" />
                                <Label htmlFor="standard" className="flex-1">
                                  <div className="font-medium">Standard Delivery</div>
                                  <div className="text-sm text-muted-foreground">30-45 minutes • ₹50</div>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 border rounded-lg p-3">
                                <RadioGroupItem value="Express" id="express" />
                                <Label htmlFor="express" className="flex-1">
                                  <div className="font-medium">Express Delivery</div>
                                  <div className="text-sm text-muted-foreground">15-20 minutes • ₹100</div>
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </CardContent>
                      </Card>

                      {/* Send Request Button */}
                      <Button 
                        className="w-full mb-6" 
                        disabled={!selectedFuelType || !selectedAmount || isLoading} 
                        onClick={handleSendRequest}
                      >
                        {isLoading ? "Sending Request..." : "Send Fuel Request"}
                      </Button>
                    </>
                  )}
                </>
              )}
            </TabsContent>
            
            {/* Active Request Tab */}
            <TabsContent value="active" className="mt-4">
              {activeRequest ? (
                <Card className="mb-6 border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-lg">Active Fuel Request</h3>
                        <div className="flex items-center mt-1">
                          <Badge 
                            variant="outline" 
                            className={
                              activeRequest.status === 'Pending' 
                                ? "bg-yellow-100 text-yellow-800" 
                                : activeRequest.status === 'Accepted' 
                                  ? "bg-blue-100 text-blue-800" 
                                  : activeRequest.status === 'OnTheWay' 
                                    ? "bg-purple-100 text-purple-800" 
                                    : activeRequest.status === 'Rejected'
                                      ? "bg-red-100 text-red-800"
                                      : activeRequest.status === 'Cancelled'
                                        ? "bg-gray-100 text-gray-800"
                                        : "bg-green-100 text-green-800"
                            }
                          >
                            {activeRequest.status === 'Pending' 
                              ? "Pending" 
                              : activeRequest.status === 'Accepted' 
                                ? "Accepted" 
                                : activeRequest.status === 'OnTheWay' 
                                  ? "On The Way" 
                                  : activeRequest.status === 'Rejected'
                                    ? "Rejected"
                                    : activeRequest.status === 'Cancelled'
                                      ? "Cancelled"
                                      : "Delivered"}
                          </Badge>
                        </div>
                        {activeRequest.estimatedDeliveryTime && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Estimated Delivery: {new Date(activeRequest.estimatedDeliveryTime).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{activeRequest.fuelType}</p>
                        <p className="text-sm">{activeRequest.amount} litres</p>
                        <p className="text-sm">₹{activeRequest.totalPrice}</p>
                      </div>
                    </div>

                    {/* Petrol Pump Information */}
                    {activeRequest.petrolPumpId && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-base mb-2">Petrol Pump Information</h4>
                        <div className="space-y-2">
                          {activeRequest.petrolPump ? (
                            <>
                              <div className="flex items-start">
                                <MapPin className="w-4 h-4 mt-1 mr-2 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{activeRequest.petrolPump.name}</p>
                                  <p className="text-sm text-muted-foreground">{activeRequest.petrolPump.address}</p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                {activeRequest.petrolPump.operatingHours?.is24Hours ? (
                                  <span className="text-sm px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                    Open 24/7
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    {activeRequest.petrolPump.operatingHours?.open} - {activeRequest.petrolPump.operatingHours?.close}
                                  </span>
                                )}
                              </div>
                              {activeRequest.petrolPump.phone && (
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                  <span className="text-sm">{activeRequest.petrolPump.phone}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Loading petrol pump details...</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setActiveRequest(null);
                          // Refresh nearby pumps
                          if (location) {
                            fetchNearbyPumps(location.latitude, location.longitude);
                          }
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Show Other Petrol Pumps
                      </Button>
                      
                      {activeRequest.status === 'Pending' && (
                        <Button 
                          variant="destructive" 
                          onClick={handleCancelRequest}
                          disabled={isLoading}
                        >
                          Cancel Request
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active fuel requests</p>
                  <Button onClick={() => setActiveTab("request")}>
                    Make a New Request
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history" className="mt-4">
              {requestHistory.length > 0 ? (
                <div className="space-y-4">
                  {requestHistory.map((request) => (
                    <Card key={request._id} className="border-l-4 border-l-gray-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium">{request.fuelType}</h3>
                              <Badge 
                                variant="outline" 
                                className={`ml-2 ${
                                  request.status === 'Delivered' 
                                    ? "bg-green-100 text-green-800" 
                                    : request.status === 'Cancelled'
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {request.amount} litres • ₹{request.totalPrice}
                            </p>
                            {request.createdAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Requested: {new Date(request.createdAt).toLocaleString()}
                              </p>
                            )}
                            
                            {/* Petrol Pump Details */}
                            {(request.petrolPumpId || request.petrolPumpName) && (
                              <div className="mt-3 space-y-1">
                                <div className="flex items-start">
                                  <MapPin className="w-4 h-4 mt-0.5 mr-2 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {typeof request.petrolPumpId === 'object' && request.petrolPumpId !== null
                                        ? request.petrolPumpId.name 
                                        : request.petrolPumpName}
                                    </p>
                                    {typeof request.petrolPumpId === 'object' && request.petrolPumpId !== null && (
                                      <p className="text-xs text-muted-foreground">
                                        {request.petrolPumpId.address}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {typeof request.petrolPumpId === 'object' && request.petrolPumpId !== null && request.petrolPumpId.contactNumber && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {request.petrolPumpId.contactNumber}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPump(null);
                              setSelectedFuelType("");
                              setSelectedAmount(0);
                              setActiveTab("request");
                            }}
                          >
                            Order Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No request history</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

