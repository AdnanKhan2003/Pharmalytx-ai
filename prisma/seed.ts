import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const users = [
        { email: 'admin@pharmalytix.com', role: 'ADMIN', name: 'Admin User' },
        { email: 'pharmacist@pharmalytix.com', role: 'PHARMACIST', name: 'Pharmacist User' },
        { email: 'cashier@pharmalytix.com', role: 'CASHIER', name: 'Cashier User' },
    ]

    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 10)

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                password: hashedPassword,
                role: u.role as any,
            },
            create: {
                email: u.email,
                name: u.name,
                password: hashedPassword,
                role: u.role as any,
            },
        })
        console.log(`Seeded ${u.role}: ${u.email}`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
