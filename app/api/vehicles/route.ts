import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all vehicles for a user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('GET Session:', session); // Debug log
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        isPrimary: 'desc',
      },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new vehicle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('POST Session:', session); // Debug log
    
    if (!session?.user?.id) {
      console.log('No session or user ID found'); // Debug log
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body); // Debug log
    
    const { make, model, year, color, licensePlate, isPrimary } = body;

    // Validate required fields
    if (!make || !model || !year || !color || !licensePlate) {
      console.log('Missing fields:', { make, model, year, color, licensePlate }); // Debug log
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If setting as primary, update all other vehicles to non-primary
    if (isPrimary) {
      await prisma.vehicle.updateMany({
        where: {
          userId: session.user.id,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        year,
        color,
        licensePlate,
        isPrimary: isPrimary || false,
        userId: session.user.id,
      },
    });

    console.log('Created vehicle:', newVehicle); // Debug log
    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 