import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Send, Mic, Car, MessageSquare, MapPin, Wrench, Image, ThumbsUp, ThumbsDown } from "lucide-react"

export default function ChatbotPage() {
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
          <h1 className="ml-4 text-xl font-bold">RoadGuard Assistant</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="container px-4 py-6 flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-white p-3 rounded-lg rounded-tl-none max-w-[80%] shadow-sm">
                <p className="text-sm">Hello! I'm your RoadGuard assistant. How can I help you today?</p>
              </div>
            </div>

            <div className="flex items-start justify-end">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none max-w-[80%] shadow-sm">
                <p className="text-sm">My car won't start. The engine is making a clicking sound.</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2">
                <div className="text-xs font-medium">You</div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-white p-3 rounded-lg rounded-tl-none max-w-[80%] shadow-sm">
                <p className="text-sm mb-2">
                  I'm sorry to hear that. A clicking sound when trying to start your car often indicates a battery
                  issue. Here are a few things to check:
                </p>
                <ul className="text-sm list-disc pl-5 mb-2 space-y-1">
                  <li>Make sure your headlights and interior lights are working</li>
                  <li>Check if the battery terminals are clean and properly connected</li>
                  <li>If possible, try to jump-start the vehicle</li>
                </ul>
                <p className="text-sm mb-3">Would you like me to help you find a nearby mechanic or towing service?</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <Car className="w-3 h-3 mr-1" />
                    Find Mechanic
                  </Button>
                  <Button size="sm" variant="outline">
                    <MapPin className="w-3 h-3 mr-1" />
                    Towing Service
                  </Button>
                  <Button size="sm" variant="outline">
                    <Wrench className="w-3 h-3 mr-1" />
                    DIY Guide
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-end">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none max-w-[80%] shadow-sm">
                <p className="text-sm">I'd like to see the DIY guide for checking my battery.</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2">
                <div className="text-xs font-medium">You</div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-white p-3 rounded-lg rounded-tl-none max-w-[80%] shadow-sm">
                <p className="text-sm mb-2">Here's a quick guide to check your battery:</p>
                <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 h-40 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <Image className="w-8 h-8 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Battery check guide image</p>
                  </div>
                </div>
                <ol className="text-sm list-decimal pl-5 mb-3 space-y-1">
                  <li>Make sure your car is turned off and the keys are removed</li>
                  <li>Open the hood and locate the battery</li>
                  <li>Check for corrosion on the terminals (white or greenish substance)</li>
                  <li>Ensure the connections are tight and not loose</li>
                  <li>If you have a voltmeter, check if the battery shows at least 12.6 volts</li>
                </ol>
                <p className="text-sm mb-3">
                  If you're still having issues, I recommend getting professional help. Would you like me to find a
                  mechanic near you?
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button size="sm">Find Mechanic</Button>
                    <Button size="sm" variant="outline">
                      More Help
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="sticky bottom-0 bg-gray-50 pt-2">
            <Card className="p-2 flex items-center">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Mic className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type your message..."
                className="flex-1 mx-2 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button size="icon" className="rounded-full">
                <Send className="h-5 w-5" />
              </Button>
            </Card>
            <p className="text-xs text-center text-muted-foreground mt-2 mb-1">
              Powered by AI • Your conversations help us improve
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

