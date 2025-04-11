"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Droplet,
  BarChart,
  Calendar,
  CheckCircle,
  Truck,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Upload,
  Image as ImageIcon,
  Power,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  petrolPumpName?: string;
  onSettingsClick: () => void;
  onProfilePhotoClick?: () => void;
  onHeaderSettingsClick?: () => void;
  isActive?: boolean;
  onToggleActive?: (isActive: boolean) => void;
  isUpdatingStatus?: boolean;
}

const sidebarItems = [
  {
    title: "Dashboard",
    icon: BarChart,
    href: "/dashboard/petrol-pump",
  },
  {
    title: "Fuel Requests",
    icon: Droplet,
    href: "/dashboard/petrol-pump/requests",
  },
  {
    title: "Schedule",
    icon: Calendar,
    href: "/dashboard/petrol-pump/schedule",
  },
  {
    title: "Completed Deliveries",
    icon: CheckCircle,
    href: "/dashboard/petrol-pump/completed",
  },
  {
    title: "Inventory",
    icon: Truck,
    href: "/dashboard/petrol-pump/inventory",
  },
];

export function Sidebar({ 
  petrolPumpName = "Loading...", 
  onSettingsClick,
  onProfilePhotoClick,
  onHeaderSettingsClick,
  isActive = false,
  onToggleActive,
  isUpdatingStatus = false
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/auth/signin');
  };

  const handleToggleActive = () => {
    if (onToggleActive && !isUpdatingStatus) {
      onToggleActive(!isActive);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center h-16 px-6 border-b">
        <Droplet className="w-6 h-6 text-primary mr-2" />
        <h1 className="font-bold text-lg">Fuel Delivery Portal</h1>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", {
                  "bg-accent": pathname === item.href,
                })}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                General Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onProfilePhotoClick}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Profile Photo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onHeaderSettingsClick}>
                <Upload className="mr-2 h-4 w-4" />
                Header Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </nav>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                <Avatar className="h-9 w-9 mr-2">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
                  <AvatarFallback>PP</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onProfilePhotoClick}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Change Profile Photo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div>
            <p className="font-medium text-sm">{petrolPumpName}</p>
            <p className="text-xs text-muted-foreground">Fuel Station</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <Power className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={isActive ? "default" : "secondary"} 
              className={`text-xs ${isUpdatingStatus ? 'opacity-50' : ''}`}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
            <Switch 
              checked={isActive} 
              onCheckedChange={handleToggleActive}
              disabled={isUpdatingStatus}
              aria-label="Toggle active status"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r">
        <SidebarContent />
      </div>
    </>
  );
} 