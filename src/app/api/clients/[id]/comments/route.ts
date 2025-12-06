import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/utils/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await request.json()

  // Проверяем, что клиент принадлежит пользователю
  const client = await prisma.client.findFirst({
    where: { id: params.id, ownerId: userId },
  })

  if (!client) return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 })

  const comment = await prisma.comment.create({
    data: {
      text,
      clientId: params.id,
      authorId: userId,
    },
    include: { author: { select: { name: true } } },
  })

  return NextResponse.json(comment)
}