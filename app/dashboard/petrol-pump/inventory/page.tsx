"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Fuel } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FuelType {
  type: string;
  price: number;
  available: boolean;
  stock?: number;
  lowStockThreshold?: number;
}

interface PetrolPump {
  _id: string;
  fuelTypes: FuelType[];
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [petrolPump, setPetrolPump] = useState<PetrolPump | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFuel, setEditingFuel] = useState<string | null>(null);
  const [localStocks, setLocalStocks] = useState<Record<string, number>>({});
  const [localPrices, setLocalPrices] = useState<Record<string, number>>({});
  const [localThresholds, setLocalThresholds] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchPetrolPumpInfo();
  }, []);

  useEffect(() => {
    // Initialize local states when petrol pump data is loaded
    if (petrolPump) {
      const stocks: Record<string, number> = {};
      const prices: Record<string, number> = {};
      const thresholds: Record<string, number> = {};
      
      petrolPump.fuelTypes.forEach(fuel => {
        // Use nullish coalescing to only default to 0 if stock is null/undefined
        stocks[fuel.type] = fuel.stock ?? 0;
        prices[fuel.type] = fuel.price;
        thresholds[fuel.type] = fuel.lowStockThreshold ?? 1000;
      });
      
      setLocalStocks(stocks);
      setLocalPrices(prices);
      setLocalThresholds(thresholds);
    }
  }, [petrolPump]);

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
        throw new Error('Failed to fetch petrol pump info');
      }

      const data = await response.json();
      setPetrolPump(data.petrolPump);
    } catch (error) {
      console.error('Error fetching petrol pump info:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFuel = async (type: string, updates: Partial<FuelType>) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found. Please login again.",
          variant: "destructive",
        });
        return;
      }

      // Find the current fuel type and merge with updates
      const currentFuel = petrolPump?.fuelTypes.find(f => f.type === type);
      if (!currentFuel) return;

      // Create updated fuel object with proper stock handling
      const updatedFuel = {
        ...currentFuel,
        stock: updates.stock ?? currentFuel.stock ?? 0,
        price: updates.price ?? currentFuel.price,
        lowStockThreshold: updates.lowStockThreshold ?? currentFuel.lowStockThreshold ?? 1000,
        available: updates.available ?? currentFuel.available
      };

      const updatedFuelTypes = petrolPump?.fuelTypes.map(fuel => 
        fuel.type === type ? updatedFuel : fuel
      );

      const response = await fetch('http://localhost:5000/api/petrol-pump/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...petrolPump,
          fuelTypes: updatedFuelTypes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update fuel information');
      }

      const data = await response.json();
      setPetrolPump(data.petrolPump);

      // Update local states with the new data
      const newFuel = data.petrolPump.fuelTypes.find(f => f.type === type);
      if (newFuel) {
        setLocalStocks(prev => ({
          ...prev,
          [type]: newFuel.stock ?? prev[type] ?? 0
        }));
        setLocalPrices(prev => ({
          ...prev,
          [type]: newFuel.price
        }));
        setLocalThresholds(prev => ({
          ...prev,
          [type]: newFuel.lowStockThreshold ?? 1000
        }));
      }

      toast({
        title: "Success",
        description: "Fuel information updated successfully",
      });
    } catch (error) {
      console.error('Error updating fuel info:', error);
      toast({
        title: "Error",
        description: "Failed to update fuel information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStockLevel = (stock: number = 0, threshold: number = 1000) => {
    const percentage = (stock / threshold) * 100;
    if (percentage <= 20) return "bg-red-500";
    if (percentage <= 40) return "bg-orange-500";
    return "bg-green-500";
  };

  const handleStockChange = (type: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalStocks(prev => ({
        ...prev,
        [type]: numValue
      }));
    }
  };

  const handleStockUpdate = async (type: string) => {
    const newStock = localStocks[type];
    if (newStock !== undefined) {
      await handleUpdateFuel(type, { stock: newStock });
    }
  };

  const handlePriceChange = (type: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setLocalPrices(prev => ({
        ...prev,
        [type]: numValue
      }));
    }
  };

  const handleThresholdChange = (type: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    if (!isNaN(numValue)) {
      setLocalThresholds(prev => ({
        ...prev,
        [type]: numValue
      }));
    }
  };

  const handleSaveChanges = async (type: string) => {
    try {
      setIsLoading(true);
      await handleUpdateFuel(type, {
        price: localPrices[type],
        lowStockThreshold: localThresholds[type],
        stock: localStocks[type]
      });
      setEditingFuel(null); // Close the edit form after saving
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading inventory...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Manage fuel stock and availability</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {petrolPump?.fuelTypes.map((fuel) => (
          <Card key={fuel.type}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Fuel className="w-5 h-5 mr-2" />
                  {fuel.type}
                </span>
                <Switch
                  checked={fuel.available}
                  onCheckedChange={(checked) => handleUpdateFuel(fuel.type, { available: checked })}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Current Stock (Liters)</Label>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <Input
                      type="number"
                      value={localStocks[fuel.type] ?? 0}
                      onChange={(e) => handleStockChange(fuel.type, e.target.value)}
                      onBlur={() => handleStockUpdate(fuel.type)}
                      min="0"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (editingFuel === fuel.type) {
                          handleSaveChanges(fuel.type);
                        } else {
                          setEditingFuel(fuel.type);
                        }
                      }}
                    >
                      {editingFuel === fuel.type ? "Done" : "Edit"}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Stock Level</Label>
                  <Progress 
                    value={(localStocks[fuel.type] ?? 0) / (localThresholds[fuel.type] ?? 1000) * 100} 
                    className={`mt-1.5 ${getStockLevel(localStocks[fuel.type], localThresholds[fuel.type])}`}
                  />
                </div>

                {editingFuel === fuel.type && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label>Price per Liter</Label>
                      <Input
                        type="number"
                        value={localPrices[fuel.type] || 0}
                        onChange={(e) => handlePriceChange(fuel.type, e.target.value)}
                        min="0"
                        step="0.01"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Low Stock Threshold (Liters)</Label>
                      <Input
                        type="number"
                        value={localThresholds[fuel.type] || 1000}
                        onChange={(e) => handleThresholdChange(fuel.type, e.target.value)}
                        min="0"
                        className="mt-1.5"
                      />
                    </div>

                    <Button 
                      className="w-full mt-2"
                      onClick={() => handleSaveChanges(fuel.type)}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}

                {(localStocks[fuel.type] ?? 0) <= (localThresholds[fuel.type] ?? 1000) * 0.2 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Low stock alert! Current stock is below 20% of threshold.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 