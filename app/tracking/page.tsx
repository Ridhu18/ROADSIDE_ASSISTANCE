"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MapPin, Clock, ArrowLeft, Car, User, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";

interface MechanicRequest {
  _id: string;
  mechanicId: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  status: "Pending" | "Accepted" | "OnTheWay" | "InProgress" | "Completed" | "Cancelled";
  estimatedPrice: number;
  estimatedArrivalTime?: string;
  mechanic: {
    name: string;
    contactNumber: string;
    location: {
      address: string;
    };
  };
  vehicle: {
    make: string;
    model: string;
    year: string;
  };
  location: {
    address: string;
  };
}

export default function TrackingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [request, setRequest] = useState<MechanicRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveRequest();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchActiveRequest, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/active-request', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch active request');
      const data = await response.json();
      setRequest(data.request);
    } catch (error) {
      console.error('Error fetching active request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">No Active Requests</h1>
        <p className="text-gray-600 mb-6">You don't have any active mechanic requests.</p>
        <Button onClick={() => router.push("/services/mechanic")}>
          Request a Mechanic
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Mechanic Request</h1>
        </div>
      </header>

      <main className="container p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <span className="font-medium">Status</span>
                <span className={`px-3 py-1 rounded-full ${
                  request.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  request.status === "Accepted" ? "bg-blue-100 text-blue-800" :
                  request.status === "OnTheWay" ? "bg-purple-100 text-purple-800" :
                  request.status === "InProgress" ? "bg-orange-100 text-orange-800" :
                  request.status === "Completed" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {request.status}
                </span>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-2">
                <h3 className="font-medium">Vehicle Information</h3>
                <div className="flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  <span>{request.vehicle.make} {request.vehicle.model} ({request.vehicle.year})</span>
                </div>
                <div className="flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  <span>{request.serviceType}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Issue: {request.description}
                </p>
              </div>

              {/* Mechanic Details - Only show if request is accepted */}
              {(request.status === "Accepted" || request.status === "OnTheWay" || request.status === "InProgress") && (
                <div className="space-y-2">
                  <h3 className="font-medium">Mechanic Information</h3>
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    <span>{request.mechanic.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    <Button variant="link" className="p-0" onClick={() => window.location.href = `tel:${request.mechanic.contactNumber}`}>
                      {request.mechanic.contactNumber}
                    </Button>
                  </div>
                  {request.estimatedArrivalTime && (
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>Estimated Arrival: {new Date(request.estimatedArrivalTime).toLocaleTimeString()}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-sm">{request.mechanic.location.address}</span>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="space-y-2">
                <h3 className="font-medium">Service Location</h3>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-2 mt-1" />
                  <span>{request.location.address}</span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <h3 className="font-medium">Estimated Price</h3>
                <p className="text-lg">₹{request.estimatedPrice}</p>
              </div>

              {/* Action Buttons */}
              {request.status === "Pending" && (
                <div className="flex justify-end">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleCancelRequest(request._id)}
                    disabled={isLoading}
                  >
                    Cancel Request
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

