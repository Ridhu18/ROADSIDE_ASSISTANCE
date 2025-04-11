"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Users,
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  Car,
  Droplet,
  Stethoscope,
  Shield,
} from "lucide-react"
import { Input } from "@/components/ui/input"

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r">
        <div className="flex items-center h-16 px-6 border-b">
          <Shield className="w-6 h-6 text-primary mr-2" />
          <h1 className="font-bold text-lg">RoadGuard Admin</h1>
        </div>

        <div className="flex flex-col flex-1 p-4">
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Car className="mr-2 h-4 w-4" />
              Mechanics
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Stethoscope className="mr-2 h-4 w-4" />
              Hospitals
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Droplet className="mr-2 h-4 w-4" />
              Petrol Pumps
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary mr-2"></div>
            <div>
              <p className="font-medium text-sm">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@roadguard.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <div className="md:hidden">
            <Shield className="w-6 h-6 text-primary" />
          </div>

          <div className="flex items-center ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary ml-2"></div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage all roadside assistance activities</p>
            </div>
            <Button className="mt-4 md:mt-0">Generate Report</Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard title="Total Users" value="2,345" change="+12%" icon={<Users className="h-5 w-5" />} />
            <StatsCard title="Active Requests" value="18" change="+5%" icon={<AlertTriangle className="h-5 w-5" />} />
            <StatsCard title="Completed Today" value="42" change="+8%" icon={<CheckCircle className="h-5 w-5" />} />
            <StatsCard
              title="Response Time"
              value="8.5 min"
              change="-2%"
              icon={<Clock className="h-5 w-5" />}
              changePositive={false}
            />
          </div>

          {/* Service Requests */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Requests</CardTitle>
                  <CardDescription>Manage all incoming service requests</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search requests..."
                      className="pl-8 w-[200px] md:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <RequestItem
                    id="REQ-7829"
                    user="John Smith"
                    service="Towing Service"
                    location="123 Main St, Anytown"
                    time="10 mins ago"
                    status="pending"
                    type="mechanic"
                  />
                  <RequestItem
                    id="REQ-7830"
                    user="Sarah Johnson"
                    service="Fuel Delivery"
                    location="456 Oak Ave, Somewhere"
                    time="15 mins ago"
                    status="active"
                    type="fuel"
                  />
                  <RequestItem
                    id="REQ-7825"
                    user="Michael Brown"
                    service="Medical Assistance"
                    location="789 Pine Rd, Elsewhere"
                    time="25 mins ago"
                    status="active"
                    type="medical"
                  />
                  <RequestItem
                    id="REQ-7820"
                    user="Emily Davis"
                    service="Flat Tire"
                    location="101 Elm St, Nowhere"
                    time="45 mins ago"
                    status="completed"
                    type="mechanic"
                  />
                  <RequestItem
                    id="REQ-7815"
                    user="David Wilson"
                    service="Battery Jump"
                    location="202 Maple Dr, Anywhere"
                    time="1 hour ago"
                    status="completed"
                    type="mechanic"
                  />
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                  <RequestItem
                    id="REQ-7829"
                    user="John Smith"
                    service="Towing Service"
                    location="123 Main St, Anytown"
                    time="10 mins ago"
                    status="pending"
                    type="mechanic"
                  />
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                  <RequestItem
                    id="REQ-7830"
                    user="Sarah Johnson"
                    service="Fuel Delivery"
                    location="456 Oak Ave, Somewhere"
                    time="15 mins ago"
                    status="active"
                    type="fuel"
                  />
                  <RequestItem
                    id="REQ-7825"
                    user="Michael Brown"
                    service="Medical Assistance"
                    location="789 Pine Rd, Elsewhere"
                    time="25 mins ago"
                    status="active"
                    type="medical"
                  />
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  <RequestItem
                    id="REQ-7820"
                    user="Emily Davis"
                    service="Flat Tire"
                    location="101 Elm St, Nowhere"
                    time="45 mins ago"
                    status="completed"
                    type="mechanic"
                  />
                  <RequestItem
                    id="REQ-7815"
                    user="David Wilson"
                    service="Battery Jump"
                    location="202 Maple Dr, Anywhere"
                    time="1 hour ago"
                    status="completed"
                    type="mechanic"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Service Provider Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Provider Performance</CardTitle>
                <CardDescription>Average response times by provider type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <PerformanceBar label="Mechanics" value={85} color="bg-blue-500" />
                  <PerformanceBar label="Fuel Delivery" value={92} color="bg-green-500" />
                  <PerformanceBar label="Medical" value={78} color="bg-red-500" />
                  <PerformanceBar label="Towing" value={88} color="bg-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Distribution</CardTitle>
                <CardDescription>Breakdown of service types requested</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <DistributionItem label="Mechanical Issues" value={42} color="bg-blue-500" />
                  <DistributionItem label="Fuel Delivery" value={18} color="bg-green-500" />
                  <DistributionItem label="Medical Assistance" value={12} color="bg-red-500" />
                  <DistributionItem label="Towing Services" value={28} color="bg-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  change,
  icon,
  changePositive = true,
}: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  changePositive?: boolean
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
        <div className="mt-4">
          <span className={`text-xs font-medium ${changePositive ? "text-green-600" : "text-red-600"}`}>{change}</span>
          <span className="text-xs text-muted-foreground ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

function RequestItem({
  id,
  user,
  service,
  location,
  time,
  status,
  type,
}: {
  id: string
  user: string
  service: string
  location: string
  time: string
  status: "pending" | "active" | "completed"
  type: "mechanic" | "fuel" | "medical"
}) {
  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    active: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  }

  const typeIcons = {
    mechanic: <Car className="h-4 w-4" />,
    fuel: <Droplet className="h-4 w-4" />,
    medical: <Stethoscope className="h-4 w-4" />,
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-primary/10 mr-4">{typeIcons[type]}</div>
        <div>
          <div className="flex items-center">
            <p className="font-medium">{id}</p>
            <Badge variant="outline" className={`ml-2 ${statusColors[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm">
            {user} • {service}
          </p>
          <p className="text-xs text-muted-foreground">
            {location} • {time}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <Button variant="outline" size="sm" className="mr-2">
          Details
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function PerformanceBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}

function DistributionItem({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
      <span className="text-sm flex-1">{label}</span>
      <span className="text-sm font-medium">{value}%</span>
    </div>
  )
}

