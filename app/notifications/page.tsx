import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { ArrowLeft, Car, Wrench, Clock, CheckCircle, AlertTriangle, MessageSquare, Star } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold">Notifications</h1>
          <div className="ml-auto">
            <Button variant="ghost" size="sm">
              Mark All Read
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* Notification Settings */}
          <Card className="mb-6">
            <div className="p-4">
              <h3 className="font-medium mb-3">Notification Settings</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive alerts via text message</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Notifications */}
          <h3 className="font-medium mb-3">Recent Notifications</h3>
          <div className="space-y-3 mb-6">
            <NotificationCard
              icon={<Car className="w-5 h-5 text-primary" />}
              title="Mechanic is on the way"
              description="John's Auto Repair will arrive in approximately 10 minutes."
              time="5 minutes ago"
              unread
            />

            <NotificationCard
              icon={<Wrench className="w-5 h-5 text-amber-600" />}
              title="Service Request Confirmed"
              description="Your request for engine diagnostics has been confirmed."
              time="30 minutes ago"
            />

            <NotificationCard
              icon={<Clock className="w-5 h-5 text-green-600" />}
              title="Appointment Reminder"
              description="Your scheduled maintenance is tomorrow at 10:00 AM."
              time="2 hours ago"
            />

            <NotificationCard
              icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
              title="Service Completed"
              description="Your recent towing service has been completed. Please rate your experience."
              time="Yesterday"
              actionButton={
                <Button size="sm" variant="outline">
                  <Star className="w-3 h-3 mr-1" />
                  Rate
                </Button>
              }
            />

            <NotificationCard
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              title="Emergency Alert"
              description="There is a severe weather warning in your area. Please take necessary precautions."
              time="2 days ago"
            />

            <NotificationCard
              icon={<MessageSquare className="w-5 h-5 text-purple-600" />}
              title="New Message"
              description="You have a new message from support regarding your recent inquiry."
              time="3 days ago"
              actionButton={
                <Button size="sm" variant="outline">
                  View
                </Button>
              }
            />
          </div>

          {/* Load More */}
          <Button variant="outline" className="w-full">
            Load More
          </Button>
        </div>
      </main>
    </div>
  )
}

function NotificationCard({
  icon,
  title,
  description,
  time,
  unread = false,
  actionButton,
}: {
  icon: React.ReactNode
  title: string
  description: string
  time: string
  unread?: boolean
  actionButton?: React.ReactNode
}) {
  return (
    <Card className={`overflow-hidden ${unread ? "border-primary bg-primary/5" : ""}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={`p-2 mr-3 rounded-full ${unread ? "bg-primary/10" : "bg-gray-100"}`}>{icon}</div>
          <div className="flex-1">
            <div className="flex items-center">
              <h4 className="font-medium">{title}</h4>
              {unread && <span className="ml-2 w-2 h-2 rounded-full bg-primary"></span>}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{time}</span>
              {actionButton}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

