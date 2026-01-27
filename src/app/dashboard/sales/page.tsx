import PosInterface from "@/components/sales/pos-interface"
import { prisma } from "@/lib/prisma"

export default async function SalesPage() {
    const products = await prisma.product.findMany({
        include: {
            batches: true
        },
        orderBy: {
            name: 'asc'
        }
    })

    // Transform products to match Client Component expectation if needed, or pass directly
    // Prisma return type matches mostly, sellingPrice vs price might need check.
    // Product model has sellingPrice. Component expects sellingPrice. 
    // Component expects: batches with expiryDate (Date). Prisma returns Date.
    // Ensure naming matches.

    return (
        <div className="h-full">
            {/* Header is handled in layout, but we might want a different view here if we want full screen POS. 
                 For now, render inside dashboard layout. */}
            <PosInterface products={products} />
        </div>
    )
}
