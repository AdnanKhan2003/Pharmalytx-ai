import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const password = await bcrypt.hash('admin123', 10)

        const admin = await prisma.user.upsert({
            where: { email: 'admin@pharmalytix.com' },
            update: {},
            create: {
                email: 'admin@pharmalytix.com',
                name: 'Admin User',
                password,
                role: 'ADMIN',
            },
        })

        return NextResponse.json({ success: true, user: admin })
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
