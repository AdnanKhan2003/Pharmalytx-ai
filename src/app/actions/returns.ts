'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function processReturn(saleId: string, returnItems: { batchId: string, quantity: number }[], reason: string) {
    const session = await auth()
    if (!session?.user) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Calculate Refund Amount
            // We need to fetch original price from SaleItems? 
            // Better to pass it or fetch here.
            // Let's fetch the Sale first
            const sale = await tx.sale.findUnique({
                where: { id: saleId },
                include: { items: true }
            })

            if (!sale) throw new Error("Sale not found")

            let refundAmount = 0

            for (const rItem of returnItems) {
                // Find original sale item to get price
                const saleItem = sale.items.find(i => i.batchId === rItem.batchId)
                if (!saleItem) throw new Error(`Batch ${rItem.batchId} not found in this sale`)

                if (rItem.quantity > saleItem.quantity) throw new Error("Cannot return more than sold")

                refundAmount += (saleItem.price * rItem.quantity)

                // 2. Increment Stock
                await tx.batch.update({
                    where: { id: rItem.batchId },
                    data: { quantity: { increment: rItem.quantity } }
                })
            }

            // 3. Create Return Record
            await tx.returnRecord.create({
                data: {
                    saleId,
                    reason,
                    refundAmount,
                    processedBy: session.user.id,
                    items: {
                        create: returnItems.map(i => ({
                            batchId: i.batchId,
                            quantity: i.quantity
                        }))
                    }
                }
            })
        })

        revalidatePath("/dashboard/returns")
        revalidatePath("/dashboard/inventory")
        revalidatePath("/dashboard/sales")

        return { success: true, message: "Return processed successfully" }

    } catch (error: any) {
        return { success: false, message: error.message || "Failed to process return" }
    }
}

export async function getSalesForReturn(query: string) {
    // Search sales by ID or (if we had customer name)
    // For now simple ID match or recent
    if (!query) {
        return prisma.sale.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        batch: {
                            include: { product: true }
                        }
                    }
                }
            }
        })
    }

    return prisma.sale.findMany({
        where: { id: { contains: query } },
        take: 5,
        include: {
            items: {
                include: {
                    batch: {
                        include: { product: true }
                    }
                }
            }
        }
    })
}
