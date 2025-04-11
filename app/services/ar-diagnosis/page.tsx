"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Camera, Info, Lightbulb, MessageSquare, Stethoscope, CheckCircle, ChevronRight, Phone, Video, Car, Wrench, Flashlight, FlashlightOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import { analyzeVehicleImage, DiagnosisResult } from '../../lib/gemini';

interface CommonIssue {
  title: string;
  description: string;
  completed: boolean;
  steps: string[];
}

export default function ARDiagnosisPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [commonIssues, setCommonIssues] = useState<CommonIssue[]>([
    {
      title: "Flat Tire",
      description: "Learn how to change a flat tire safely",
      completed: false,
      steps: [
        "Find a safe location to pull over",
        "Apply parking brake and turn on hazard lights",
        "Remove wheel cover and loosen lug nuts",
        "Jack up the vehicle and remove the tire",
        "Install spare tire and tighten lug nuts",
        "Lower the vehicle and fully tighten lug nuts"
      ]
    },
    {
      title: "Dead Battery",
      description: "Diagnose battery issues and jump-start procedures",
      completed: false,
      steps: [
        "Check battery terminals for corrosion",
        "Test battery voltage with multimeter",
        "Connect jumper cables properly",
        "Start the donor vehicle",
        "Attempt to start your vehicle",
        "Let the engine run to charge battery"
      ]
    },
    {
      title: "Engine Overheating",
      description: "Identify cooling system problems and safe solutions",
      completed: false,
      steps: [
        "Turn off air conditioning",
        "Turn on heater to maximum",
        "Pull over safely and turn off engine",
        "Check coolant level when cool",
        "Inspect for leaks",
        "Add coolant if necessary"
      ]
    },
    {
      title: "Check Engine Light",
      description: "Scan and interpret diagnostic trouble codes",
      completed: false,
      steps: [
        "Connect OBD-II scanner",
        "Read trouble codes",
        "Interpret code meanings",
        "Check related components",
        "Clear codes after repair",
        "Verify light stays off"
      ]
    }
  ]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      // Ensure video element exists
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      // Stop any existing streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        },
        audio: false
      });

      console.log('Camera access granted');
      streamRef.current = stream;
      
      // Set video source and play
      videoRef.current.srcObject = stream;
      videoRef.current.style.transform = 'scaleX(-1)';
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve(true);
        }
      });

      await videoRef.current.play();
      console.log('Video playing');
      setIsCameraActive(true);
      toast({
        title: "Camera Active",
        description: "Camera preview is now showing",
      });

    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: error instanceof Error 
          ? error.message 
          : "Could not start camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const toggleFlashlight = () => {
    setIsFlashlightOn(!isFlashlightOn);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Error",
        description: "Camera is not ready",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // Get base64 image data
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);

      // Analyze with Gemini
      const result = await analyzeVehicleImage(imageBase64);
      setDiagnosisResult(result);

      toast({
        title: "Analysis Complete",
        description: "Vehicle diagnosis ready",
      });

    } catch (error) {
      console.error('Error capturing image:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRequestService = () => {
    router.push("/emergency");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800/95 border-b dark:border-gray-700/50 shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">AR Diagnosis</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6">
          {/* AR Camera View */}
          <Card className="overflow-hidden mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="relative aspect-[4/3] bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {!isCameraActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <Camera className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm opacity-70">Camera preview will appear here</p>
                  <Button 
                    className="mt-4" 
                    onClick={startCamera}
                  >
                    Start Camera
                  </Button>
                </div>
              ) : (
                <>
                  {/* Camera Controls */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-black/50 text-white hover:bg-black/70 dark:bg-black/70 dark:hover:bg-black/80"
                      onClick={stopCamera}
                    >
                      Stop Camera
                    </Button>
                  </div>

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <Button 
                      className="rounded-full w-16 h-16 flex items-center justify-center dark:bg-gray-800/95 dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                      onClick={captureImage}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8" />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-gray-800/95">
              <div className="flex items-center mb-2">
                <Stethoscope className="w-5 h-5 mr-2 text-primary dark:text-primary/90" />
                <h3 className="font-medium text-gray-900 dark:text-white">Point camera at your vehicle issue</h3>
              </div>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                Our AI will analyze the image and provide diagnostic information and repair guidance.
              </p>
            </div>
          </Card>

          {/* Diagnosis Instructions */}
          <Card className="mb-6 dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="mb-3 font-medium text-gray-900 dark:text-white">How to use AR Diagnosis</h3>

              <div className="space-y-3">
                <InstructionStep
                  number={1}
                  title="Point your camera"
                  description="Aim your camera at the problematic area of your vehicle"
                />
                <InstructionStep
                  number={2}
                  title="Follow AR guides"
                  description="The app will overlay diagnostic information on your screen"
                />
                <InstructionStep
                  number={3}
                  title="Get repair instructions"
                  description="Follow step-by-step guidance for simple repairs"
                />
              </div>
            </div>
          </Card>

          {/* Common Issues */}
          <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Common Issues</h3>
          <div className="grid grid-cols-1 gap-3 mb-6">
            {commonIssues.map((issue, index) => (
              <IssueCard 
                key={index}
                title={issue.title}
                description={issue.description}
                completed={issue.completed}
                steps={issue.steps}
                onComplete={() => {
                  const updatedIssues = [...commonIssues];
                  updatedIssues[index].completed = !updatedIssues[index].completed;
                  setCommonIssues(updatedIssues);
                }}
              />
            ))}
          </div>

          {/* Expert Help */}
          <Card className="dark:bg-gray-800/95 dark:border-gray-700/50">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Need Expert Help?</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="p-2 mr-3 rounded-full bg-primary/10 dark:bg-primary/20">
                    <Phone className="w-5 h-5 text-primary dark:text-primary/90" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Call a Mechanic</h4>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Speak with a professional for guidance</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 mr-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Video className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Video Consultation</h4>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Get visual guidance from an expert</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 mr-3 rounded-full bg-red-100 dark:bg-red-900/30">
                    <Car className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Request Service</h4>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Get a mechanic to your location</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={handleRequestService}
                    >
                      Request Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Diagnosis Results */}
          {diagnosisResult && (
            <Card className="mt-6 dark:bg-gray-800/95 dark:border-gray-700/50">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <Stethoscope className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="font-medium text-lg">Diagnosis Results</h3>
                </div>

                <div className="space-y-4">
                  {/* Issue and Confidence */}
                  <div>
                    <h4 className="font-medium mb-2">Detected Issue</h4>
                    <p className="text-sm text-muted-foreground">
                      {diagnosisResult.issue}
                      <span className="ml-2 text-xs">
                        (Confidence: {Math.round(diagnosisResult.confidence * 100)}%)
                      </span>
                    </p>
                  </div>

                  {/* Repair Steps */}
                  <div>
                    <h4 className="font-medium mb-2">Repair Instructions</h4>
                    <ul className="text-sm space-y-2">
                      {diagnosisResult.repairs.steps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Tools */}
                  <div>
                    <h4 className="font-medium mb-2">Required Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {diagnosisResult.repairs.requiredTools.map((tool: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Warnings */}
                  {diagnosisResult.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-500">Safety Warnings</h4>
                      <ul className="text-sm space-y-2">
                        {diagnosisResult.warnings.map((warning: string, index: number) => (
                          <li key={index} className="flex items-start text-red-500">
                            <span className="mr-2">⚠️</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Professional Advice */}
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium mb-1">Professional Recommendation</h4>
                    <p className="text-sm">{diagnosisResult.repairs.professionalAdvice}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Diagnosis Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Diagnosis Result</DialogTitle>
            <DialogDescription>
              {diagnosisResult?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Issue: {diagnosisResult?.issue}</h4>
              <div className="flex items-center gap-2">
                <Progress value={diagnosisResult?.confidence} className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  {diagnosisResult?.confidence}% confidence
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Severity: {diagnosisResult?.severity}</h4>
              {diagnosisResult?.estimatedCost && (
                <p className="text-sm text-muted-foreground">
                  Estimated Cost: {diagnosisResult.estimatedCost}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Recommended Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {diagnosisResult?.steps?.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResultDialog(false)}>
              Close
            </Button>
            <Button onClick={handleRequestService}>
              Request Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      <div className="fixed bottom-4 right-4">
        <Button 
          className="w-12 h-12 rounded-full shadow-lg" 
          size="icon"
          onClick={() => router.push("/chat")}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}

function InstructionStep({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="flex items-start">
      <div className="flex items-center justify-center w-8 h-8 mr-3 text-white rounded-full bg-primary dark:bg-primary/90">{number}</div>
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-muted-foreground dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}

function IssueCard({
  title,
  description,
  completed = false,
  steps,
  onComplete,
}: {
  title: string;
  description: string;
  completed?: boolean;
  steps: string[];
  onComplete: () => void;
}) {
  const [showAllSteps, setShowAllSteps] = useState(false);

  return (
    <Card className="overflow-hidden dark:bg-gray-800/95 dark:border-gray-700/50">
      <div className="p-4">
        <div className="flex items-start">
          <div 
            className={`p-2 mr-3 rounded-full cursor-pointer ${
              completed ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-700/50"
            }`}
            onClick={onComplete}
          >
            {completed ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
                <p className="text-sm text-muted-foreground dark:text-gray-400">{description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary dark:text-primary/90"
                onClick={() => setShowAllSteps(!showAllSteps)}
              >
                {showAllSteps ? "Show Less" : "Show More"}
              </Button>
            </div>
            <div className="mt-2">
              <ol className="list-decimal list-inside text-xs text-muted-foreground">
                {(showAllSteps ? steps : steps.slice(0, 2)).map((step, index) => (
                  <li key={index} className="mb-1">{step}</li>
                ))}
                {!showAllSteps && steps.length > 2 && (
                  <li className="text-primary dark:text-primary/90 cursor-pointer">
                    +{steps.length - 2} more steps
                  </li>
                )}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

