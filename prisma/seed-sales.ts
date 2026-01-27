
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding sales data...')

    // 1. Get a cashier user
    const cashier = await prisma.user.findFirst()
    if (!cashier) {
        console.log('No user found to assign sales to. Please create a user first.')
        return
    }

    // 2. Get all batches to sell from
    const batches = await prisma.batch.findMany({
        include: { product: true },
        where: { quantity: { gt: 0 } }
    })

    if (batches.length === 0) {
        console.log('No stock available to sell. Please add inventory first.')
        return
    }

    // 3. Generate sales for the last 30 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const paymentMethods = ['CASH', 'CARD', 'UPI']

    for (let i = 0; i < 50; i++) {
        // Random date within last 30 days
        const saleDate = new Date(startDate.getTime() + Math.random() * (new Date().getTime() - startDate.getTime()))

        // Random number of items (1 to 5)
        const numItems = Math.floor(Math.random() * 5) + 1
        const saleItems = []
        let totalAmount = 0

        for (let j = 0; j < numItems; j++) {
            const batch = batches[Math.floor(Math.random() * batches.length)]
            const quantity = Math.floor(Math.random() * 3) + 1 // 1-3 qty
            const price = batch.product.sellingPrice

            saleItems.push({
                batchId: batch.id,
                quantity,
                price
            })
            totalAmount += price * quantity
        }

        // Create Sale
        const sale = await prisma.sale.create({
            data: {
                totalAmount,
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                createdAt: saleDate,
                cashierId: cashier.id,
                items: {
                    create: saleItems
                }
            }
        })

        console.log(`Created sale ${sale.id} for $${totalAmount.toFixed(2)} on ${saleDate.toISOString().split('T')[0]}`)
    }

    console.log('Seeding completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
