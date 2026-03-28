import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const requests = await prisma.agentRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, status, adminNotes } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: Record<string, any> = {};
  if (status) data.status = status;
  if (adminNotes !== undefined) data.adminNotes = adminNotes;

  const request = await prisma.agentRequest.update({
    where: { id },
    data,
  });

  return NextResponse.json(request);
}
