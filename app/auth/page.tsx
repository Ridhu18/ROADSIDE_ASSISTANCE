import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Shield, Phone, Mail, ArrowRight } from "lucide-react"

export default function AuthPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">RoadGuard</h1>
            <p className="text-sm text-muted-foreground">Your roadside assistance companion</p>
          </div>

          {/* Auth Card */}
          <Card className="w-full">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Welcome back</h2>
                    <p className="text-sm text-muted-foreground">Login to access roadside assistance services</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </label>
                      <div className="flex">
                        <div className="flex items-center px-3 border rounded-l-md bg-muted">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Input id="phone" type="tel" placeholder="(555) 123-4567" className="rounded-l-none" />
                      </div>
                    </div>

                    <Button className="w-full">
                      Send OTP
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 bg-white text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Create an account</h2>
                    <p className="text-sm text-muted-foreground">Sign up to access roadside assistance services</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input id="name" placeholder="John Doe" />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <div className="flex">
                        <div className="flex items-center px-3 border rounded-l-md bg-muted">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Input id="email" type="email" placeholder="john@example.com" className="rounded-l-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="signup-phone" className="text-sm font-medium">
                        Phone Number
                      </label>
                      <div className="flex">
                        <div className="flex items-center px-3 border rounded-l-md bg-muted">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Input id="signup-phone" type="tel" placeholder="(555) 123-4567" className="rounded-l-none" />
                      </div>
                    </div>

                    <Button className="w-full">
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 bg-white text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

