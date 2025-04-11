"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Stethoscope,
  Settings,
  Bell,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  MessageSquare,
  Heart,
  AlertTriangle,
  Ambulance,
  Activity,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export default function HospitalDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r">
        <div className="flex items-center h-16 px-6 border-b">
          <Stethoscope className="w-6 h-6 text-primary mr-2" />
          <h1 className="font-bold text-lg">Medical Portal</h1>
        </div>

        <div className="flex flex-col flex-1 p-4">
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Emergency Requests
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Completed Cases
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Ambulance className="mr-2 h-4 w-4" />
              Resources
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center">
            <Avatar className="h-9 w-9 mr-2">
              <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">Dr. Sarah Johnson</p>
              <p className="text-xs text-muted-foreground">Emergency Responder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <div className="md:hidden">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>

          <div className="flex items-center ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8 ml-2">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Medical Dashboard</h1>
              <p className="text-muted-foreground">Manage emergency medical assistance requests</p>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <Badge variant="outline" className="bg-green-100 text-green-800 mr-2">
                On Duty
              </Badge>
              <Button variant="outline">End Shift</Button>
            </div>
          </div>

          {/* Emergency Alert */}
          <Card className="mb-6 border-l-4 border-l-red-500 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100 mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-red-800">Emergency Alert</h3>
                  <p className="text-sm text-red-700">
                    Car accident reported at Highway 101, Mile 45. Multiple injuries reported.
                  </p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700">Respond Now</Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="Active Emergencies"
              value="3"
              icon={<AlertTriangle className="h-5 w-5" />}
              description="2 critical, 1 stable"
            />
            <StatsCard
              title="Response Time"
              value="8.5 min"
              icon={<Clock className="h-5 w-5" />}
              description="Average today"
            />
            <StatsCard
              title="Available Units"
              value="4"
              icon={<Ambulance className="h-5 w-5" />}
              description="2 ambulances, 2 paramedics"
            />
            <StatsCard
              title="Cases Today"
              value="12"
              icon={<Activity className="h-5 w-5" />}
              description="8 completed, 4 active"
            />
          </div>

          {/* Active Emergency */}
          <Card className="mb-6 border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Emergency</CardTitle>
                  <CardDescription>Currently assigned medical emergency</CardDescription>
                </div>
                <Badge className="bg-amber-100 text-amber-800">En Route</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Patient" />
                      <AvatarFallback>MB</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Michael Brown</h3>
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-red-100 text-red-800 mr-2">
                          Critical
                        </Badge>
                        <p className="text-sm text-muted-foreground">Chest Pain • Age 58</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm">789 Pine Road, Anytown</p>
                      <p className="text-xs text-muted-foreground">2.5 miles away • 6 min ETA</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex flex-col items-center">
                  <div className="text-center mb-2">
                    <p className="text-sm text-muted-foreground">Response Progress</p>
                    <div className="flex items-center justify-center">
                      <Ambulance className="h-4 w-4 mr-1 text-amber-500" />
                      <p className="text-sm font-medium">Dispatched 4 mins ago</p>
                    </div>
                  </div>

                  <div className="w-full max-w-[200px]">
                    <Progress value={35} className="h-2" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs">Dispatch</span>
                      <span className="text-xs">En Route</span>
                      <span className="text-xs">Arrived</span>
                    </div>
                  </div>

                  <Button className="mt-4">Update Status</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Requests */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Emergency Requests</CardTitle>
              <CardDescription>Pending medical assistance requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="critical">Critical</TabsTrigger>
                  <TabsTrigger value="stable">Stable</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <EmergencyCard
                    name="David Wilson"
                    issue="Car Accident"
                    details="Minor injuries, conscious"
                    location="202 Maple Drive, Anytown"
                    distance="4.7 miles"
                    time="5 mins ago"
                    severity="stable"
                  />
                  <EmergencyCard
                    name="Emily Davis"
                    issue="Allergic Reaction"
                    details="Difficulty breathing"
                    location="101 Elm Street, Anytown"
                    distance="3.2 miles"
                    time="8 mins ago"
                    severity="critical"
                  />
                  <EmergencyCard
                    name="Robert Johnson"
                    issue="Fall from Vehicle"
                    details="Head injury, conscious"
                    location="505 Cedar Lane, Anytown"
                    distance="6.1 miles"
                    time="12 mins ago"
                    severity="stable"
                  />
                </TabsContent>

                <TabsContent value="critical" className="space-y-4">
                  <EmergencyCard
                    name="Emily Davis"
                    issue="Allergic Reaction"
                    details="Difficulty breathing"
                    location="101 Elm Street, Anytown"
                    distance="3.2 miles"
                    time="8 mins ago"
                    severity="critical"
                  />
                </TabsContent>

                <TabsContent value="stable" className="space-y-4">
                  <EmergencyCard
                    name="David Wilson"
                    issue="Car Accident"
                    details="Minor injuries, conscious"
                    location="202 Maple Drive, Anytown"
                    distance="4.7 miles"
                    time="5 mins ago"
                    severity="stable"
                  />
                  <EmergencyCard
                    name="Robert Johnson"
                    issue="Fall from Vehicle"
                    details="Head injury, conscious"
                    location="505 Cedar Lane, Anytown"
                    distance="6.1 miles"
                    time="12 mins ago"
                    severity="stable"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Available Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Available Resources</CardTitle>
              <CardDescription>Medical units ready for dispatch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ResourceItem
                  type="Ambulance"
                  id="AMB-102"
                  status="available"
                  location="Central Station"
                  staff="2 paramedics"
                />
                <ResourceItem
                  type="Ambulance"
                  id="AMB-105"
                  status="available"
                  location="East Station"
                  staff="2 paramedics, 1 doctor"
                />
                <ResourceItem
                  type="Paramedic"
                  id="PARA-08"
                  status="available"
                  location="Mobile Unit"
                  staff="1 paramedic"
                />
                <ResourceItem
                  type="Paramedic"
                  id="PARA-12"
                  status="available"
                  location="Mobile Unit"
                  staff="1 paramedic"
                />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon,
  description,
}: {
  title: string
  value: string
  icon: React.ReactNode
  description: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="p-2 rounded-full bg-primary/10">
            <div className="text-primary">{icon}</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

function EmergencyCard({
  name,
  issue,
  details,
  location,
  distance,
  time,
  severity,
}: {
  name: string
  issue: string
  details: string
  location: string
  distance: string
  time: string
  severity: "critical" | "stable"
}) {
  const severityColors = {
    critical: "border-l-4 border-l-red-500",
    stable: "border-l-4 border-l-amber-500",
  }

  const severityBadges = {
    critical: "bg-red-100 text-red-800",
    stable: "bg-amber-100 text-amber-800",
  }

  return (
    <Card className={severityColors[severity]}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-start">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Patient" />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">{name}</h3>
                  <Badge variant="outline" className={`ml-2 ${severityBadges[severity]}`}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {issue} • {details}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm">{location}</p>
                <p className="text-xs text-muted-foreground">
                  {distance} away • Requested {time}
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button size="sm" variant="outline" className="flex items-center">
              <XCircle className="h-4 w-4 mr-1" />
              Decline
            </Button>
            <Button size="sm" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Respond
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResourceItem({
  type,
  id,
  status,
  location,
  staff,
}: {
  type: string
  id: string
  status: "available" | "en-route" | "busy"
  location: string
  staff: string
}) {
  const statusColors = {
    available: "bg-green-100 text-green-800",
    "en-route": "bg-blue-100 text-blue-800",
    busy: "bg-gray-100 text-gray-800",
  }

  const statusLabels = {
    available: "Available",
    "en-route": "En Route",
    busy: "Busy",
  }

  const icons = {
    Ambulance: <Ambulance className="h-5 w-5" />,
    Paramedic: <Heart className="h-5 w-5" />,
  }

  return (
    <div className="flex items-center p-3 border rounded-lg">
      <div className="p-2 rounded-full bg-primary/10 mr-3">{icons[type as keyof typeof icons]}</div>
      <div className="flex-1">
        <div className="flex items-center">
          <h4 className="font-medium">
            {type} {id}
          </h4>
          <Badge variant="outline" className={`ml-2 ${statusColors[status]}`}>
            {statusLabels[status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {location} • {staff}
        </p>
      </div>
      <Button size="sm">Dispatch</Button>
    </div>
  )
}

