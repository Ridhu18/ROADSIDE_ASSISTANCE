"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { useDarkMode } from "../../contexts/DarkModeContext";

const formSchema = z.object({
  mobileNumber: z.string().regex(/^[0-9]{10}$/, "Invalid mobile number"),
  otp: z.string().optional(),
});

export default function SignInPage() {
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [previousMobileNumber, setPreviousMobileNumber] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const { darkMode } = useDarkMode();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobileNumber: "",
      otp: "",
    },
  });

  // Watch for mobile number changes
  const mobileNumber = form.watch("mobileNumber");

  // Reset OTP state when mobile number changes
  useEffect(() => {
    if (mobileNumber !== previousMobileNumber) {
      setPreviousMobileNumber(mobileNumber);
      setOtp("");
      setShowOtpInput(false);
      setIsVerifying(false);
      form.setValue("otp", "");
    }
  }, [mobileNumber, previousMobileNumber, form]);

  const sendOTP = async (mobileNumber: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobileNumber
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setShowOtpInput(true);
      toast({
        title: "OTP Sent",
        description: "Please check your mobile number for OTP",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (mobileNumber: string, otp: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobileNumber,
          otp
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      // Redirect based on user role
      switch (data.user.role) {
        case "mechanic":
          router.push("/dashboard/mechanics");
          break;
        case "petrolpump":
          router.push("/dashboard/petrol-pump");
          break;
        case "hospital":
          router.push("/dashboard/hospital");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await sendOTP(values.mobileNumber);
  };

  const handleVerifyOTP = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!mobileNumber || !otp) return;
    await verifyOTP(mobileNumber, otp);
  };

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
            <CardTitle className="text-2xl font-bold text-center dark:text-white">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            disabled={isLoading || isVerifying}
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!showOtpInput && (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  )}
                </form>
              </Form>

              {showOtpInput && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">OTP</Label>
                    <Input
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      disabled={isVerifying}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    disabled={isVerifying || !otp}
                    onClick={handleVerifyOTP}
                  >
                    {isVerifying ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              )}

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 