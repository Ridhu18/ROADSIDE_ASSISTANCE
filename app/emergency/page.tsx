"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Car, Phone, MessageSquare, MapPin, Ambulance, Shield, Plus, X } from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmergencyStatus {
  time: string;
  message: string;
  highlight?: boolean;
}

interface EmergencyContact {
  _id: string;
  name: string;
  relation: string;
  phone: string;
}

export default function EmergencyPage() {
  const { darkMode } = useDarkMode();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyId, setEmergencyId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ address: string; coordinates: [number, number] } | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<EmergencyStatus[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState<EmergencyContact>({
    _id: "",
    name: "",
    relation: "",
    phone: "",
  });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocation({
              address: data.display_name,
              coordinates: [longitude, latitude]
            });
          } catch (error) {
            console.error("Error getting location:", error);
            toast({
              title: "Error",
              description: "Failed to get your location",
              variant: "destructive",
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Error",
            description: "Please enable location services",
            variant: "destructive",
          });
        }
      );
    }

    // Load emergency contacts from backend
    const loadContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Not authenticated");
        }

        const response = await fetch("http://localhost:5000/api/emergency-contacts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load contacts");
        }

        const data = await response.json();
        setContacts(data.contacts);
      } catch (error) {
        console.error("Error loading contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load emergency contacts",
          variant: "destructive",
        });
      }
    };

    loadContacts();
  }, []);

  const handleEmergencyRequest = async (type: 'medical' | 'mechanical' | 'fuel') => {
    setIsLoading(true);
    try {
      if (!location) {
        throw new Error("Location not available");
      }

      const response = await fetch("http://localhost:5000/api/emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          type,
          location: location.address,
          coordinates: location.coordinates,
          description: `Emergency ${type} assistance required at ${location.address}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create emergency request");
      }

      setEmergencyId(data.emergency.id);
      setStatusUpdates([
        {
          time: new Date().toLocaleTimeString(),
          message: "Emergency request received. Finding nearby assistance.",
        },
      ]);

      toast({
        title: "Success",
        description: "Emergency request created successfully",
      });

      // Start polling for status updates
      startStatusPolling(data.emergency.id);
    } catch (error) {
      console.error("Error creating emergency:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create emergency request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startStatusPolling = (id: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/emergency/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get emergency status");
        }

        setStatusUpdates((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            message: `Status updated: ${data.emergency.status}`,
            highlight: true,
          },
        ]);

        if (["completed", "cancelled"].includes(data.emergency.status)) {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Error polling status:", error);
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  };

  const handleCancelEmergency = async () => {
    if (!emergencyId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/emergency/${emergencyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel emergency");
      }

      setEmergencyId(null);
      setStatusUpdates([]);
      toast({
        title: "Success",
        description: "Emergency request cancelled",
      });
    } catch (error) {
      console.error("Error cancelling emergency:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel emergency",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.relation || !newContact.phone) {
      toast({
        title: "Error",
        description: "Please fill in all contact details",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("http://localhost:5000/api/emergency-contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newContact),
      });

      if (!response.ok) {
        throw new Error("Failed to add contact");
      }

      const data = await response.json();
      setContacts([...contacts, data.contact]);
      setNewContact({ _id: "", name: "", relation: "", phone: "" });
      setIsAddContactOpen(false);
      
      toast({
        title: "Success",
        description: "Emergency contact added successfully",
      });
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add emergency contact",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`http://localhost:5000/api/emergency-contacts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      setContacts(contacts.filter(contact => contact._id !== id));
      
      toast({
        title: "Success",
        description: "Emergency contact removed",
      });
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete emergency contact",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-red-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-red-600 dark:bg-red-900 text-white">
        <div className="container flex items-center h-16 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-red-500/20 dark:hover:bg-red-800/50">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold">Emergency Assistance</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* Emergency Banner */}
          <div className="p-4 mb-6 text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-center p-3 mb-2 rounded-full bg-red-100 dark:bg-red-900/30 w-fit mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold dark:text-white">SOS Mode Activated</h2>
            <p className="text-muted-foreground dark:text-gray-400">Help is on the way. Stay calm and follow the instructions below.</p>
          </div>

          {/* Location Info */}
          <Card className="p-4 mb-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mt-1 mr-3 text-primary dark:text-primary/90" />
              <div>
                <h3 className="font-medium dark:text-white">Your Current Location</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {location?.address || "Getting location..."}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => window.location.reload()}
                >
                  Update Location
                </Button>
              </div>
            </div>
          </Card>

          {/* Emergency Actions */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <EmergencyAction
              icon={<Phone className="w-6 h-6 text-red-600 dark:text-red-400" />}
              title="Call Emergency Services"
              description="Connect with 911 or local emergency"
              buttonText="Call Now"
              buttonVariant="destructive"
              onClick={() => window.location.href = "tel:911"}
            />

            <EmergencyAction
              icon={<Car className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
              title="Urgent Roadside Assistance"
              description="Priority towing and mechanical help"
              buttonText="Request Help"
              buttonVariant="default"
              onClick={() => handleEmergencyRequest('mechanical')}
              disabled={isLoading || !!emergencyId}
            />

            <EmergencyAction
              icon={<Ambulance className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              title="Medical Assistance"
              description="Request medical help for injuries"
              buttonText="Get Medical Help"
              buttonVariant="outline"
              onClick={() => handleEmergencyRequest('medical')}
              disabled={isLoading || !!emergencyId}
            />
          </div>

          {/* Emergency Contacts */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium dark:text-white">Emergency Contacts</h3>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsAddContactOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </div>
          <div className="space-y-3 mb-6">
            {contacts.map((contact) => (
              <ContactCard
                key={contact._id}
                name={contact.name}
                relation={contact.relation}
                phone={contact.phone}
                onDelete={() => handleDeleteContact(contact._id)}
              />
            ))}
            {contacts.length === 0 && (
              <Card className="p-4 text-center dark:bg-gray-800 dark:border-gray-700">
                <p className="text-muted-foreground dark:text-gray-400">
                  No emergency contacts added yet
                </p>
              </Card>
            )}
          </div>

          {/* Add Contact Dialog */}
          <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="relation" className="text-right">
                    Relation
                  </Label>
                  <Input
                    id="relation"
                    value={newContact.relation}
                    onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddContact}>Add Contact</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Status Updates */}
          {statusUpdates.length > 0 && (
            <Card className="p-4 mb-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-3 font-medium dark:text-white">Status Updates</h3>
              <div className="space-y-3">
                {statusUpdates.map((update, index) => (
                  <StatusUpdate
                    key={index}
                    time={update.time}
                    message={update.message}
                    highlight={update.highlight}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Cancel Emergency */}
          {emergencyId && (
            <Button 
              variant="outline" 
              className="w-full border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300"
              onClick={handleCancelEmergency}
              disabled={isLoading}
            >
              Cancel Emergency Mode
            </Button>
          )}
        </div>
      </main>

      {/* Emergency Chat */}
      <div className="fixed bottom-4 right-4">
        <Button 
          className="w-12 h-12 rounded-full shadow-lg bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800" 
          size="icon"
          onClick={() => router.push(`/chat/${emergencyId}`)}
          disabled={!emergencyId}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}

function EmergencyAction({
  icon,
  title,
  description,
  buttonText,
  buttonVariant = "default",
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: "default" | "destructive" | "outline";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <div className="p-4">
        <div className="flex items-start">
          <div className="p-2 mr-3 rounded-full bg-red-50 dark:bg-red-900/30">{icon}</div>
          <div className="flex-1">
            <h3 className="font-medium dark:text-white">{title}</h3>
            <p className="mb-3 text-sm text-muted-foreground dark:text-gray-400">{description}</p>
            <Button variant={buttonVariant} className="w-full" onClick={onClick} disabled={disabled}>
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ContactCard({
  name,
  relation,
  phone,
  onDelete,
}: {
  name: string;
  relation: string;
  phone: string;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center p-3">
        <div className="w-10 h-10 mr-3 overflow-hidden rounded-full bg-primary/10 dark:bg-primary/20">
          <div className="flex items-center justify-center h-full text-primary dark:text-primary/90">
            <Shield className="w-5 h-5" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-medium dark:text-white">{name}</h4>
          <p className="text-xs text-muted-foreground dark:text-gray-400">{relation}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary dark:text-primary/90 hover:bg-primary/10 dark:hover:bg-primary/20"
            onClick={() => window.location.href = `tel:${phone}`}
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={onDelete}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function StatusUpdate({
  time,
  message,
  highlight = false,
}: {
  time: string;
  message: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? "bg-primary/10 dark:bg-primary/20" : "bg-gray-50 dark:bg-gray-700/50"}`}>
      <div className="flex items-start">
        <p className="w-16 text-xs font-medium text-muted-foreground dark:text-gray-400">{time}</p>
        <p className={`flex-1 text-sm ${highlight ? "font-medium dark:text-white" : "dark:text-gray-300"}`}>{message}</p>
      </div>
    </div>
  );
}

