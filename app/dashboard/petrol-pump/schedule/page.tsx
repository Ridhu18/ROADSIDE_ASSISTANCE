"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isSameDay } from "date-fns";

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

export default function SchedulePage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchScheduledRequests();
  }, [selectedDate]);

  const fetchScheduledRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/petrol-pump/requests?status=Accepted,OnTheWay', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch scheduled requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching scheduled requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch schedule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/petrol-pump/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update request status');

      toast({
        title: "Success",
        description: "Delivery status updated successfully",
      });

      fetchScheduledRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter(request => 
    request.estimatedDeliveryTime && 
    isSameDay(new Date(request.estimatedDeliveryTime), selectedDate)
  );

  const DeliveryCard = ({ request }: { request: FuelRequest }) => (
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
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {request.estimatedDeliveryTime && format(new Date(request.estimatedDeliveryTime), 'h:mm a')}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0 space-y-2">
            <Badge variant="outline" className={
              request.status === 'OnTheWay' 
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }>
              {request.status === 'OnTheWay' ? 'En Route' : 'Scheduled'}
            </Badge>
            {request.status === 'Accepted' && (
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => handleUpdateStatus(request._id, 'OnTheWay')}
              >
                Start Delivery
              </Button>
            )}
            {request.status === 'OnTheWay' && (
              <Button 
                size="sm" 
                className="w-full"
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
        <h1 className="text-2xl font-bold">Delivery Schedule</h1>
        <p className="text-muted-foreground">Manage your upcoming deliveries</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous Day
        </Button>
        <div className="flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary" />
          <h2 className="text-lg font-medium">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>
        <Button variant="outline" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          Next Day
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No deliveries scheduled for this day
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests
            .sort((a, b) => {
              const timeA = a.estimatedDeliveryTime ? new Date(a.estimatedDeliveryTime).getTime() : 0;
              const timeB = b.estimatedDeliveryTime ? new Date(b.estimatedDeliveryTime).getTime() : 0;
              return timeA - timeB;
            })
            .map(request => (
              <DeliveryCard key={request._id} request={request} />
            ))}
        </div>
      )}
    </div>
  );
} 