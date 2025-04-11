"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, MapPin, Filter, Search, Clock, Wrench, Phone, Navigation, User, RefreshCcw, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import ClientMap from '../../components/shared/ClientMap';
import type { Mechanic } from '../../components/shared/Map';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
}

interface ServiceRequest {
  _id: string;
  mechanicId: {
    _id: string;
    name: string;
    contactNumber: string;
    specialization: string;
    rating: number;
  };
  vehicleId: {
    make: string;
    model: string;
    year: string;
    licensePlate: string;
  };
  serviceType: string;
  description: string;
  status: "Pending" | "Accepted" | "OnTheWay" | "InProgress" | "Completed" | "Cancelled" | "Rejected";
  createdAt: string;
  location: {
    coordinates: number[];
    address: string;
  };
  estimatedPrice: number;
  actualPrice?: number;
}

type RequestStatus = ServiceRequest['status'];

export default function MechanicPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [selectedMechanicOnMap, setSelectedMechanicOnMap] = useState<Mechanic | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: ""
  });
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState("mechanics");
  const [requestFilter, setRequestFilter] = useState("all");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isManualVehicleEntry, setIsManualVehicleEntry] = useState(false);
  const [manualVehicle, setManualVehicle] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    color: ""
  });

  useEffect(() => {
    getUserLocation();
    fetchUserRequests();
    fetchUserVehicles();
  }, []);

  // Add useEffect for periodic refresh of active requests
  useEffect(() => {
    // Initial fetch
    fetchUserRequests();

    // Set up polling interval for active requests
    const intervalId = setInterval(() => {
      // Only refresh if we're on the requests tab
      if (activeTab === "requests") {
        fetchUserRequests();
      }
    }, 5000); // Refresh every 5 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [activeTab]); // Only depend on activeTab, not on requests

  const getUserLocation = () => {
    setIsLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Validate coordinates
            if (isNaN(longitude) || isNaN(latitude) ||
                longitude < -180 || longitude > 180 ||
                latitude < -90 || latitude > 90) {
              throw new Error('Invalid coordinates received from geolocation');
            }

            console.log('Got coordinates:', { latitude, longitude });

            // Get address from coordinates using reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.display_name;
            
            setUserLocation({ latitude, longitude, address });
            
            // Fetch mechanics with the new coordinates
            await fetchMechanics(latitude, longitude);
            
            toast({
              title: "Location Found",
              description: "Successfully found your location and nearby mechanics.",
            });
          } catch (error) {
            console.error("Error getting address:", error);
            setUserLocation({ latitude, longitude, address: "Unknown location" });
            
            // Still try to fetch mechanics even if address lookup fails
            await fetchMechanics(latitude, longitude);
            
            toast({
              title: "Location Found",
              description: "Found your location but couldn't get the address.",
              variant: "default",
            });
          } finally {
            setIsLocationLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocationLoading(false);
          toast({
            title: "Location Error",
            description: "Could not get your location. Please enable location services.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setIsLocationLoading(false);
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const fetchMechanics = async (latitude?: number, longitude?: number) => {
    try {
      setIsLoading(true);
      let url = "http://localhost:5000/api/mechanic/nearby";
      
      if (latitude && longitude) {
        // Note: MongoDB expects coordinates as [longitude, latitude]
        url += `?longitude=${longitude}&latitude=${latitude}`;
      } else if (userLocation) {
        url += `?longitude=${userLocation.longitude}&latitude=${userLocation.latitude}`;
      }
      
      console.log('Fetching mechanics from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(errorData.error || "Failed to fetch mechanics");
      }
      
      const data = await response.json();
      console.log('Mechanics data:', data);
      setMechanics(data.mechanics || []);
    } catch (error) {
      console.error("Error fetching mechanics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch mechanics. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Use the correct endpoint for fetching user requests
      const response = await fetch("http://localhost:5000/api/mechanic/user-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch requests");
      }

      const data = await response.json();
      console.log("Fetched user requests:", data);
      
      // Check if there are any status changes
      const hasStatusChanges = data.requests?.some((newReq: ServiceRequest) => {
        const existingReq = requests.find(r => r._id === newReq._id);
        return existingReq && existingReq.status !== newReq.status;
      });

      // Update requests and show toast if there are changes
      if (hasStatusChanges) {
        toast({
          title: "Request Updated",
          description: "One or more of your requests have been updated.",
        });
      }
      
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      // Only show error toast for non-polling requests
      if (!activeTab) {
        toast({
          title: "Error",
          description: "Failed to fetch your service requests. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const fetchUserVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/vehicles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }

      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your vehicles",
        variant: "destructive",
      });
    }
  };

  // Add function to handle mechanic selection from map
  const handleMechanicSelect = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    setSelectedMechanicOnMap(mechanic);
    setIsRequestDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedMechanic || !serviceType || !description || !userLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate vehicle information
    if (!isManualVehicleEntry && !selectedVehicle) {
      toast({
        title: "Missing Vehicle",
        description: "Please select a vehicle or enter vehicle details manually.",
        variant: "destructive",
      });
      return;
    }

    if (isManualVehicleEntry && (!manualVehicle.make || !manualVehicle.model || !manualVehicle.year || !manualVehicle.licensePlate || !manualVehicle.color)) {
      toast({
        title: "Missing Vehicle Details",
        description: "Please fill in all vehicle details.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to request a mechanic.",
          variant: "destructive",
        });
        router.push("/auth/login");
        return;
      }

      let vehicleId;

      if (isManualVehicleEntry) {
        // Create a new vehicle first
        const vehicleResponse = await fetch("http://localhost:5000/api/vehicles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(manualVehicle),
        });

        if (!vehicleResponse.ok) {
          const errorData = await vehicleResponse.json();
          throw new Error(errorData.error || "Failed to create vehicle");
        }

        const vehicleData = await vehicleResponse.json();
        console.log("Vehicle creation response:", vehicleData);

        // Get the newly created vehicle ID
        // The response might be in vehicles array or directly in the vehicle object
        vehicleId = vehicleData.vehicles ? 
          vehicleData.vehicles[vehicleData.vehicles.length - 1]._id : 
          vehicleData.vehicle?._id;

        if (!vehicleId) {
          throw new Error("Failed to get vehicle ID from response");
        }
      } else {
        vehicleId = selectedVehicle!._id;
      }

      // Create the request
      const requestData = {
        mechanicId: selectedMechanic._id,
        vehicleId,
        location: {
          type: "Point",
          coordinates: [userLocation.longitude, userLocation.latitude],
          address: userLocation.address
        },
        serviceType,
        description,
        estimatedPrice: selectedMechanic.services.find(s => s.type === serviceType)?.price || 0
      };

      console.log("Sending request data:", requestData);

      const response = await fetch("http://localhost:5000/api/mechanic/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create request");
      }

      const data = await response.json();
      setRequests(prev => [data.mechanicRequest, ...prev]);
      setIsRequestDialogOpen(false);
      setActiveTab("requests");
      setSelectedVehicle(null);
      setManualVehicle({ make: "", model: "", year: "", licensePlate: "", color: "" });
      setServiceType("");
      setDescription("");
      setIsManualVehicleEntry(false);
      
      toast({
        title: "Success",
        description: "Service request sent successfully!",
      });
    } catch (error) {
      console.error("Error creating mechanic request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      });
    }
  };

  const getFilteredRequests = () => {
    switch (requestFilter) {
      case "active":
        return requests.filter(r => ["Accepted", "OnTheWay", "InProgress"].includes(r.status));
      case "pending":
        return requests.filter(r => r.status === "Pending");
      case "history":
        return requests.filter(r => ["Completed", "Cancelled", "Rejected"].includes(r.status));
      default:
        return requests;
    }
  };

  const filteredMechanics = mechanics.filter((mechanic) =>
    mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mechanic.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateRequestStatus = async (requestId: string, newStatus: RequestStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Use the correct endpoint for updating request status
      const response = await fetch(`http://localhost:5000/api/mechanic/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update request status');
      }

      const updatedRequest = await response.json();
      console.log("Status update response:", updatedRequest);
      
      // Update the requests list with the new status
      setRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: newStatus } : req
      ));

      toast({
        title: "Request Cancelled",
        description: "Your service request has been cancelled successfully.",
      });

      // Refresh the requests list to ensure we have the latest data
      fetchUserRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  // Update the RequestCard component to show more status details
  const RequestCard = ({ request }: { request: ServiceRequest }) => (
    <Card key={request._id} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{request.mechanicId.name}</h3>
          <p className="text-sm text-muted-foreground">
            {request.serviceType} - {request.vehicleId.make} {request.vehicleId.model}
          </p>
        </div>
        <Badge variant={
          request.status === "Completed" ? "outline" :
          request.status === "Pending" ? "secondary" :
          request.status === "Accepted" ? "default" :
          request.status === "OnTheWay" ? "default" :
          request.status === "InProgress" ? "default" :
          "destructive"
        }>
          {request.status === "OnTheWay" ? "On The Way" : request.status}
        </Badge>
      </div>
      <div className="mt-2">
        <p className="text-sm">
          <MapPin className="inline-block h-4 w-4 mr-1" />
          {request.location.address}
        </p>
        <p className="text-sm">
          <Clock className="inline-block h-4 w-4 mr-1" />
          {new Date(request.createdAt).toLocaleString()}
        </p>
        {request.actualPrice && (
          <p className="text-sm font-medium mt-1">
            Final Price: ${request.actualPrice}
          </p>
        )}
      </div>
      {request.status === "Pending" && (
        <div className="mt-4 flex gap-2 justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (window.confirm("Are you sure you want to cancel this request?")) {
                handleUpdateRequestStatus(request._id, "Cancelled");
              }
            }}
          >
            Cancel Request
          </Button>
        </div>
      )}
      {request.status === "Accepted" && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <MessageSquare className="inline-block h-4 w-4 mr-1" />
            Mechanic has accepted your request and will be on their way soon.
          </p>
        </div>
      )}
      {request.status === "OnTheWay" && (
        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
          <p className="text-sm text-green-600 dark:text-green-400">
            <Navigation className="inline-block h-4 w-4 mr-1" />
            Mechanic is on the way to your location.
          </p>
        </div>
      )}
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800/95 border-b dark:border-gray-700/50 shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">Find a Mechanic</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* Simple Status Card */}
          {activeRequest && (
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border-l-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Request Status: {activeRequest.status}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeRequest.mechanic?.name ? `Assigned to: ${activeRequest.mechanic.name}` : 'Waiting for mechanic...'}
                  </p>
                </div>
                {activeRequest.status === "Pending" && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        if (!token) return;

                        const response = await fetch(`http://localhost:5000/api/update-status/${activeRequest._id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ status: "Cancelled" }),
                        });

                        if (!response.ok) throw new Error('Failed to cancel request');
                        
                        setActiveRequest(null);
                        toast({
                          title: "Request Cancelled",
                          description: "Your mechanic request has been cancelled.",
                        });
                      } catch (error) {
                        console.error('Error cancelling request:', error);
                        toast({
                          title: "Error",
                          description: "Failed to cancel request. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Location Button */}
          <div className="mb-6">
            <Button 
              onClick={getUserLocation} 
              className="w-full flex items-center justify-center gap-2"
              disabled={isLocationLoading}
            >
              <Navigation className="h-4 w-4" />
              {isLocationLoading ? "Finding your location..." : "Find Mechanics Near Me"}
            </Button>
            {userLocation && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="inline-block h-4 w-4 mr-1" />
                {userLocation.address}
              </p>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input 
                placeholder="Search mechanics..." 
                className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/50 focus:border-primary dark:focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700/50">
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Map Preview */}
          <Card className="overflow-hidden mb-6">
            <div className="relative aspect-[16/9] bg-gray-100">
              {userLocation && (
                <ClientMap
                  userLocation={userLocation}
                  mechanics={mechanics}
                  selectedMechanicOnMap={selectedMechanicOnMap}
                  onMechanicSelect={handleMechanicSelect}
                />
              )}
              {!userLocation && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Enable location to view map</p>
                </div>
              )}
            </div>
          </Card>

          {/* Mechanics List */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full dark:bg-gray-800/90 dark:border-gray-700/50">
              <TabsTrigger value="mechanics" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                Find Mechanics
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                My Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mechanics" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredMechanics.length > 0 ? (
                <div className="space-y-4">
                  {filteredMechanics.map((mechanic) => (
                    <MechanicCard
                      key={mechanic._id}
                      mechanic={mechanic}
                      onRequest={() => handleMechanicSelect(mechanic)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground dark:text-gray-400">No mechanics found nearby</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={getUserLocation}
                    disabled={isLocationLoading}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {isLocationLoading ? "Finding location..." : "Find Mechanics Near Me"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>Service Requests</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={requestFilter} onValueChange={setRequestFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter requests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={fetchUserRequests}>
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getFilteredRequests().map((request) => (
                      <RequestCard key={request._id} request={request} />
                    ))}
                    {getFilteredRequests().length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No requests found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Mechanic Service</DialogTitle>
            <DialogDescription>
              Fill in the details below to request service from {selectedMechanic?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Vehicle Details</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsManualVehicleEntry(!isManualVehicleEntry)}
                >
                  {isManualVehicleEntry ? "Select Existing Vehicle" : "Enter Manually"}
                </Button>
              </div>
              
              {isManualVehicleEntry ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Make</Label>
                      <Input
                        placeholder="e.g., Toyota"
                        value={manualVehicle.make}
                        onChange={(e) => setManualVehicle(prev => ({ ...prev, make: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Input
                        placeholder="e.g., Camry"
                        value={manualVehicle.model}
                        onChange={(e) => setManualVehicle(prev => ({ ...prev, model: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Year</Label>
                      <Input
                        placeholder="e.g., 2020"
                        value={manualVehicle.year}
                        onChange={(e) => setManualVehicle(prev => ({ ...prev, year: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input
                        placeholder="e.g., Black"
                        value={manualVehicle.color}
                        onChange={(e) => setManualVehicle(prev => ({ ...prev, color: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>License Plate</Label>
                    <Input
                      placeholder="e.g., ABC123"
                      value={manualVehicle.licensePlate}
                      onChange={(e) => setManualVehicle(prev => ({ ...prev, licensePlate: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Select value={selectedVehicle?._id} onValueChange={(value) => {
                    const vehicle = vehicles.find(v => v._id === value);
                    if (vehicle) setSelectedVehicle(vehicle);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle._id} value={vehicle._id}>
                          {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {vehicles.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      No vehicles found. You can add vehicle details manually.
                    </p>
                  )}
                </>
              )}
            </div>
            <div>
              <Label>Service Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMechanic?.services.map((service) => (
                    <SelectItem key={service.type} value={service.type}>
                      {service.type} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your vehicle issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsRequestDialogOpen(false);
              setIsManualVehicleEntry(false);
              setManualVehicle({ make: "", model: "", year: "", licensePlate: "", color: "" });
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} disabled={
              !serviceType || !description || (!selectedVehicle && !isManualVehicleEntry) ||
              (isManualVehicleEntry && (!manualVehicle.make || !manualVehicle.model || !manualVehicle.year || !manualVehicle.licensePlate || !manualVehicle.color))
            }>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MechanicCard({
  mechanic,
  onRequest,
}: {
  mechanic: Mechanic;
  onRequest: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {mechanic.profilePhoto ? (
                <img
                  src={mechanic.profilePhoto}
                  alt={mechanic.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {mechanic.name}
              </h3>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {mechanic.rating.toFixed(1)} ({mechanic.totalReviews} reviews)
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <Wrench className="inline-block w-4 h-4 mr-1" />
                {mechanic.specialization}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <Phone className="inline-block w-4 h-4 mr-1" />
                {mechanic.contactNumber}
              </p>
              {mechanic.distance !== undefined && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <MapPin className="inline-block w-4 h-4 mr-1" />
                  {mechanic.distance < 1
                    ? `${(mechanic.distance * 1000).toFixed(0)}m away`
                    : `${mechanic.distance.toFixed(1)}km away`}
                </p>
              )}
            </div>
          </div>
          <Badge variant={mechanic.isActive ? "default" : "secondary"}>
            {mechanic.isActive ? "Available" : "Unavailable"}
          </Badge>
        </div>
        <div className="mt-4">
          <Button
            className="w-full"
            onClick={onRequest}
            disabled={!mechanic.isActive}
          >
            Request Service
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

