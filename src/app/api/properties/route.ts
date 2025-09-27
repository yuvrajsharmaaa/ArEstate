import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")
    const type = searchParams.get("type")
    const offer = searchParams.get("offer")
    const maxPrice = searchParams.get("maxPrice")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const whereClause: Record<string, unknown> = {}

    if (location) {
      whereClause.address = {
        contains: location,
        mode: "insensitive"
      }
    }

    if (type) {
      whereClause.type = type
    }

    if (offer) {
      whereClause.offer = offer
    }

    if (maxPrice) {
      whereClause.price = {
        lte: maxPrice
      }
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    })

    const totalCount = await prisma.property.count({
      where: whereClause
    })

    return NextResponse.json({
      properties,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (error) {
    console.error("Get properties error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Here you would verify the user is authenticated
    // For now, we'll assume userId is passed in the body
    const {
      userId,
      name,
      address,
      price,
      type,
      offer,
      status,
      furnished,
      bhk,
      deposit,
      bedroom,
      bathroom,
      balcony,
      carpet,
      age,
      totalFloors,
      roomFloor,
      loan,
      image01,
      description,
      ...amenities
    } = body

    const property = await prisma.property.create({
      data: {
        userId,
        name,
        address,
        price,
        type,
        offer,
        status,
        furnished,
        bhk,
        deposit,
        bedroom,
        bathroom,
        balcony,
        carpet,
        age,
        totalFloors,
        roomFloor,
        loan,
        image01,
        description,
        ...amenities
      }
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error("Create property error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
