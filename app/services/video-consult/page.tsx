import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Video, Star, Clock, MessageSquare, Phone, MicOff, VideoOff, User, Mic } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard } from "lucide-react"

export default function VideoConsultPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800/95 border-b dark:border-gray-700/50 shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">Video Consultation</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* Video Preview */}
          <Card className="overflow-hidden mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="relative aspect-video bg-gray-900">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Video className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm opacity-70">Video preview will appear here</p>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button size="icon" variant="secondary" className="rounded-full w-12 h-12 bg-black/50 text-white hover:bg-black/70 dark:bg-black/70 dark:hover:bg-black/80">
                  <Mic className="w-6 h-6" />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full w-12 h-12 bg-black/50 text-white hover:bg-black/70 dark:bg-black/70 dark:hover:bg-black/80">
                  <Video className="w-6 h-6" />
                </Button>
                <Button size="icon" className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                  <Phone className="w-8 h-8" />
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800/95">
              <div className="flex items-center mb-2">
                <User className="w-5 h-5 mr-2 text-primary dark:text-primary/90" />
                <h3 className="font-medium text-gray-900 dark:text-white">Dr. Sarah Johnson</h3>
              </div>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                Certified Automotive Expert • Available now
              </p>
            </div>
          </Card>

          {/* Consultation Type */}
          <Card className="mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Select Consultation Type</h3>
              <RadioGroup defaultValue="diagnostic">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 border dark:border-gray-700/50 rounded-lg p-3">
                    <RadioGroupItem value="diagnostic" id="diagnostic" />
                    <Label htmlFor="diagnostic" className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Diagnostic Consultation</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">Get expert advice on vehicle issues</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border dark:border-gray-700/50 rounded-lg p-3">
                    <RadioGroupItem value="repair" id="repair" />
                    <Label htmlFor="repair" className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Repair Guidance</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">Step-by-step repair instructions</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border dark:border-gray-700/50 rounded-lg p-3">
                    <RadioGroupItem value="maintenance" id="maintenance" />
                    <Label htmlFor="maintenance" className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Maintenance Advice</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">Preventive care recommendations</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </Card>

          {/* Vehicle Info */}
          <Card className="mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Vehicle Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="make" className="text-gray-700 dark:text-gray-300">Make</Label>
                  <Select defaultValue="toyota">
                    <SelectTrigger id="make" className="dark:bg-gray-800 dark:border-gray-700/50">
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toyota">Toyota</SelectItem>
                      <SelectItem value="honda">Honda</SelectItem>
                      <SelectItem value="ford">Ford</SelectItem>
                      <SelectItem value="chevrolet">Chevrolet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model" className="text-gray-700 dark:text-gray-300">Model</Label>
                  <Select defaultValue="camry">
                    <SelectTrigger id="model" className="dark:bg-gray-800 dark:border-gray-700/50">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camry">Camry</SelectItem>
                      <SelectItem value="corolla">Corolla</SelectItem>
                      <SelectItem value="rav4">RAV4</SelectItem>
                      <SelectItem value="highlander">Highlander</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year" className="text-gray-700 dark:text-gray-300">Year</Label>
                  <Select defaultValue="2020">
                    <SelectTrigger id="year" className="dark:bg-gray-800 dark:border-gray-700/50">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2020">2020</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Issue Description */}
          <Card className="mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Describe the Issue</h3>
              <Textarea
                placeholder="Please describe the vehicle issue in detail..."
                className="mb-3 dark:bg-gray-800 dark:border-gray-700/50 dark:text-gray-300"
                rows={4}
              />
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                This information will help the expert better understand your situation.
              </p>
            </div>
          </Card>

          {/* Consultation Options */}
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Consultation Options</h3>
          <div className="grid gap-4 mb-6">
            <ConsultationCard
              icon={<Clock className="w-5 h-5 text-primary dark:text-primary/90" />}
              title="15-Minute Consultation"
              description="Quick diagnosis and basic advice"
              price="₹29.99"
              selected
            />

            <ConsultationCard
              icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              title="30-Minute Consultation"
              description="Detailed diagnosis and repair guidance"
              price="₹49.99"
            />

            <ConsultationCard
              icon={<Clock className="w-5 h-5 text-green-600 dark:text-green-400" />}
              title="60-Minute Consultation"
              description="Comprehensive diagnosis and detailed repair plan"
              price="₹89.99"
            />
          </div>

          {/* Payment Method */}
          <Card className="mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Payment Method</h3>
              <div className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700/50">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-3 text-primary dark:text-primary/90" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Visa •••• 4242</h4>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Expires 12/24</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:bg-gray-700/50">
                  Change
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

function ConsultationCard({
  icon,
  title,
  description,
  price,
  selected = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  price: string
  selected?: boolean
}) {
  return (
    <Card className={`overflow-hidden ${selected ? "border-primary dark:border-primary/90" : ""}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={`p-2 mr-3 rounded-full ${selected ? "bg-primary/10 dark:bg-primary/20" : "bg-gray-100 dark:bg-gray-700/50"}`}>
            {icon}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">{description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{price}</span>
              {selected && (
                <span className="text-xs px-2 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded-full">
                  Selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

