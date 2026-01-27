'use server'

import { prisma } from "@/lib/prisma"

export async function getDemandForecast() {
    const products = await prisma.product.findMany({
        include: { batches: true }
    })

    const sales = await prisma.sale.findMany({
        where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        },
        include: { items: true }
    })

    // Better DB Query for aggregation
    const productSales = await prisma.saleItem.groupBy({
        by: ['batchId'],
        _sum: { quantity: true },
        where: {
            sale: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        }
    })

    // Map batch sales to product sales
    const batches = await prisma.batch.findMany({
        where: { id: { in: productSales.map((p: { batchId: string }) => p.batchId) } },
        select: { id: true, productId: true }
    })

    const productSoldMap: Record<string, number> = {}
    productSales.forEach((ps: { batchId: string, _sum: { quantity: number | null } }) => {
        const batch = batches.find((b: { id: string }) => b.id === ps.batchId)
        if (batch) {
            productSoldMap[batch.productId] = (productSoldMap[batch.productId] || 0) + (ps._sum.quantity || 0)
        }
    })

    return products.map((product: any) => {
        const soldLast30Days = productSoldMap[product.id] || 0
        const currentStock = product.batches.reduce((acc: number, b: { quantity: number }) => acc + b.quantity, 0)
        const dailyRate = soldLast30Days / 30
        const predictedDemandNext30 = Math.ceil(dailyRate * 30) // Simple projection

        // "AI" Reorder Suggestion
        // If stock < predictedDemand + safety buffer (20%)
        const safetyBuffer = Math.ceil(predictedDemandNext30 * 0.2)
        const shouldReorder = currentStock < (predictedDemandNext30 + safetyBuffer)
        const suggestedReorderQuantity = shouldReorder ? (predictedDemandNext30 + safetyBuffer - currentStock) : 0

        return {
            id: product.id,
            name: product.name,
            category: product.category,
            currentStock,
            soldLast30Days,
            dailyRate: dailyRate.toFixed(2),
            predictedDemand: predictedDemandNext30,
            status: shouldReorder ? (currentStock === 0 ? 'CRITICAL' : 'REORDER') : 'HEALTHY',
            suggestion: suggestedReorderQuantity
        }
    }).sort((a: any, b: any) => (b.status === 'CRITICAL' ? 1 : 0) - (a.status === 'CRITICAL' ? 1 : 0)) // Critical first
}
