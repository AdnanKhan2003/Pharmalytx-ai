'use server'

import { prisma } from "@/lib/prisma"

export async function getDetailedReports() {
    const sales = await prisma.sale.findMany({
        include: {
            items: {
                include: {
                    batch: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // 1. Calculate Profit Margins
    let totalRevenue = 0
    let totalCost = 0

    // 2. Category Breakdown
    const categorySales: Record<string, number> = {}

    // 3. Top Products
    const productPerformance: Record<string, { name: string, quantity: number, revenue: number }> = {}

    sales.forEach(sale => {
        totalRevenue += sale.totalAmount

        sale.items.forEach((item: any) => {
            // Cost calculation 
            const cost = item.batch.product.price * item.quantity
            totalCost += cost

            // Category
            const cat = item.batch.product.category
            categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity)

            // Top Products
            const pid = item.batch.productId
            if (!productPerformance[pid]) {
                productPerformance[pid] = {
                    name: item.batch.product.name,
                    quantity: 0,
                    revenue: 0
                }
            }
            productPerformance[pid].quantity += item.quantity
            productPerformance[pid].revenue += (item.price * item.quantity)
        })
    })

    const totalProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    const topSellingProducts = Object.values(productPerformance)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

    const categoryData = Object.entries(categorySales).map(([name, value]) => ({
        name,
        value
    }))

    return {
        financials: {
            revenue: totalRevenue,
            profit: totalProfit,
            margin: profitMargin.toFixed(1)
        },
        categoryData,
        topSellingProducts
    }
}
