"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  Fuel,
  Truck,
  BarChart,
  Settings,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Droplet,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PetrolPump {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
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
  _id: string
  userId: {
    name: string
    mobileNumber: string
  }
  location: {
    coordinates: [number, number]
    address: string
  }
  fuelType: string
  amount: number
  totalPrice: number
  status: string
  estimatedDeliveryTime?: Date
  createdAt: Date
}

export default function PetrolPumpDashboard() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPetrolPumpForm, setShowPetrolPumpForm] = useState(false);
  const [petrolPump, setPetrolPump] = useState<PetrolPump | null>(null);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  useEffect(() => {
    fetchPetrolPumpInfo();
    fetchRequests();
    const interval = setInterval(() => {
      fetchPetrolPumpInfo();
      fetchRequests();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPetrolPumpInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found. Please login again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('http://localhost:5000/api/petrol-pump/info', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No petrol pump info exists yet, this is normal for new users
          setPetrolPump(null);
          return;
        }
        throw new Error('Failed to fetch petrol pump info');
      }

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
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/petrol-pump/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.get('name'),
          address: formData.get('address'),
          contactNumber: formData.get('contactNumber'),
          operatingHours: {
            open: formData.get('openTime'),
            close: formData.get('closeTime'),
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
        }),
      });

      if (!response.ok) throw new Error('Failed to update petrol pump info');

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
        description: "Failed to update petrol pump information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(true);
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

      // Immediately update the local state to reflect the change
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { 
                ...request, 
                status, 
                estimatedDeliveryTime: estimatedTime 
              } 
            : request
        )
      );

      toast({
        title: "Success",
        description: `Request status updated to ${status}`,
      });

      // Refresh the requests from the server
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    // Filter by status
    if (filterStatus !== "all" && request.status !== filterStatus) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const userName = request.userId.name.toLowerCase();
      const address = request.location.address.toLowerCase();
      const fuelType = request.fuelType.toLowerCase();
      
      return userName.includes(query) || 
             address.includes(query) || 
             fuelType.includes(query);
    }
    
    return true;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "highest") {
      return b.totalPrice - a.totalPrice;
    } else if (sortBy === "lowest") {
      return a.totalPrice - b.totalPrice;
    }
    return 0;
  });

  const toggleExpandRequest = (requestId: string) => {
    if (expandedRequest === requestId) {
      setExpandedRequest(null);
    } else {
      setExpandedRequest(requestId);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return "bg-yellow-100 text-yellow-800";
      case 'Accepted':
        return "bg-blue-100 text-blue-800";
      case 'OnTheWay':
        return "bg-purple-100 text-purple-800";
      case 'Delivered':
        return "bg-green-100 text-green-800";
      case 'Rejected':
      case 'Cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="bg-white border-b h-16 flex items-center justify-between px-6">
        <div className="flex items-center">
          {petrolPump ? (
            <div className="flex items-center">
              <h2 className="font-semibold">{petrolPump.name}</h2>
              <Badge 
                variant={petrolPump.isActive ? "default" : "secondary"} 
                className={`ml-2 text-sm px-3 py-1 ${petrolPump.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {petrolPump.isActive ? "Active for Deliveries" : "Inactive - Not Accepting Deliveries"}
              </Badge>
            </div>
          ) : (
            <Button onClick={() => setShowPetrolPumpForm(true)}>
              Add Petrol Pump Info
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={fetchRequests}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {!petrolPump ? (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center py-8">
                <Droplet className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Welcome to Fuel Delivery Portal</h2>
                <p className="text-muted-foreground mb-4 max-w-md">
                  You need to set up your petrol pump information before you can start accepting fuel delivery requests.
                </p>
                <Button onClick={() => setShowPetrolPumpForm(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Set Up Petrol Pump
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Status Card */}
            <Card className={`mb-6 border-l-4 ${petrolPump.isActive ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-3 ${petrolPump.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <h3 className="font-medium">Active Status</h3>
                      <p className="text-sm text-muted-foreground">
                        Your petrol pump is currently {petrolPump.isActive ? 'active and accepting' : 'inactive and not accepting'} fuel delivery requests.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPetrolPumpForm(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Change Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatsCard
                title="Total Requests"
                value={requests.length.toString()}
                icon={<Droplet className="h-4 w-4" />}
                description="All time fuel requests"
              />
              <StatsCard
                title="Active Requests"
                value={requests.filter(r => r.status === "Accepted" || r.status === "OnTheWay").length.toString()}
                icon={<Truck className="h-4 w-4" />}
                description="Currently active deliveries"
              />
              <StatsCard
                title="Completed Deliveries"
                value={requests.filter(r => r.status === "Delivered").length.toString()}
                icon={<CheckCircle className="h-4 w-4" />}
                description="Successfully completed deliveries"
              />
            </div>

            {/* Tabs for Active and Completed Deliveries */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="active">Active Deliveries</TabsTrigger>
                <TabsTrigger value="completed">Completed Deliveries</TabsTrigger>
              </TabsList>
              
              {/* Active Deliveries Tab */}
              <TabsContent value="active" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle>Active Deliveries</CardTitle>
                        <CardDescription>Currently ongoing fuel deliveries</CardDescription>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <div className="relative mr-2">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search requests..."
                            className="pl-8 h-9 w-[200px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-[150px] h-9">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                            <SelectItem value="OnTheWay">On The Way</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-[150px] h-9 ml-2">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="highest">Highest Price</SelectItem>
                            <SelectItem value="lowest">Lowest Price</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sortedRequests
                        .filter(request => ['Pending', 'Accepted', 'OnTheWay'].includes(request.status))
                        .map(request => (
                          <div key={request._id} className="border rounded-lg overflow-hidden">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                              onClick={() => toggleExpandRequest(request._id)}
                            >
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
                                </div>
                                <div className="flex items-center mt-2 md:mt-0">
                                  <Badge variant="outline" className={getStatusBadgeClass(request.status)}>
                                    {request.status === 'OnTheWay' ? 'En Route' : request.status}
                                  </Badge>
                                  {expandedRequest === request._id ? (
                                    <ChevronUp className="h-5 w-5 ml-2 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 ml-2 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {expandedRequest === request._id && (
                              <div className="border-t p-4 bg-gray-50 dark:bg-gray-800/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Customer Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="font-medium">Name:</span> {request.userId.name}</p>
                                      <p><span className="font-medium">Phone:</span> {request.userId.mobileNumber}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Delivery Location</h4>
                                    <div className="space-y-1 text-sm">
                                      <p className="flex items-start">
                                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <span>{request.location.address}</span>
                                      </p>
                                      {request.estimatedDeliveryTime && (
                                        <p className="flex items-center text-xs text-muted-foreground mt-1">
                                          <Clock className="w-3 h-3 mr-1" />
                                          ETA: {new Date(request.estimatedDeliveryTime).toLocaleTimeString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <Button size="sm" variant="outline" className="flex items-center">
                                    <Phone className="h-4 w-4 mr-1" />
                                    Call
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Message
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Directions
                                  </Button>
                                  
                                  {request.status === 'Pending' && (
                                    <div className="ml-auto flex gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => handleUpdateStatus(request._id, 'Rejected')}
                                        disabled={isLoading}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Decline
                                      </Button>
                                      <Button 
                                        size="sm"
                                        onClick={() => handleUpdateStatus(
                                          request._id,
                                          'Accepted',
                                          new Date(Date.now() + 30 * 60000)
                                        )}
                                        disabled={isLoading}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Accept
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {request.status === 'Accepted' && (
                                    <Button 
                                      size="sm" 
                                      className="ml-auto"
                                      onClick={() => handleUpdateStatus(request._id, 'OnTheWay')}
                                      disabled={isLoading}
                                    >
                                      Start Delivery
                                    </Button>
                                  )}
                                  
                                  {request.status === 'OnTheWay' && (
                                    <Button 
                                      size="sm" 
                                      className="ml-auto"
                                      onClick={() => handleUpdateStatus(request._id, 'Delivered')}
                                      disabled={isLoading}
                                    >
                                      Mark as Delivered
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      
                      {sortedRequests.filter(request => ['Pending', 'Accepted', 'OnTheWay'].includes(request.status)).length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No active deliveries</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Completed Deliveries Tab */}
              <TabsContent value="completed" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle>Completed Deliveries</CardTitle>
                        <CardDescription>Past fuel delivery requests</CardDescription>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <div className="relative mr-2">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search requests..."
                            className="pl-8 h-9 w-[200px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-[150px] h-9">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-[150px] h-9 ml-2">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="highest">Highest Price</SelectItem>
                            <SelectItem value="lowest">Lowest Price</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sortedRequests
                        .filter(request => ['Delivered', 'Rejected', 'Cancelled'].includes(request.status))
                        .map(request => (
                          <div key={request._id} className="border rounded-lg overflow-hidden">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                              onClick={() => toggleExpandRequest(request._id)}
                            >
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
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(request.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center mt-2 md:mt-0">
                                  <Badge variant="outline" className={getStatusBadgeClass(request.status)}>
                                    {request.status}
                                  </Badge>
                                  {expandedRequest === request._id ? (
                                    <ChevronUp className="h-5 w-5 ml-2 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 ml-2 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {expandedRequest === request._id && (
                              <div className="border-t p-4 bg-gray-50 dark:bg-gray-800/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Customer Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="font-medium">Name:</span> {request.userId.name}</p>
                                      <p><span className="font-medium">Phone:</span> {request.userId.mobileNumber}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Delivery Location</h4>
                                    <div className="space-y-1 text-sm">
                                      <p className="flex items-start">
                                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <span>{request.location.address}</span>
                                      </p>
                                      {request.estimatedDeliveryTime && (
                                        <p className="flex items-center text-xs text-muted-foreground mt-1">
                                          <Clock className="w-3 h-3 mr-1" />
                                          ETA: {new Date(request.estimatedDeliveryTime).toLocaleTimeString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <Button size="sm" variant="outline" className="flex items-center">
                                    <Phone className="h-4 w-4 mr-1" />
                                    Call
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Message
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Directions
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      
                      {sortedRequests.filter(request => ['Delivered', 'Rejected', 'Cancelled'].includes(request.status)).length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No completed deliveries</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Petrol Pump Form Dialog */}
      <Dialog open={showPetrolPumpForm} onOpenChange={setShowPetrolPumpForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{petrolPump ? 'Edit Petrol Pump Information' : 'Add Petrol Pump Information'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdatePetrolPump(new FormData(e.currentTarget));
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Petrol Pump Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={petrolPump?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    defaultValue={petrolPump?.contactNumber}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={petrolPump?.address}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is24Hours"
                  name="is24Hours"
                  defaultChecked={petrolPump?.operatingHours?.is24Hours}
                />
                <Label htmlFor="is24Hours">24 Hours Operation</Label>
              </div>

              {!petrolPump?.operatingHours?.is24Hours && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openTime">Opening Time</Label>
                    <Input
                      id="openTime"
                      name="openTime"
                      type="time"
                      defaultValue={petrolPump?.operatingHours?.open}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeTime">Closing Time</Label>
                    <Input
                      id="closeTime"
                      name="closeTime"
                      type="time"
                      defaultValue={petrolPump?.operatingHours?.close}
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
                      defaultValue={petrolPump?.fuelTypes?.find(f => f.type === 'Regular')?.price}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="regularAvailable"
                      name="regularAvailable"
                      defaultChecked={petrolPump?.fuelTypes?.find(f => f.type === 'Regular')?.available}
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
                      defaultValue={petrolPump?.fuelTypes?.find(f => f.type === 'Premium')?.price}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="premiumAvailable"
                      name="premiumAvailable"
                      defaultChecked={petrolPump?.fuelTypes?.find(f => f.type === 'Premium')?.available}
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
                      defaultValue={petrolPump?.fuelTypes?.find(f => f.type === 'Diesel')?.price}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dieselAvailable"
                      name="dieselAvailable"
                      defaultChecked={petrolPump?.fuelTypes?.find(f => f.type === 'Diesel')?.available}
                    />
                    <Label htmlFor="dieselAvailable">Available</Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={petrolPump?.isActive}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  description,
}: {
  title: string
  value: string
  icon: React.ReactNode
  description: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="p-2 rounded-full bg-primary/10">
            <div className="text-primary">{icon}</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

