"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react";

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

export default function RequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

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
      toast({
        title: "Error",
        description: "Failed to fetch fuel requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const FuelRequestCard = ({ request }: { request: FuelRequest }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-start">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Customer" />
                <AvatarFallback>{request.userId.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{request.userId.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {request.fuelType} • {request.amount} L • ₹{request.totalPrice}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm">{request.location.address}</p>
                <p className="text-xs text-muted-foreground">
                  Requested {new Date(request.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0">
            {request.status === 'Pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center"
                  onClick={() => handleUpdateStatus(request._id, 'Rejected')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  className="flex items-center"
                  onClick={() => handleUpdateStatus(
                    request._id,
                    'Accepted',
                    new Date(Date.now() + 30 * 60000)
                  )}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
              </>
            )}
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
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Fuel Requests</h1>
        <p className="text-muted-foreground">Manage incoming fuel delivery requests</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {requests
            .filter(request => request.status === 'Pending')
            .map(request => (
              <FuelRequestCard key={request._id} request={request} />
            ))}
        </TabsContent>

        <TabsContent value="active">
          {requests
            .filter(request => ['Accepted', 'OnTheWay'].includes(request.status))
            .map(request => (
              <FuelRequestCard key={request._id} request={request} />
            ))}
        </TabsContent>

        <TabsContent value="completed">
          {requests
            .filter(request => request.status === 'Delivered')
            .map(request => (
              <FuelRequestCard key={request._id} request={request} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 