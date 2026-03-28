import NextAuth, { DefaultSession } from "next-auth"
// import { UserRole } from "@prisma/client"
type UserRole = "ADMIN" | "PHARMACIST" | "CASHIER"


declare module "next-auth" {
    interface Session {
        user: {
            role: UserRole
        } & DefaultSession["user"]
    }

    interface User {
        role: UserRole
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: UserRole
    }
}
