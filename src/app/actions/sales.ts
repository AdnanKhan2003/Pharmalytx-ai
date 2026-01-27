'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

type CartItem = {
    productId: string
    batchId: string
    quantity: number
    price: number
}

export async function processSale(items: CartItem[], totalAmount: number, paymentMethod: string) {
    if (!items.length) {
        return { success: false, message: "Cart is empty" }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create Sale Record
            const sale = await tx.sale.create({
                data: {
                    totalAmount,
                    paymentMethod,
                    cashierId: 'clrc4w7w2000008l43y7g6789', // TODO: Get actual logged in user ID
                    items: {
                        create: items.map(item => ({
                            batchId: item.batchId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            })

            // 2. Decrement Stock for each Batch
            for (const item of items) {
                // Check if enough stock exists first (optional but safer)
                const batch = await tx.batch.findUnique({ where: { id: item.batchId } })
                if (!batch || batch.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for batch ${item.batchId}`)
                }

                await tx.batch.update({
                    where: { id: item.batchId },
                    data: {
                        quantity: { decrement: item.quantity }
                    }
                })
            }
        })
    } catch (error: any) {
        console.error("Sale Error:", error)
        return { success: false, message: error.message || "Transaction failed" }
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/sales')
    return { success: true, message: "Sale completed successfully" }
}
