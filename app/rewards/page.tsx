import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FooterNav } from "@/components/shared/footer-nav"
import Link from "next/link"
import { ArrowLeft, Award, Gift, Star, Clock, Ticket, Percent, Shield } from "lucide-react"

export default function RewardsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800/95 border-b shadow-sm dark:border-gray-700/50">
        <div className="container flex items-center h-16 px-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">Rewards & Loyalty</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* Rewards Status */}
          <Card className="mb-6 overflow-hidden dark:bg-gray-800/90 dark:border-gray-700/50">
            <div className="p-6 text-white bg-gradient-to-r from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/60">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 rounded-full bg-white/20 dark:bg-white/10">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Silver Member</h2>
                  <p className="text-sm text-white/90 dark:text-white/80">Since January 2023</p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/90">350 points</span>
                  <span className="text-sm text-white/90">Gold (1000 points)</span>
                </div>
                <Progress value={35} className="h-2 bg-white/20 dark:bg-white/10" />
              </div>

              <p className="text-sm text-white/80 dark:text-white/70">Earn 650 more points to reach Gold status</p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800/90">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Available Points</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">350</p>
                </div>
                <Button className="dark:bg-primary/90 dark:text-white dark:hover:bg-primary/80">Redeem Points</Button>
              </div>
            </div>
          </Card>

          {/* Rewards Tabs */}
          <Tabs defaultValue="rewards" className="mb-6">
            <TabsList className="w-full dark:bg-gray-800/90 border dark:border-gray-700/50">
              <TabsTrigger value="rewards" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                Rewards
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                History
              </TabsTrigger>
              <TabsTrigger value="tiers" className="flex-1 dark:data-[state=active]:bg-gray-700/90 dark:text-gray-300 dark:data-[state=active]:text-white">
                Tiers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rewards" className="mt-4">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Available Rewards</h3>

                <RewardCard
                  icon={<Percent />}
                  title="15% Off Next Service"
                  description="Get 15% off your next roadside assistance service"
                  points={200}
                />

                <RewardCard
                  icon={<Gift />}
                  title="Free Tire Inspection"
                  description="Complimentary tire inspection at partner locations"
                  points={150}
                />

                <RewardCard
                  icon={<Ticket />}
                  title="Priority Service"
                  description="Skip the queue for your next service request"
                  points={300}
                />

                <RewardCard
                  icon={<Shield />}
                  title="Extended Coverage"
                  description="Add an extra 10 miles to your towing coverage"
                  points={400}
                  disabled
                />
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Points History</h3>

                <HistoryItem title="Emergency Towing Service" date="May 15, 2023" points="+100" isEarned />

                <HistoryItem title="Redeemed: 10% Discount" date="April 22, 2023" points="-150" isEarned={false} />

                <HistoryItem title="Flat Tire Assistance" date="March 10, 2023" points="+75" isEarned />

                <HistoryItem title="Referral Bonus: John Smith" date="February 5, 2023" points="+200" isEarned />
              </div>
            </TabsContent>

            <TabsContent value="tiers">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Membership Tiers</h3>

                <TierCard
                  title="Bronze"
                  points="0 - 499 points"
                  benefits={["Basic roadside assistance", "Standard response times", "Access to partner discounts"]}
                  current={false}
                />

                <TierCard
                  title="Silver"
                  points="500 - 999 points"
                  benefits={[
                    "All Bronze benefits",
                    "10% discount on services",
                    "Faster response times",
                    "Quarterly bonus points",
                  ]}
                  current={true}
                />

                <TierCard
                  title="Gold"
                  points="1000+ points"
                  benefits={[
                    "All Silver benefits",
                    "20% discount on services",
                    "Priority emergency response",
                    "Free annual vehicle check-up",
                    "Exclusive partner offers",
                  ]}
                  current={false}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* How to Earn */}
          <Card className="mb-6 dark:bg-gray-800/90 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="mb-3 font-medium text-gray-900 dark:text-white">How to Earn Points</h3>

              <div className="space-y-3">
                <EarnMethod
                  icon={<Star />}
                  title="Use Our Services"
                  description="Earn points every time you use roadside assistance"
                  points="+50-100 points"
                />

                <EarnMethod
                  icon={<Gift />}
                  title="Refer Friends"
                  description="Get points when friends sign up with your code"
                  points="+200 points"
                />

                <EarnMethod
                  icon={<Clock />}
                  title="Annual Renewal"
                  description="Renew your membership annually"
                  points="+150 points"
                />
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <FooterNav />
    </div>
  )
}

function RewardCard({
  icon,
  title,
  description,
  points,
  disabled = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  points: number
  disabled?: boolean
}) {
  return (
    <Card className={`overflow-hidden ${disabled ? "opacity-60" : ""} dark:bg-gray-800/90 dark:border-gray-700/50`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="p-2 mr-3 rounded-full bg-primary/10 dark:bg-primary/20">
            <div className="text-primary dark:text-primary/90">{icon}</div>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current" />
                <span className="ml-1 font-medium text-gray-900 dark:text-white">{points} points</span>
              </div>
              <Button 
                size="sm" 
                disabled={disabled}
                className="dark:bg-primary/90 dark:text-white dark:hover:bg-primary/80 dark:disabled:bg-gray-700"
              >
                {disabled ? "Not Enough Points" : "Redeem"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function HistoryItem({
  title,
  date,
  points,
  isEarned,
}: {
  title: string
  date: string
  points: string
  isEarned: boolean
}) {
  return (
    <Card className="overflow-hidden dark:bg-gray-800">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium dark:text-white">{title}</h4>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
          <span className={`font-bold ${isEarned ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{points}</span>
        </div>
      </div>
    </Card>
  )
}

function TierCard({
  title,
  points,
  benefits,
  current = false,
}: {
  title: string
  points: string
  benefits: string[]
  current?: boolean
}) {
  return (
    <Card className={`overflow-hidden ${current ? "border-primary" : ""} dark:bg-gray-800`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-medium dark:text-white">{title}</h4>
          {current && (
            <span className="px-2 py-1 text-xs font-medium text-white rounded-full bg-primary">Current Tier</span>
          )}
        </div>
        <p className="mb-3 text-sm text-muted-foreground">{points}</p>

        <h5 className="mb-2 text-sm font-medium dark:text-white">Benefits:</h5>
        <ul className="pl-5 mb-2 space-y-1 text-sm list-disc dark:text-gray-300">
          {benefits.map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

function EarnMethod({
  icon,
  title,
  description,
  points,
}: {
  icon: React.ReactNode
  title: string
  description: string
  points: string
}) {
  return (
    <div className="flex items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
      <div className="p-2 mr-3 rounded-full bg-primary/10 dark:bg-primary/20">
        <div className="text-primary dark:text-primary/90">{icon}</div>
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="text-sm font-medium text-primary dark:text-primary/90">{points}</div>
    </div>
  )
}

