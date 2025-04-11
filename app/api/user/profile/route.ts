import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        vehicles: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Format the response to match the expected structure
    const formattedUser = {
      ...user,
      id: user.id.toString(), // Convert MongoDB ObjectId to string
      vehicles: user.vehicles.map(vehicle => ({
        ...vehicle,
        id: vehicle.id.toString(), // Convert MongoDB ObjectId to string
        userId: vehicle.userId.toString(), // Convert MongoDB ObjectId to string
      })),
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 