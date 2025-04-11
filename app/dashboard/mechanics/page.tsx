"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCcw, Search, MapPin, Phone, Star, Wrench, Clock, CheckCircle, Filter, Download } from "lucide-react";
import { saveAs } from 'file-saver';

interface ServiceRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    mobileNumber: string;
  };
  vehicleId: {
    make: string;
    model: string;
    year: string;
    licensePlate: string;
  };
  serviceType: string;
  description: string;
  location: {
    type: string;
    coordinates: number[];
    address: string;
  };
  status: "Pending" | "Accepted" | "Rejected" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

interface Mechanic {
  _id: string;
  name: string;
  contactNumber: string;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  specialization: string;
  isActive: boolean;
  rating: number;
  totalRequests: number;
  activeRequests: number;
  completedServices: number;
}

export default function MechanicDashboard() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("pending");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/mechanic/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      // Set the requests data
      setRequests(data || []);
      
      // Calculate stats from the requests data if mechanic data isn't provided
      const totalRequests = data.length;
      const activeRequests = data.filter(r => 
        ["Pending", "Accepted", "OnTheWay", "InProgress"].includes(r.status)
      ).length;
      const completedServices = data.filter(r => r.status === "Completed").length;
      
      // If mechanic data is provided, use it; otherwise use calculated stats
      if (data.mechanic) {
        setMechanic(data.mechanic);
      } else {
        setMechanic(prev => ({
          ...prev,
          totalRequests,
          activeRequests,
          completedServices
        }));
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to load requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Updating request status:', { requestId, newStatus });

      const response = await fetch(`http://localhost:5000/api/mechanic/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update request status');
      }

      await fetchRequests();
      setShowRequestDetails(false);
      toast({
        title: "Success",
        description: `Request status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update request status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCompletedServices = () => {
    try {
      // Filter for completed services
      const completedServices = requests.filter(r => r.status === "Completed");
      
      if (completedServices.length === 0) {
        toast({
          title: "No Data",
          description: "There are no completed services to export.",
          variant: "destructive",
        });
        return;
      }
      
      // Format the data for CSV
      const headers = [
        "Customer Name", 
        "Contact", 
        "Vehicle", 
        "Service Type", 
        "Location", 
        "Requested Date", 
        "Completed Date"
      ].join(",");
      
      const csvRows = completedServices.map(service => {
        const row = [
          service.userId?.name || 'Unknown',
          service.userId?.mobileNumber || 'No contact',
          `${service.vehicleId?.make || ''} ${service.vehicleId?.model || ''} (${service.vehicleId?.licensePlate || ''})`,
          service.serviceType || 'General Service',
          service.location?.address || 'No location data',
          new Date(service.createdAt).toLocaleString(),
          new Date(service.updatedAt).toLocaleString()
        ];
        
        // Escape any commas in the data
        return row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      });
      
      // Combine headers and rows
      const csvContent = [headers, ...csvRows].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const fileName = `mechanic-completed-services-${new Date().toISOString().slice(0,10)}.csv`;
      saveAs(blob, fileName);
      
      toast({
        title: "Export Successful",
        description: `${completedServices.length} completed services exported to CSV.`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      (request.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.vehicleId?.licensePlate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.serviceType || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      (activeTab === "pending" && request.status === "Pending") ||
      (activeTab === "active" && ["Accepted", "OnTheWay", "InProgress"].includes(request.status)) ||
      (activeTab === "completed" && request.status === "Completed") ||
      (statusFilter !== "all" && request.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary";
      case "accepted":
        return "default";
      case "completed":
        return "outline";
      case "rejected":
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading requests</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchRequests}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
            </div>
    );
  }

  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Service Requests</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCompletedServices}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Completed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={isLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col items-start space-y-0 pb-0">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            <div className="text-3xl font-bold mt-1">
              {mechanic?.totalRequests || requests.length || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">All time service requests</p>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="flex justify-end">
              <div className="bg-gray-100 p-2 rounded-full">
                <Wrench className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col items-start space-y-0 pb-0">
            <CardTitle className="text-sm font-medium text-gray-600">Active Requests</CardTitle>
            <div className="text-3xl font-bold mt-1">
              {mechanic?.activeRequests || 
                requests.filter(r => ["Pending", "Accepted", "OnTheWay", "InProgress"].includes(r.status)).length || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Currently active services</p>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="flex justify-end">
              <div className="bg-gray-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col items-start space-y-0 pb-0">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Services</CardTitle>
            <div className="text-3xl font-bold mt-1">
              {mechanic?.completedServices || 
                requests.filter(r => r.status === "Completed").length || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Successfully completed services</p>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="flex justify-end">
              <div className="bg-gray-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-between border-b pb-2 mb-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-2 font-medium rounded-md mr-2 ${
              activeTab === "active"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active Services
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-2 font-medium rounded-md ${
              activeTab === "completed"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed Services
          </button>
        </div>
      </div>

      {/* Section Title and Filters */}
      <div className="flex justify-between items-center mt-6 mb-4">
        <div>
          <h3 className="text-xl font-bold">
            {activeTab === "active" ? "Active Services" : "Completed Services"}
          </h3>
          <p className="text-sm text-gray-500">
            {activeTab === "active" 
              ? "Currently ongoing service requests" 
              : "Successfully completed service requests"}
          </p>
        </div>
        {activeTab === "completed" && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCompletedServices}
            className="mr-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
        <div className="flex items-center gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="ontheway">On The Way</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Service Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request._id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{request.userId?.name || ''}</h3>
                  <p className="text-sm text-muted-foreground">
                    Vehicle: {request.vehicleId?.make} {request.vehicleId?.model} ({request.vehicleId?.licensePlate || ''})
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(request.status.toLowerCase())}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </div>
              <div className="mt-2">
                <p className="text-sm">
                  <span className="font-medium">Service Type:</span> {request.serviceType || ''}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Location:</span> {request.location.address}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Requested:</span> {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowRequestDetails(true);
                  }}
                >
                  View Details
                </Button>
                {request.status === "Pending" && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleUpdateStatus(request._id, "Accepted")}
                      disabled={isLoading}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateStatus(request._id, "Rejected")}
                      disabled={isLoading}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {request.status === "Accepted" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUpdateStatus(request._id, "Completed")}
                    disabled={isLoading}
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <p>No service requests found</p>
              {searchQuery && (
                <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Request Details Dialog */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Customer Information</h4>
                <p className="text-sm">Name: {selectedRequest.userId?.name || ''}</p>
                <p className="text-sm">Contact: {selectedRequest.userId?.mobileNumber || ''}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Vehicle Information</h4>
                <p className="text-sm">Make: {selectedRequest.vehicleId?.make || ''}</p>
                <p className="text-sm">Model: {selectedRequest.vehicleId?.model || ''}</p>
                <p className="text-sm">Year: {selectedRequest.vehicleId?.year || ''}</p>
                <p className="text-sm">License Plate: {selectedRequest.vehicleId?.licensePlate || ''}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Service Details</h4>
                <p className="text-sm">Type: {selectedRequest.serviceType || ''}</p>
                <p className="text-sm">Description: {selectedRequest.description || ''}</p>
                <p className="text-sm">Status: {selectedRequest.status}</p>
                <p className="text-sm">Created: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Location</h4>
                <p className="text-sm">{selectedRequest.location.address}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
} 