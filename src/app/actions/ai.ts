'use server'

import { prisma } from "@/lib/prisma"

export async function getDemandForecast() {
    const products = await prisma.product.findMany({
        include: { batches: true }
    })

    // 1. Calculate historical metrics (The "Base" Truth)
    // ------------------------------------------------------------------
    const past30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const sales = await prisma.saleItem.groupBy({
        by: ['batchId'],
        _sum: { quantity: true },
        where: {
            sale: { createdAt: { gte: past30Days } }
        }
    })

    // Map batch sales to product sales
    const batchIds = sales.map((s: { batchId: string }) => s.batchId).filter(Boolean) as string[]
    const batches = await prisma.batch.findMany({
        where: { id: { in: batchIds } },
        select: { id: true, productId: true }
    })

    const productStats: Record<string, { sold: number }> = {}

    sales.forEach((s: { batchId: string, _sum: { quantity: number | null } }) => {
        const batch = batches.find((b: { id: string }) => b.id === s.batchId)
        if (batch) {
            if (!productStats[batch.productId]) productStats[batch.productId] = { sold: 0 }
            productStats[batch.productId].sold += (s._sum.quantity || 0)
        }
    })


    // 2. Prepare Data for AI (or Fallback)
    // ------------------------------------------------------------------
    const forecastPromises = products.map(async (product: any) => {
        const soldLast30Days = productStats[product.id]?.sold || 0
        const currentStock = product.batches.reduce((acc: number, b: { quantity: number }) => acc + b.quantity, 0)
        const dailyRate = soldLast30Days / 30

        // Default / Fallback Math
        let predictedDemand = Math.ceil(dailyRate * 30)
        let safetyBuffer = Math.ceil(predictedDemand * 0.2)
        let explanation = "Based on 30-day simple moving average."

        // 3. Call Gemini AI (If Key Exists)
        // ------------------------------------------------------------------
        if (process.env.GEMINI_API_KEY) {
            try {
                const { GoogleGenerativeAI } = require("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const prompt = `
          Context: Pharmacy Inventory Management.
          Product: ${product.name} (Category: ${product.category})
          
          Data:
          - Past 30 Days Sales: ${soldLast30Days} units
          - Current Stock: ${currentStock} units
          - Average Daily Sales: ${dailyRate.toFixed(2)} units/day
          
          Task:
          Predict the demand for the NEXT 30 days. Consider that real-world demand fluctuates.
          Return a valid JSON object strictly with this structure. Do not add markdown formatting:
          {
            "predictedDemand": number,
            "safetyBuffer": number,
            "reasoning": "short one sentence explanation"
          }
        `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text().replace(/```json|```/g, "").trim();
                const aiData = JSON.parse(text);

                if (aiData.predictedDemand) {
                    predictedDemand = aiData.predictedDemand;
                    safetyBuffer = aiData.safetyBuffer;
                    explanation = "AI Analysis: " + aiData.reasoning;
                }
            } catch (error) {
                console.error("Gemini API Error for", product.name, error);
                // Fallback silently to math
            }
        }

        // 4. Final Decision Logic
        // ------------------------------------------------------------------
        const shouldReorder = currentStock < (predictedDemand + safetyBuffer)
        const suggestedReorderQuantity = shouldReorder ? (predictedDemand + safetyBuffer - currentStock) : 0

        return {
            id: product.id,
            name: product.name,
            category: product.category,
            currentStock,
            soldLast30Days,
            dailyRate: dailyRate.toFixed(2),
            predictedDemand,
            status: shouldReorder ? (currentStock === 0 ? 'CRITICAL' : 'REORDER') : 'HEALTHY',
            suggestion: suggestedReorderQuantity,
            explanation // New field to show AI reasoning
        }
    })

    // Wait for all AI calls to finish
    const results = await Promise.all(forecastPromises)

    return results.sort((a, b) => (b.status === 'CRITICAL' ? 1 : 0) - (a.status === 'CRITICAL' ? 1 : 0))
}
