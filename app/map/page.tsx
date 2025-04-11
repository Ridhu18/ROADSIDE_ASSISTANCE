import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FooterNav } from "@/components/shared/footer-nav"
import Link from "next/link"
import { Search, Car, Navigation, Droplet, Stethoscope, Phone, Filter, Layers, Locate, ChevronUp, Star } from "lucide-react"

export default function MapPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-800/95 shadow-md border-b dark:border-gray-700/50">
        <div className="container flex items-center h-16 px-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <Car className="w-6 h-6" />
            </Button>
          </Link>
          <div className="relative flex-1 mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input 
              placeholder="Search for services..." 
              className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/50 focus:border-primary dark:focus:border-primary"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Map View */}
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800/95">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Map loading...</p>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="bg-white dark:bg-gray-800/90 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700/90">
              <Layers className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <Button size="icon" variant="secondary" className="bg-white dark:bg-gray-800/90 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700/90">
              <Locate className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
          </div>
        </div>

        {/* Bottom Sheet */}
        <div className="absolute bottom-16 left-0 right-0 z-10 bg-white dark:bg-gray-800/95 rounded-t-xl shadow-lg border-t dark:border-gray-700/50">
          <div className="flex justify-center py-2">
            <div className="w-12 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          </div>

          <div className="container px-4 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nearby Services</h2>
              <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <ChevronUp className="w-5 h-5 mr-1" />
                Expand
              </Button>
            </div>

            {/* Service Tabs */}
            <Tabs defaultValue="all" className="mb-4">
              <TabsList className="w-full dark:bg-gray-800/90 border dark:border-gray-700/50">
                <TabsTrigger value="all" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                  All
                </TabsTrigger>
                <TabsTrigger value="mechanics" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                  Mechanics
                </TabsTrigger>
                <TabsTrigger value="towing" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                  Towing
                </TabsTrigger>
                <TabsTrigger value="fuel" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                  Fuel
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-3">
                  <MapServiceCard
                    name="John's Auto Repair"
                    type="Mechanic"
                    distance="0.8 miles"
                    rating={4.8}
                    eta="10 min"
                    href="/services/mechanic/1"
                  />

                  <MapServiceCard
                    name="Rapid Towing Inc."
                    type="Towing"
                    distance="1.2 miles"
                    rating={4.6}
                    eta="15 min"
                    href="/services/towing/1"
                  />

                  <MapServiceCard
                    name="City Fuel Delivery"
                    type="Fuel"
                    distance="2.5 miles"
                    rating={4.7}
                    eta="20 min"
                    href="/services/fuel/1"
                  />

                  <MapServiceCard
                    name="Emergency Medical Services"
                    type="Medical"
                    distance="3.0 miles"
                    rating={4.9}
                    eta="12 min"
                    href="/services/medical/1"
                  />
                </div>
              </TabsContent>

              <TabsContent value="mechanics">
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">Mechanics will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="towing">
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">Towing services will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="fuel">
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">Fuel delivery services will appear here</p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <QuickAction icon={<Car />} label="Mechanic" href="/services/mechanic" />
              <QuickAction icon={<Navigation />} label="Towing" href="/services/towing" />
              <QuickAction icon={<Droplet />} label="Fuel" href="/services/fuel" />
              <QuickAction icon={<Phone />} label="Emergency" href="/emergency" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <FooterNav />
    </div>
  )
}

function MapServiceCard({
  name,
  type,
  distance,
  rating,
  eta,
  href,
}: {
  name: string
  type: string
  distance: string
  rating: number
  eta: string
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md dark:bg-gray-800/90 dark:border-gray-700/50">
        <div className="p-3">
          <div className="flex items-start">
            <div className="w-10 h-10 mr-3 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
              {type === "Mechanic" && <Car className="w-5 h-5 text-primary dark:text-primary/90" />}
              {type === "Towing" && <Navigation className="w-5 h-5 text-primary dark:text-primary/90" />}
              {type === "Fuel" && <Droplet className="w-5 h-5 text-primary dark:text-primary/90" />}
              {type === "Medical" && <Stethoscope className="w-5 h-5 text-primary dark:text-primary/90" />}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
              <div className="flex items-center mb-1">
                <span className="text-xs px-2 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded-full mr-2">{type}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{distance}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">{rating}</span>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ETA: {eta}</span>
              </div>
            </div>
          </div>pro
        </div>
      </Card>
    </Link>
  )
}

function QuickAction({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode
  label: string
  href: string
}) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <div className="p-2 mb-1 rounded-full bg-primary/10 dark:bg-primary/20">
          <div className="text-primary dark:text-primary/90 w-5 h-5">{icon}</div>
        </div>
        <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
      </div>
    </Link>
  )
}

