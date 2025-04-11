"use client";

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Car,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Settings,
  Award,
  MapPin,
  Key,
  HelpCircle,
  MessageSquare,
  Home,
  History,
  Moon,
  Star,
  Clock,
  Calendar,
  Lock,
} from "lucide-react"
import Image from "next/image"
import { useDarkMode } from "../contexts/DarkModeContext"
import { FooterNav } from "@/components/shared/footer-nav"

interface UserData {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  role: string;
  carDetails?: {
    company: string;
    model: string;
  };
  memberSince: string;
  servicesUsed: number;
  rewardPoints: number;
  profilePhoto?: string;
  vehicles?: Array<{
    make: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
    isPrimary: boolean;
  }>;
}

function formatMemberSince(dateString: string) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem("user");
      if (!storedUserData) {
        router.push("/auth/signin");
        return;
      }
      const parsedData = JSON.parse(storedUserData);
      
      // Set current date as member since if not present
      if (!parsedData.memberSince) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        parsedData.memberSince = new Date(year, month).toISOString();
      }
      
      // Ensure default values for missing data
      parsedData.servicesUsed = parsedData.servicesUsed || 0;
      parsedData.rewardPoints = parsedData.rewardPoints || 0;
      
      // Update localStorage with the fixed data
      localStorage.setItem("user", JSON.stringify(parsedData));
      
      setUserData(parsedData);
    } catch (error) {
      console.error("Error loading user data:", error);
      router.push("/auth/signin");
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/auth/signin");
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b shadow-sm dark:border-gray-700">
        <div className="container flex items-center h-16 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold dark:text-white">Profile</h1>
          <div className="ml-auto">
            <Link href="/profile/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* Profile Header */}
          <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <div className="w-full h-full rounded-full overflow-hidden bg-primary/10 dark:bg-gray-700/50">
                      {userData.profilePhoto ? (
                        <img
                          src={userData.profilePhoto.startsWith('http') 
                            ? userData.profilePhoto 
                            : `http://localhost:5000${userData.profilePhoto}`}
                          alt={userData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-primary dark:text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold dark:text-white">{userData.name}</h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{userData.email}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{userData.mobileNumber}</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto dark:border-gray-600 dark:text-gray-300">
                  Edit
                </Button>
              </div>

              <div className="flex items-center mt-4 pt-4 border-t dark:border-gray-700">
                <div className="flex-1 text-center">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Member Since</p>
                  <p className="font-medium dark:text-white">
                    {formatMemberSince(userData.memberSince)}
                  </p>
                </div>
                <div className="flex-1 text-center border-x dark:border-gray-700">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Services Used</p>
                  <p className="font-medium dark:text-white">{userData?.servicesUsed || 0}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Reward Points</p>
                  <p className="font-medium dark:text-white">{userData?.rewardPoints || 0}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="account" className="mb-6">
            <TabsList className="w-full bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="account" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Account
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Vehicles
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Payment
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="mt-4">
              <Card className="mb-4">
                <div className="p-4">
                  <h3 className="font-medium mb-3">Account Settings</h3>

                  <div className="space-y-3">
                    <ProfileLink
                      key="personal"
                      icon={<User className="w-5 h-5 text-primary" />}
                      title="Personal Information"
                      description="Manage your personal details"
                      href="/profile/personal"
                    />

                    <ProfileLink
                      key="notifications"
                      icon={<Bell className="w-5 h-5 text-primary" />}
                      title="Notifications"
                      description="Manage your notification preferences"
                      href="/profile/notifications"
                    />

                    <ProfileLink
                      key="privacy"
                      icon={<Shield className="w-5 h-5 text-primary" />}
                      title="Privacy & Security"
                      description="Manage your privacy settings"
                      href="/profile/privacy"
                    />

                    <ProfileLink
                      key="locations"
                      icon={<MapPin className="w-5 h-5 text-primary" />}
                      title="Saved Locations"
                      description="Manage your saved addresses"
                      href="/profile/locations"
                    />
                  </div>
                </div>
              </Card>

              <Card className="mb-4">
                <div className="p-4">
                  <h3 className="font-medium mb-3">Preferences</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium dark:text-white">Dark Mode</span>
                      </div>
                      <Switch
                        checked={darkMode}
                        onCheckedChange={toggleDarkMode}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Location Services</h4>
                        <p className="text-sm text-muted-foreground">Allow app to access your location</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive push notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <h3 className="font-medium mb-3">Support</h3>

                  <div className="space-y-3">
                    <ProfileLink
                      key="help"
                      icon={<HelpCircle className="w-5 h-5 text-primary" />}
                      title="Help Center"
                      description="Get help with the app"
                      href="/help"
                    />

                    <ProfileLink
                      key="support"
                      icon={<MessageSquare className="w-5 h-5 text-primary" />}
                      title="Contact Support"
                      description="Reach out to our support team"
                      href="/support"
                    />

                    <Button
                      variant="outline"
                      className="w-full mt-4 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Vehicles Tab */}
            <TabsContent value="vehicles">
              <Card className="mb-4">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">My Vehicles</h3>
                    <Button size="sm">Add Vehicle</Button>
                  </div>

                  <div className="space-y-3">
                    {userData.carDetails && (
                      <VehicleCard
                        make={userData.carDetails.company}
                        model={userData.carDetails.model}
                        year="2023"
                        color="Silver"
                        licensePlate="ABC-1234"
                        primary
                      />
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment">
              <Card className="mb-4">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Payment Methods</h3>
                    <Button size="sm">Add Method</Button>
                  </div>

                  <div className="space-y-3">
                    <PaymentCard key="visa" type="Visa" number="•••• 4242" expiry="05/25" primary />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <h3 className="font-medium mb-3">Billing History</h3>

                  <div className="space-y-3">
                    <BillingItem key="towing" service="Towing Service" date="May 15, 2023" amount="₹120.00" status="Paid" />
                    <BillingItem key="tire" service="Flat Tire Repair" date="March 3, 2023" amount="₹75.00" status="Paid" />
                    <BillingItem key="battery" service="Battery Jump Start" date="January 22, 2023" amount="₹60.00" status="Paid" />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer Navigation */}
      <FooterNav />
    </div>
  );
}

function ProfileLink({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20">{icon}</div>
      <div className="flex-1">
        <p className="font-medium dark:text-white">{title}</p>
        <p className="text-sm text-muted-foreground dark:text-gray-400">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600" />
    </Link>
  );
}

function VehicleCard({
  make,
  model,
  year,
  color,
  licensePlate,
  primary = false,
}: {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  primary?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border ${primary ? "border-primary" : "border-gray-200 dark:border-gray-700"} dark:bg-gray-800`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium dark:text-white">{make} {model}</h4>
          <p className="text-sm text-muted-foreground dark:text-gray-400">{year} • {color}</p>
        </div>
        {primary && (
          <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 dark:bg-primary/20 rounded-full">
            Primary
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center space-x-2">
        <CreditCard className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <span className="text-sm text-muted-foreground dark:text-gray-400">{licensePlate}</span>
      </div>
    </div>
  );
}

function PaymentCard({
  type,
  number,
  expiry,
  primary = false,
}: {
  type: string
  number: string
  expiry: string
  primary?: boolean
}) {
  return (
    <div className={`p-4 rounded-lg border ${primary ? "border-primary" : "border-gray-200 dark:border-gray-700"} dark:bg-gray-800`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          <div>
            <h4 className="font-medium dark:text-white">{type}</h4>
            <p className="text-sm text-muted-foreground dark:text-gray-400">{number}</p>
          </div>
        </div>
        {primary && (
          <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 dark:bg-primary/20 rounded-full">
            Primary
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">Expires {expiry}</p>
    </div>
  );
}

function BillingItem({
  service,
  date,
  amount,
  status,
}: {
  service: string
  date: string
  amount: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
      <div>
        <h4 className="font-medium dark:text-white">{service}</h4>
        <p className="text-sm text-muted-foreground dark:text-gray-400">{date}</p>
      </div>
      <div className="text-right">
        <p className="font-medium dark:text-white">{amount}</p>
        <p className="text-sm text-muted-foreground dark:text-gray-400">{status}</p>
      </div>
    </div>
  );
} 