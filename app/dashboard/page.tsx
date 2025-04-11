"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FooterNav } from "@/components/shared/footer-nav";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Car,
  Phone,
  Shield,
  MessageSquare,
  Award,
  AlertTriangle,
  Navigation,
  Video,
  Droplet,
  Stethoscope,
  Bell,
  User,
  Star,
} from "lucide-react";
import { mockServices, mockHistory, mockNotifications } from "@/lib/mock-data";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/auth/signin");
      return;
    }
    setUser(JSON.parse(userData));

    // Count unread notifications
    const unread = mockNotifications.filter(n => !n.read).length;
    setUnreadNotifications(unread);
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800/95 border-b shadow-sm dark:border-gray-700/50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary dark:text-primary/90" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">RoadGuard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <MessageSquare className="w-5 h-5" />
            </Button>
            <Link href="/profile">
              <div className="w-8 h-8 overflow-hidden rounded-full bg-primary/10 dark:bg-gray-700/50">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto.startsWith('http') 
                      ? user.profilePhoto 
                      : `http://localhost:5000${user.profilePhoto}`}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary dark:text-gray-300" />
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* Location Bar */}
          <div className="flex items-center p-3 mb-6 bg-white dark:bg-gray-800/90 rounded-lg shadow-sm dark:shadow-gray-900/10 border border-gray-100 dark:border-gray-700/50">
            <MapPin className="w-5 h-5 mr-2 text-primary dark:text-primary/90" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-gray-900 dark:text-white">Current Location</p>
              <p className="text-gray-500 dark:text-gray-400">123 Main Street, Anytown</p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50">
              Change
            </Button>
          </div>

          {/* SOS Button */}
          <div className="mb-6">
            <Link href="/emergency">
              <Button className="w-full py-6 text-lg font-bold bg-red-600 hover:bg-red-700 dark:bg-red-700/90 dark:hover:bg-red-800 dark:text-white/90">
                <AlertTriangle className="w-6 h-6 mr-2" />
                SOS EMERGENCY
              </Button>
            </Link>
          </div>

          {/* Services Tabs */}
          <Tabs defaultValue="services" className="mb-6">
            <TabsList className="w-full bg-gray-100 dark:bg-gray-800/90">
              <TabsTrigger value="services" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700/90">
                Services
              </TabsTrigger>
              <TabsTrigger value="nearby" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700/90">
                Nearby
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700/90">
                History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="services" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <ServiceCard
                  icon={<Car />}
                  title="Mechanic"
                  description="Find nearby mechanics"
                  href="/services/mechanic"
                />
                <ServiceCard
                  icon={<Navigation />}
                  title="Towing"
                  description="Request towing service"
                  href="/services/towing"
                />
                <ServiceCard
                  icon={<Droplet />}
                  title="Fuel Delivery"
                  description="Get fuel delivered"
                  href="/services/fuel"
                />
                <ServiceCard
                  icon={<Video />}
                  title="Video Consult"
                  description="Live mechanic consultation"
                  href="/services/video-consult"
                />
                <ServiceCard
                  icon={<Stethoscope />}
                  title="AR Diagnosis"
                  description="Self-diagnose with AR"
                  href="/services/ar-diagnosis"
                />
                <ServiceCard
                  icon={<Phone />}
                  title="Medical Help"
                  description="Emergency medical assistance"
                  href="/services/medical"
                />
              </div>
            </TabsContent>
            <TabsContent value="nearby">
              <div className="relative w-full h-[400px] bg-gray-100 dark:bg-gray-800/50 rounded-lg overflow-hidden mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">Map view loading...</p>
                </div>
                <div className="absolute bottom-4 right-4">
                  <Button size="sm" className="shadow-md dark:bg-gray-700/90 dark:text-white/90">
                    <MapPin className="w-4 h-4 mr-2" />
                    Recenter
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {mockServices.map((service) => (
                  <NearbyServiceCard
                    key={service.id}
                    name={service.name}
                    type={service.type}
                    distance={service.distance}
                    rating={service.rating}
                    eta={service.eta}
                    href={`/services/${service.type}/${service.id}`}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="history">
              <div className="space-y-4">
                {mockHistory.map((item) => (
                  <HistoryItem
                    key={item.id}
                    date={item.date}
                    service={item.service}
                    provider={item.provider}
                    status={item.status}
                    href={`/history/${item.id}`}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Bottom Navigation */}
      <FooterNav />
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:border-primary dark:bg-gray-800/90 dark:border-gray-700/50 dark:hover:border-primary">
        <div className="p-4">
          <div className="p-2 w-fit rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90">
            {icon}
          </div>
          <h3 className="mt-2 font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </Card>
    </Link>
  );
}

function NearbyServiceCard({
  name,
  type,
  distance,
  rating,
  eta,
  href,
}: {
  name: string;
  type: string;
  distance: string;
  rating: number;
  eta: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden transition-all hover:shadow-md dark:bg-gray-800/90 dark:border-gray-700/50">
        <div className="p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 mr-4 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <div className="text-primary dark:text-primary/90">
                {type === "mechanic" && <Car className="w-6 h-6" />}
                {type === "towing" && <Navigation className="w-6 h-6" />}
                {type === "fuel" && <Droplet className="w-6 h-6" />}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
              <div className="flex items-center mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 mr-2">
                  {type}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{distance}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">{rating}</span>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ETA: {eta}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function HistoryItem({
  date,
  service,
  provider,
  status,
  href,
}: {
  date: string;
  service: string;
  provider: string;
  status: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden transition-all hover:shadow-md dark:bg-gray-800/90 dark:border-gray-700/50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              status === "completed"
                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : status === "cancelled"
                ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
            }`}>
              {status}
            </span>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white">{service}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{provider}</p>
        </div>
      </Card>
    </Link>
  );
} 