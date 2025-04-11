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
  completedAt?: Date;
}

export default function CompletedDeliveriesPage() {
  const { toast } = useToast();
  const [completedRequests, setCompletedRequests] = useState<FuelRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFuelType, setFilterFuelType] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchCompletedRequests();
  }, []);

  const fetchCompletedRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/petrol-pump/requests?status=Delivered', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch completed requests');
      const data = await response.json();
      setCompletedRequests(data);
    } catch (error) {
      console.error('Error fetching completed requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch completed deliveries",
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
      const matchesFuelType = filterFuelType === "all" || request.fuelType === filterFuelType;
      return matchesSearch && matchesFuelType;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
                <p className="text-xs text-muted-foreground">
                  Delivered on {new Date(request.completedAt || request.createdAt).toLocaleDateString()}
                </p>
              </div>
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
      doc.text("Completed Deliveries Report", 14, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add summary
      doc.setFontSize(12);
      doc.text(`Total Deliveries: ${filteredRequests.length}`, 14, 40);
      
      // Create table data
      const tableData = filteredRequests.map(request => [
        request.userId.name,
        request.fuelType,
        `${request.amount} L`,
        `₹${request.totalPrice}`,
        request.location.address,
        new Date(request.completedAt || request.createdAt).toLocaleDateString()
      ]);
      
      // Add table
      autoTable(doc, {
        startY: 50,
        head: [['Customer', 'Fuel Type', 'Amount', 'Price', 'Location', 'Date']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 20 },
          2: { cellWidth: 15 },
          3: { cellWidth: 20 },
          4: { cellWidth: 50 },
          5: { cellWidth: 25 }
        }
      });
      
      // Save the PDF
      doc.save(`completed-deliveries-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export Successful",
        description: "Your completed deliveries report has been downloaded.",
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
        <h1 className="text-2xl font-bold">Completed Deliveries</h1>
        <p className="text-muted-foreground">View your delivery history</p>
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
        <Select value={filterFuelType} onValueChange={setFilterFuelType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by fuel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fuel Types</SelectItem>
            <SelectItem value="Regular">Regular</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
            <SelectItem value="Diesel">Diesel</SelectItem>
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
          <DeliveryCard key={request._id} request={request} />
        ))}
      </div>
    </div>
  );
} 