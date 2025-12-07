import {NextRequest, NextResponse} from 'next/server'
import prisma from '@/utils/prisma';
import {cookies} from "next/headers";
import jwt from "jsonwebtoken";

async function getUserId(): Promise<string | null> {
  const cookiesStore = await cookies();
  const token = cookiesStore.get('token')?.value;

  if (!token) {
    return null;
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string};
    return decode.userId;
  } catch (error) {
    console.error('Invalid or expired token:', error);
    return null;
  }
}

export async function GET(_req: NextRequest) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const clients = await prisma.client.findMany({
    where: {ownerId: userId},
    include: {comments: {take: 3, orderBy: {createdAt: 'desc'}}},
    orderBy: {createdAt: 'desc'},
  });

  return NextResponse.json(clients)
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  const body = await request.json();

  console.log("BODY:", body);

  const client = await prisma.client.create({
    data: {...body, ownerId: userId},
  })

  return NextResponse.json(client, {status: 201});
}
