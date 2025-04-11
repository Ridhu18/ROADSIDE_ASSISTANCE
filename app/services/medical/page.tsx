import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft, Phone, Ambulance, Heart, AlertTriangle, MapPin, Clock, Info } from "lucide-react"

export default function MedicalAssistancePage() {
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
          <h1 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">Medical Assistance</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* Emergency Notice */}
          <Card className="mb-6 border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/30">
            <div className="p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 mt-0.5 mr-3 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">Emergency Warning</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    If you are experiencing a life-threatening emergency, please call 911 immediately or use the
                    emergency button below.
                  </p>
                  <Button className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                    <Phone className="w-4 h-4 mr-2" />
                    Call 911 Now
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Your Location</h3>
              <div className="flex items-start mb-4">
                <MapPin className="w-5 h-5 mt-1 mr-3 text-primary dark:text-primary/90" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Current Location</h4>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">123 Main Street, Anytown</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">GPS Coordinates: 37.7749° N, 122.4194° W</p>
                  <Button variant="link" className="p-0 h-auto text-primary dark:text-primary/90 text-sm">
                    Update Location
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Assistance Type */}
          <Card className="mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Type of Assistance Needed</h3>
              <RadioGroup defaultValue="medical-advice">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 border dark:border-gray-700/50 rounded-lg p-3">
                    <RadioGroupItem value="medical-advice" id="medical-advice" />
                    <Label htmlFor="medical-advice" className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Medical Advice</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">Speak with a medical professional for advice</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border dark:border-gray-700/50 rounded-lg p-3">
                    <RadioGroupItem value="minor-injury" id="minor-injury" />
                    <Label htmlFor="minor-injury" className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Minor Injury</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">First aid or minor medical attention needed</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border dark:border-amber-800/50 rounded-lg p-3 border-amber-200 dark:bg-amber-900/30 bg-amber-50">
                    <RadioGroupItem value="urgent-care" id="urgent-care" />
                    <Label htmlFor="urgent-care" className="flex-1">
                      <div className="font-medium text-amber-800 dark:text-amber-200">Urgent Care Needed</div>
                      <div className="text-sm text-amber-700 dark:text-amber-300">Non-life threatening but requires prompt attention</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3 border-red-200 bg-red-50">
                    <RadioGroupItem value="emergency" id="emergency" />
                    <Label htmlFor="emergency" className="flex-1">
                      <div className="font-medium text-red-800">Emergency</div>
                      <div className="text-sm text-red-700">Serious medical situation requiring immediate care</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </Card>

          {/* Symptoms/Description */}
          <Card className="mb-6">
            <div className="p-4">
              <h3 className="font-medium mb-3">Describe the Situation</h3>
              <Textarea
                placeholder="Please describe the medical situation or symptoms in detail..."
                className="mb-3"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mb-3">
                This information will be shared with medical professionals to provide appropriate assistance.
              </p>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <Info className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Be specific about symptoms, their duration, and any relevant medical history or allergies.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Assistance Options */}
          <h3 className="font-medium mb-3">Available Assistance Options</h3>
          <div className="grid gap-4 mb-6">
            <AssistanceCard
              icon={<Phone className="w-5 h-5 text-primary dark:text-primary/90" />}
              title="Telemedicine Consultation"
              description="Speak with a medical professional via video call"
              time="Available now • 5 min wait"
              buttonText="Start Consultation"
            />

            <AssistanceCard
              icon={<Ambulance className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              title="Mobile Medical Unit"
              description="Medical professional will come to your location"
              time="ETA: 30 minutes"
              buttonText="Request Unit"
            />

            <AssistanceCard
              icon={<Heart className="w-5 h-5 text-red-600 dark:text-red-400" />}
              title="Emergency Transport"
              description="Transport to nearest hospital or urgent care"
              time="ETA: 15 minutes"
              buttonText="Request Transport"
              emergency
            />
          </div>

          {/* Nearby Facilities */}
          <Card className="mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Nearby Medical Facilities</h3>

              <div className="space-y-3">
                <FacilityCard
                  name="City General Hospital"
                  type="Hospital"
                  distance="2.3 miles"
                  time="8 min drive"
                  open24h
                />

                <FacilityCard
                  name="Urgent Care Center"
                  type="Urgent Care"
                  distance="1.1 miles"
                  time="5 min drive"
                  hours="8:00 AM - 8:00 PM"
                />

                <FacilityCard
                  name="Community Medical Clinic"
                  type="Clinic"
                  distance="0.8 miles"
                  time="3 min drive"
                  hours="9:00 AM - 5:00 PM"
                />
              </div>

              <Button variant="outline" className="w-full mt-3 dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                <MapPin className="w-4 h-4 mr-2" />
                View All Nearby Facilities
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

function AssistanceCard({
  icon,
  title,
  description,
  time,
  buttonText,
  emergency = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  time: string
  buttonText: string
  emergency?: boolean
}) {
  return (
    <Card className={`overflow-hidden ${emergency ? "border-red-200 dark:border-red-800/50" : ""}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={`p-2 mr-3 rounded-full ${emergency ? "bg-red-100 dark:bg-red-900/30" : "bg-primary/10 dark:bg-primary/20"}`}>{icon}</div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">{description}</p>
            <div className="flex items-center mb-3">
              <Clock className="w-4 h-4 mr-1 text-muted-foreground dark:text-gray-400" />
              <span className="text-xs text-muted-foreground dark:text-gray-400">{time}</span>
            </div>
            <Button className={emergency ? "w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800" : "w-full"}>
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function FacilityCard({
  name,
  type,
  distance,
  time,
  hours,
  open24h = false,
}: {
  name: string
  type: string
  distance: string
  time: string
  hours?: string
  open24h?: boolean
}) {
  return (
    <div className="p-3 rounded-lg border dark:border-gray-700/50">
      <div className="flex items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white">{name}</h4>
          <div className="flex items-center mb-1">
            <span className="text-xs px-2 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded-full mr-2">{type}</span>
            <span className="text-xs text-muted-foreground dark:text-gray-400">{distance}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1 text-muted-foreground dark:text-gray-400" />
            <span className="text-xs text-muted-foreground dark:text-gray-400 mr-2">{time}</span>
            {open24h ? (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Open 24/7</span>
            ) : (
              <span className="text-xs text-muted-foreground dark:text-gray-400">{hours}</span>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" className="dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700/50">
          Directions
        </Button>
      </div>
    </div>
  )
}

