import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

const allowedRoles = [UserRole.ADMIN.toString()];

export async function GET() {
    const role = await currentRole();

    if(role && allowedRoles.includes(role)) {
        return new NextResponse(null, { status: 200 });
    }
    return new NextResponse(null, { status: 403 });
}