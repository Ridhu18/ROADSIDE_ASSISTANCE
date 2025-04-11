import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  ArrowLeft,
  Car,
  Star,
  MapPin,
  Clock,
  MessageSquare,
  Phone,
  Video,
  Calendar,
  CheckCircle,
  Wrench,
  Award,
  ThumbsUp,
} from "lucide-react"

export default function MechanicDetailPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800/95 border-b dark:border-gray-700/50 shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <Link href="/services/mechanic">
            <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">Mechanic Details</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* Mechanic Profile */}
          <Card className="overflow-hidden mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <div className="flex items-start">
                <div className="w-20 h-20 mr-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                  <Car className="w-10 h-10 text-primary dark:text-primary/90" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">John's Auto Repair</h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">General Mechanic • Engine Specialist</p>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-3">
                      <Star className="w-4 h-4 mr-1 text-yellow-500 dark:text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">4.8</span>
                      <span className="ml-1 text-xs text-muted-foreground dark:text-gray-400">(124)</span>
                    </div>
                    <div className="flex items-center mr-3">
                      <MapPin className="w-4 h-4 mr-1 text-muted-foreground dark:text-gray-400" />
                      <span className="text-xs text-muted-foreground dark:text-gray-400">0.8 miles</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-muted-foreground dark:text-gray-400" />
                      <span className="text-xs text-muted-foreground dark:text-gray-400">ETA: 10 min</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded-full">
                      Engine Repair
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded-full">
                      Brake Service
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded-full">
                      Electrical
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded-full">
                      Diagnostics
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Car className="w-4 h-4 mr-2" />
                      Request
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="about" className="mb-6">
            <TabsList className="w-full dark:bg-gray-800/90 dark:border-gray-700/50">
              <TabsTrigger value="about" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                About
              </TabsTrigger>
              <TabsTrigger value="services" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                Services
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-4">
              <Card className="p-4 mb-4 dark:bg-gray-800/95 dark:border-gray-700/50">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">About John's Auto Repair</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                  John's Auto Repair has been serving the community for over 15 years. We specialize in all types of
                  automotive repair and maintenance services, with a focus on engine diagnostics and repair.
                </p>

                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Business Hours</h4>
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>Monday - Friday</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>Saturday</span>
                    <span>9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Location</h4>
                <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-700/50 rounded-lg mb-3">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground dark:text-gray-400">Map loading...</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">123 Auto Repair Lane, Anytown, USA</p>
              </Card>

              <Card className="p-4 dark:bg-gray-800/95 dark:border-gray-700/50">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Certifications & Achievements</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="p-2 mr-3 rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">ASE Certified</h4>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">Automotive Service Excellence</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="p-2 mr-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Top Rated 2023</h4>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">Local Business Excellence Award</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="p-2 mr-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Specialized Training</h4>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">Advanced Engine Diagnostics</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-4">
              <Card className="p-4 mb-4 dark:bg-gray-800/95 dark:border-gray-700/50">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Services Offered</h3>
                <div className="space-y-3">
                  <ServiceItem name="Engine Diagnostics & Repair" price="₹80 - ₹300+" time="1-4 hours" />
                  <ServiceItem name="Brake Service" price="₹150 - ₹400" time="1-2 hours" />
                  <ServiceItem name="Oil Change" price="₹40 - ₹80" time="30 minutes" />
                  <ServiceItem name="Battery Replacement" price="₹120 - ₹200" time="30 minutes" />
                  <ServiceItem name="Tire Repair/Replacement" price="₹20 - ₹200+ per tire" time="30-60 minutes" />
                  <ServiceItem name="Electrical System Repair" price="₹80 - ₹500+" time="1-3 hours" />
                </div>
              </Card>

              <Card className="p-4 dark:bg-gray-800/95 dark:border-gray-700/50">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Emergency Services</h3>
                <div className="space-y-3">
                  <ServiceItem name="Roadside Assistance" price="₹80 - ₹120" time="Response: ~10 min" emergency />
                  <ServiceItem name="Jump Start" price="₹60 - ₹80" time="Response: ~10 min" emergency />
                  <ServiceItem name="Flat Tire Change" price="₹60 - ₹100" time="Response: ~15 min" emergency />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <Card className="p-4 mb-4 dark:bg-gray-800/95 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Customer Reviews</h3>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-1 text-yellow-500 dark:text-yellow-400 fill-current" />
                    <span className="font-bold text-gray-900 dark:text-white">4.8</span>
                    <span className="ml-1 text-sm text-muted-foreground dark:text-gray-400">(124)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <ReviewItem
                    name="Sarah Johnson"
                    date="2 weeks ago"
                    rating={5}
                    comment="John was amazing! My car broke down on the highway and he arrived within 15 minutes. Fixed my alternator issue right there and got me back on the road quickly. Highly recommend!"
                  />

                  <ReviewItem
                    name="Michael Chen"
                    date="1 month ago"
                    rating={4}
                    comment="Good service and fair pricing. They diagnosed my engine problem quickly and explained everything clearly. Only reason for 4 stars is that I had to wait a bit longer than expected."
                  />

                  <ReviewItem
                    name="Jessica Williams"
                    date="2 months ago"
                    rating={5}
                    comment="John is honest and reliable. He didn't try to upsell me on unnecessary services and fixed my brake issue at a reasonable price. Will definitely use again!"
                  />
                </div>

                <Button variant="outline" className="w-full mt-4 dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                  View All Reviews
                </Button>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Book Service */}
          <Card className="mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Book a Service</h3>
              <div className="flex gap-3 mb-4">
                <Button variant="outline" className="flex-1 dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
                <Button className="flex-1">
                  <Car className="w-4 h-4 mr-2" />
                  Request Now
                </Button>
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400 text-center">
                Immediate assistance available • Average response time: 10 min
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* AI Assistant */}
      <div className="fixed bottom-4 right-4">
        <Button className="w-12 h-12 rounded-full shadow-lg dark:bg-gray-800/95 dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700/50">
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}

function ServiceItem({
  name,
  price,
  time,
  emergency = false,
}: {
  name: string
  price: string
  time: string
  emergency?: boolean
}) {
  return (
    <div className={`p-3 rounded-lg ${emergency ? "bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50" : "bg-gray-50 dark:bg-gray-700/50"}`}>
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-medium text-gray-900 dark:text-white">{name}</h4>
        <span className="text-sm text-gray-700 dark:text-gray-300">{price}</span>
      </div>
      <div className="flex items-center">
        <Clock className="w-3 h-3 mr-1 text-muted-foreground dark:text-gray-400" />
        <span className="text-xs text-muted-foreground dark:text-gray-400">{time}</span>
        {emergency && (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-full">Emergency</span>
        )}
      </div>
    </div>
  )
}

function ReviewItem({
  name,
  date,
  rating,
  comment,
}: {
  name: string
  date: string
  rating: number
  comment: string
}) {
  return (
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{name}</h4>
          <p className="text-xs text-muted-foreground dark:text-gray-400">{date}</p>
        </div>
        <div className="flex items-center">
          <Star className="w-4 h-4 mr-1 text-yellow-500 dark:text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">{rating}</span>
        </div>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">{comment}</p>
    </div>
  )
}