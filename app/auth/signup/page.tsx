"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "../../contexts/DarkModeContext";

const carCompanies = {
  "Maruti Suzuki": ["Swift", "Baleno", "Dzire", "Vitara Brezza", "Ertiga"],
  "Hyundai": ["i20", "Verna", "Creta", "Venue", "Tucson"],
  "Tata": ["Nexon", "Punch", "Harrier", "Safari", "Altroz"],
  "Honda": ["City", "Amaze", "Jazz", "WR-V", "CR-V"],
  "Toyota": ["Fortuner", "Innova", "Glanza", "Urban Cruiser", "Camry"],
  "Mahindra": ["Thar", "Scorpio", "XUV700", "Bolero", "XUV300"],
  "Kia": ["Seltos", "Sonet", "Carens", "EV6", "Carnival"],
  "Renault": ["Duster", "Kwid", "Triber", "Kiger", "Captur"],
  "Nissan": ["Magnite", "Kicks", "GT-R", "Sunny", "Terrano"],
  "MG": ["Hector", "Astor", "Gloster", "ZS EV", "Comet"],
};

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, "Invalid mobile number"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["user", "mechanic", "petrolpump", "hospital"]),
  carCompany: z.string().optional(),
  carModel: z.string().optional(),
  carYear: z.string().optional(),
  carColor: z.string().optional(),
  licensePlate: z.string().optional(),
});

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { darkMode } = useDarkMode();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mobileNumber: "",
      email: "",
      role: "user",
      carCompany: "",
      carModel: "",
      carYear: "",
      carColor: "",
      licensePlate: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          mobileNumber: values.mobileNumber,
          email: values.email,
          role: values.role,
          vehicles: values.role === "user" && values.carCompany && values.carModel ? [{
            make: values.carCompany,
            model: values.carModel,
            year: values.carYear || new Date().getFullYear().toString(),
            color: values.carColor || "Not specified",
            licensePlate: values.licensePlate || "Not specified",
            isPrimary: true
          }] : []
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // If we have detailed validation errors
          const errorMessages = Object.entries(data.details)
            .filter(([_, message]) => message !== undefined)
            .map(([field, message]) => `${message}`)
            .join(", ");
          throw new Error(errorMessages || data.error || "Failed to create account");
        }
        throw new Error(data.error || "Failed to create account");
      }

      toast({
        title: "Success",
        description: "Account created successfully! Please sign in.",
      });

      router.push("/auth/signin");
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = form.watch("role");
  const selectedCompany = form.watch("carCompany");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b shadow-sm dark:border-gray-700">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold dark:text-white">RoadGuard</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center dark:text-white">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Mobile Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your mobile number" 
                          {...field}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email" 
                          type="email" 
                          {...field}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="mechanic">Mechanic</SelectItem>
                          <SelectItem value="petrolpump">Petrol Pump</SelectItem>
                          <SelectItem value="hospital">Hospital</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedRole === "user" && (
                  <>
                    <FormField
                      control={form.control}
                      name="carCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-300">Car Company</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                <SelectValue placeholder="Select car company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                              {Object.keys(carCompanies).map((company) => (
                                <SelectItem key={company} value={company}>
                                  {company}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedCompany && (
                      <>
                        <FormField
                          control={form.control}
                          name="carModel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-300">Car Model</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                    <SelectValue placeholder="Select car model" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                  {carCompanies[selectedCompany as keyof typeof carCompanies].map((model) => (
                                    <SelectItem key={model} value={model}>
                                      {model}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="carYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-300">Car Year</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter car year"
                                  min="1900"
                                  max={new Date().getFullYear()}
                                  {...field}
                                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="carColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-300">Car Color</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter car color" 
                                  {...field}
                                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="licensePlate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-300">License Plate</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter license plate number" 
                                  {...field}
                                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 