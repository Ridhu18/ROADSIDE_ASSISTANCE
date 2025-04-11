"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, User, Mail, Phone, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDarkMode } from "../../contexts/DarkModeContext";

interface UserData {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  role: string;
  profilePhoto?: string;
}

const formSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 characters"),
});

export default function PersonalInfoPage() {
  const { darkMode } = useDarkMode();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    email: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
        setFormData({
          name: user.name || "",
          mobileNumber: user.mobileNumber || "",
          email: user.email || "",
        });
        if (user.profilePhoto) {
          // Only add the base URL if it's not already a complete URL
          const photoUrl = user.profilePhoto.startsWith('http') 
            ? user.profilePhoto 
            : `http://localhost:5000${user.profilePhoto}`;
          setProfilePhoto(photoUrl);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/auth/signin");
      }
    } else {
      router.push("/auth/signin");
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Only send fields that have changed
      const updateData: any = {};
      
      if (formData.name !== userData?.name) {
        updateData.name = formData.name;
      }
      if (formData.email !== userData?.email) {
        updateData.email = formData.email;
      }
      if (formData.mobileNumber !== userData?.mobileNumber) {
        updateData.mobileNumber = formData.mobileNumber;
      }

      // If no changes, return early
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/update-info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            title: "Error",
            description: "Session expired. Please sign in again.",
            variant: "destructive",
          });
          router.push("/auth/signin");
          return;
        }
        throw new Error(data.error || "Failed to update information");
      }

      // Update user data with new information
      const updatedUser = {
        ...userData,
        ...updateData,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("token", data.token); // Update token
      setUserData(updatedUser);
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    // Create a temporary URL for preview
    setProfilePhoto(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append('profilePhoto', selectedFile);

      console.log("Uploading file:", selectedFile.name);
      const response = await fetch("http://localhost:5000/api/auth/upload-photo", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Upload response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload profile photo");
      }

      // Update user data with new profile photo
      const updatedUser = {
        ...userData,
        profilePhoto: data.user.profilePhoto,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("token", data.token); // Update token
      setUserData(updatedUser);
      setProfilePhoto(`http://localhost:5000${data.user.profilePhoto}`);
      setSelectedFile(null); // Clear the selected file after successful upload

      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload profile photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Update user data to remove profile photo
      const updatedUser = {
        ...userData,
        profilePhoto: null,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setProfilePhoto(null);

      toast({
        title: "Success",
        description: "Profile photo removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove profile photo",
        variant: "destructive",
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b shadow-sm dark:border-gray-700">
        <div className="container flex items-center h-16 px-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold dark:text-white">Personal Information</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center overflow-hidden">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary dark:text-primary/90" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    {selectedFile && (
                      <Button
                        type="button"
                        variant="default"
                        size="icon"
                        className="rounded-full"
                        onClick={handlePhotoUpload}
                        disabled={isUploading}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    )}
                    {profilePhoto && !selectedFile && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="rounded-full"
                        onClick={handleRemovePhoto}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold dark:text-white">Profile Picture</h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    {isUploading ? "Uploading..." : "Click to upload a new profile picture"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="dark:text-gray-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="dark:text-gray-300">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: userData?.name || "",
                          mobileNumber: userData?.mobileNumber || "",
                          email: userData?.email || "",
                        });
                      }}
                      className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSaving}
                      className="dark:bg-primary dark:hover:bg-primary/90"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="button" 
                    onClick={() => setIsEditing(true)}
                    className="dark:bg-primary dark:hover:bg-primary/90"
                  >
                    Edit Information
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
} 