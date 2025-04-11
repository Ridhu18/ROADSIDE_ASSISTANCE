import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT update vehicle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const vehicleId = params.id;
    const body = await request.json();
    const { make, model, year, color, licensePlate, isPrimary } = body;

    // Check if vehicle exists and belongs to user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: session.user.id,
      },
    });

    if (!existingVehicle) {
      return NextResponse.json(
        { message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // If setting as primary, update all other vehicles to non-primary
    if (isPrimary) {
      await prisma.vehicle.updateMany({
        where: {
          userId: session.user.id,
          id: { not: vehicleId },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        make,
        model,
        year,
        color,
        licensePlate,
        isPrimary: isPrimary ?? existingVehicle.isPrimary,
      },
    });

    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE vehicle
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const vehicleId = params.id;

    // Check if vehicle exists and belongs to user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: session.user.id,
      },
    });

    if (!existingVehicle) {
      return NextResponse.json(
        { message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    await prisma.vehicle.delete({
      where: {
        id: vehicleId,
      },
    });

    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 