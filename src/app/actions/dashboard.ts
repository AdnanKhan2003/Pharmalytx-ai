'use server'

import { prisma } from "@/lib/prisma"

export async function getDashboardMetrics() {
    const products = await prisma.product.findMany({
        include: { batches: true }
    })

    const totalRevenueResult = await prisma.sale.aggregate({
        _sum: {
            totalAmount: true
        }
    })

    const sales = await prisma.sale.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100, // For chart
        include: {
            items: {
                include: {
                    batch: {
                        include: {
                            product: { select: { name: true } }
                        }
                    }
                }
            }
        }
    })

    // Calculate Metrics
    const totalRevenue = totalRevenueResult._sum.totalAmount || 0

    // Inventory Metrics
    let totalStock = 0
    let lowStockCount = 0
    let expiringSoonCount = 0

    products.forEach((p: any) => {
        const pStock = p.batches.reduce((a: number, b: { quantity: number }) => a + b.quantity, 0)
        totalStock += pStock
        if (pStock <= p.minStockLevel) lowStockCount++

        const nearExpiry = p.batches.some((b: { expiryDate: Date }) => {
            const days = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return days <= 30 && days > 0
        })
        if (nearExpiry) expiringSoonCount++
    })

    // Recent Sales for List
    const recentSales = sales.slice(0, 5).map((s: any) => ({
        id: s.id,
        amount: s.totalAmount,
        date: s.createdAt,
        itemsCount: s.items.length,
        itemsList: s.items.map((i: any) => `${i.batch.product.name} (x${i.quantity})`).join(', ')
    }))

    // Chart Data (Group by date)
    const chartData = sales.reduce((acc: any[], sale: any) => {
        const date = sale.createdAt.toISOString().split('T')[0]
        const existing = acc.find((x: any) => x.name === date)
        if (existing) {
            existing.value += sale.totalAmount
        } else {
            acc.push({ name: date, value: sale.totalAmount })
        }
        return acc
    }, []).sort((a: any, b: any) => new Date(a.name).getTime() - new Date(b.name).getTime())

    return {
        revenue: totalRevenue,
        totalStock,
        lowStockCount,
        expiringSoonCount,
        recentSales,
        chartData
    }
}
