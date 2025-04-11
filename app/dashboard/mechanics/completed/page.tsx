"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Search, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ServiceRequest {
  _id: string;
  userId: {
    _id?: string;
    name: string;
    mobileNumber: string;
  };
  vehicleId: {
    make: string;
    model: string;
    year: string;
    licensePlate: string;
  };
  location: {
    type?: string;
    coordinates: number[];
    address: string;
  };
  serviceType: string;
  description: string;
  status: string;
  estimatedPrice?: number;
  actualPrice?: number;
  estimatedArrivalTime?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CompletedServicesPage() {
  const { toast } = useToast();
  const [completedRequests, setCompletedRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterServiceType, setFilterServiceType] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchCompletedRequests();
  }, []);

  const fetchCompletedRequests = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/signin';
        return;
      }

      const response = await fetch('http://localhost:5000/api/mechanic/requests?status=Completed', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch completed requests');
      const data = await response.json();
      
      console.log('Completed requests data:', data);
      
      const completedData = Array.isArray(data) ? data : data.requests || [];
      setCompletedRequests(completedData);
    } catch (error) {
      console.error('Error fetching completed requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch completed requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = completedRequests
    .filter(request => {
      const matchesSearch = request.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.location.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesServiceType = filterServiceType === "all" || request.serviceType === filterServiceType;
      return matchesSearch && matchesServiceType;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const ServiceCard = ({ request }: { request: ServiceRequest }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-start">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Customer" />
                <AvatarFallback>{request.userId?.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{request.userId?.name || 'Unknown Customer'}</h3>
                <p className="text-sm text-muted-foreground">
                  {request.serviceType} • {request.vehicleId?.make} {request.vehicleId?.model} • {request.vehicleId?.licensePlate || 'No plate'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Service Location:</p>
                  <p className="text-sm">{request.location?.address || 'Unknown location'}</p>
                </div>
              </div>

              {request.actualPrice && (
                <div className="flex items-start">
                  <div className="text-sm">
                    <p className="font-medium">Price:</p>
                    <p>${request.actualPrice.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Completed on {new Date(request.updatedAt || request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Completed
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("Completed Services Report", 14, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add summary
      doc.setFontSize(12);
      doc.text(`Total Services: ${filteredRequests.length}`, 14, 40);
      
      // Create table data
      const tableData = filteredRequests.map(request => [
        request.userId?.name || 'Unknown',
        request.serviceType || 'General Service',
        `${request.vehicleId?.make || ''} ${request.vehicleId?.model || ''}`,
        request.vehicleId?.licensePlate || 'N/A',
        request.location?.address || 'N/A',
        request.actualPrice ? `$${request.actualPrice.toFixed(2)}` : 'N/A',
        new Date(request.updatedAt || request.createdAt).toLocaleDateString()
      ]);
      
      // Add table
      autoTable(doc, {
        startY: 50,
        head: [['Customer', 'Service Type', 'Vehicle', 'License Plate', 'Location', 'Price', 'Completion Date']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 40 },
          5: { cellWidth: 15 },
          6: { cellWidth: 25 }
        }
      });
      
      // Save the PDF
      doc.save(`completed-services-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export Successful",
        description: "Your completed services report has been downloaded.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate the PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Completed Services</h1>
        <p className="text-muted-foreground">View your service history</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or location..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Select value={filterServiceType} onValueChange={setFilterServiceType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Types</SelectItem>
            <SelectItem value="Tire Change">Tire Change</SelectItem>
            <SelectItem value="Jump Start">Jump Start</SelectItem>
            <SelectItem value="Engine Repair">Engine Repair</SelectItem>
            <SelectItem value="Oil Change">Oil Change</SelectItem>
            <SelectItem value="Battery Replacement">Battery Replacement</SelectItem>
            <SelectItem value="General Service">General Service</SelectItem>
            <SelectItem value="Emergency Repair">Emergency Repair</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={handleExportPDF}
          disabled={isExporting || filteredRequests.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </div>

      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <ServiceCard key={request._id} request={request} />
        ))}
      </div>
    </div>
  );
} 