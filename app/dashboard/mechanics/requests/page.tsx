"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, MapPin, Clock, Car, User, Wrench, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface Request {
  _id: string;
  user: {
    name: string;
    contactNumber: string;
    location: {
      coordinates: [number, number];
      address: string;
    };
  };
  vehicle: {
    make: string;
    model: string;
    year: string;
  };
  serviceType: string;
  description: string;
  status: string;
  estimatedPrice: number;
  location: {
    coordinates: [number, number];
    address: string;
  };
  createdAt: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "200px",
  borderRadius: "0.5rem"
};

export default function MechanicRequestsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/pending-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data = await response.json();
      setRequests(data.requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      let estimatedArrivalTime;
      if (status === "Accepted" || status === "OnTheWay") {
        // Calculate estimated arrival time (15 minutes from now)
        estimatedArrivalTime = new Date(Date.now() + 15 * 60000).toISOString();
      }

      const response = await fetch(`http://localhost:5000/api/mechanic/mechanic-request/${requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          estimatedArrivalTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update request status");
      }

      // Update the local state
      setRequests(requests.map(request =>
        request._id === requestId
          ? { ...request, status }
          : request
      ));

      toast({
        title: "Success",
        description: `Request status updated to ${status}`,
      });
    } catch (error) {
      console.error("Error updating request status:", error);
      toast({
        title: "Error",
        description: "Failed to update request status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openGoogleMaps = (coordinates: [number, number], address: string) => {
    const [lng, lat] = coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">No Pending Requests</h1>
        <p className="text-gray-600">You don't have any pending service requests.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <h1 className="text-xl font-bold">Service Requests</h1>
        </div>
      </header>

      <main className="container p-4 space-y-6">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          {requests.map((request) => (
            <Card key={request._id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Request #{request._id.slice(-6)}</CardTitle>
                  <Select
                    value={request.status}
                    onValueChange={(value) => updateRequestStatus(request._id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Accepted">Accept</SelectItem>
                      <SelectItem value="OnTheWay">On The Way</SelectItem>
                      <SelectItem value="InProgress">In Progress</SelectItem>
                      <SelectItem value="Completed">Complete</SelectItem>
                      <SelectItem value="Cancelled">Cancel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Customer Details */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      <span>{request.user.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-2" />
                      <Button variant="link" className="p-0" onClick={() => window.location.href = `tel:${request.user.contactNumber}`}>
                        {request.user.contactNumber}
                      </Button>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      <span>{request.vehicle.make} {request.vehicle.model} ({request.vehicle.year})</span>
                    </div>
                    <div className="flex items-center">
                      <Wrench className="h-4 w-4" />
                      <span>{request.serviceType}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Issue: {request.description}
                    </div>
                  </div>

                  {/* Location Map */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{request.location.address}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openGoogleMaps(request.location.coordinates, request.location.address)}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate
                      </Button>
                    </div>
                    <div className="relative">
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{
                          lat: request.location.coordinates[1],
                          lng: request.location.coordinates[0]
                        }}
                        zoom={15}
                      >
                        <Marker
                          position={{
                            lat: request.location.coordinates[1],
                            lng: request.location.coordinates[0]
                          }}
                        />
                      </GoogleMap>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-lg font-semibold">
                    Estimated Price: ₹{request.estimatedPrice}
                  </div>

                  {/* Time */}
                  <div className="text-sm text-gray-600">
                    Requested at: {new Date(request.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </LoadScript>
      </main>
    </div>
  );
} 