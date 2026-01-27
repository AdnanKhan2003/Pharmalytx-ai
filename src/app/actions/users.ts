'use server'

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { UserRole } from "@prisma/client"

const CreateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["ADMIN", "PHARMACIST", "CASHIER"]),
})

export async function getUsers() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
    })
    return users.map(u => ({ ...u, name: u.name || "Unknown" }))
}

export async function createUser(formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, message: "Unauthorized" }
    }

    const data = Object.fromEntries(formData.entries())
    const parsed = CreateUserSchema.safeParse(data)

    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0].message }
    }

    const { email, password, name, role } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
        return { success: false, message: "User with this email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as UserRole,
            },
        })
        revalidatePath("/dashboard/users")
        return { success: true, message: "User created successfully" }
    } catch (error) {
        return { success: false, message: "Failed to create user" }
    }
}

export async function deleteUser(userId: string) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, message: "Unauthorized" }
    }

    // Prevent deleting self
    if (session.user.id === userId) {
        return { success: false, message: "Cannot delete your own account" }
    }

    try {
        await prisma.user.delete({ where: { id: userId } })
        revalidatePath("/dashboard/users")
        return { success: true, message: "User deleted successfully" }
    } catch (error) {
        return { success: false, message: "Failed to delete user" }
    }
}
