import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma';


function getUserId(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  return token || null;
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clients = await prisma.client.findMany({
    where: { ownerId: userId },
    include: { comments: { take: 3, orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await request.json()
  const client = await prisma.client.create({
    data: { ...body, ownerId: userId },
  })

  return NextResponse.json(client, { status: 201 })
}
