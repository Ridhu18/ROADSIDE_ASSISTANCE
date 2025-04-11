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
  Wrench,
  BarChart,
  Calendar,
  CheckCircle,
  Car,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Upload,
  Image as ImageIcon,
  Power,
  LayoutDashboard,
  Package,
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
import { useToast } from "@/components/ui/use-toast";

interface SidebarProps {
  mechanicName?: string;
  onSettingsClick: () => void;
  onProfilePhotoClick?: () => void;
  onHeaderSettingsClick?: () => void;
  isActive?: boolean;
  onToggleActive?: (isActive: boolean) => void;
  isUpdatingStatus?: boolean;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard/mechanics",
    icon: LayoutDashboard,
  },
  {
    title: "Service Requests",
    href: "/dashboard/mechanics/requests",
    icon: Wrench,
  },
  {
    title: "Schedule",
    href: "/dashboard/mechanics/schedule",
    icon: Calendar,
  },
  {
    title: "Completed Services",
    href: "/dashboard/mechanics/completed",
    icon: CheckCircle,
  },
  {
    title: "Inventory",
    href: "/dashboard/mechanics/inventory",
    icon: Package,
  },
];

export function Sidebar({ 
  mechanicName = "Loading...", 
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
  const { toast } = useToast();

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
        <LayoutDashboard className="w-6 h-6 text-primary mr-2" />
        <h1 className="font-bold text-lg">Mechanic Portal</h1>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent" : "transparent"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
          
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
                  <AvatarFallback>MC</AvatarFallback>
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
            <p className="font-medium text-sm">{mechanicName}</p>
            <p className="text-xs text-muted-foreground">Mechanic</p>
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
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
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