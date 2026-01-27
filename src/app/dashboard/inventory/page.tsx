import InventoryFilters from "@/components/inventory/inventory-filters"
import { prisma } from "@/lib/prisma"
import { AlertCircle, AlertTriangle, Package } from "lucide-react"
import InventoryActions from "@/components/inventory/inventory-actions"

// Types
type InventoryItem = {
    id: string
    name: string
    category: string
    minStockLevel: number
    price: number
    sellingPrice: number
    batches: {
        id: string
        quantity: number
        expiryDate: Date
        batchNumber: string
    }[]
}

export default async function InventoryPage(props: {
    searchParams: Promise<{
        query?: string
        page?: string
        status?: string
        category?: string
    }>
}) {
    const searchParams = await props.searchParams
    const query = searchParams?.query || ''
    const status = searchParams?.status || ''
    const category = searchParams?.category || ''

    // 1. Fetch data with basic filtering (Search + Category)
    const rawProducts = await prisma.product.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { category: { contains: query, mode: 'insensitive' } },
                    ]
                },
                category ? { category: { equals: category, mode: 'insensitive' } } : {}
            ]
        },
        include: {
            batches: true,
        },
        orderBy: {
            name: 'asc'
        }
    })

    // 2. Post-process for complex filters (Stock Status)
    const products = rawProducts.filter(product => {
        if (!status) return true

        const totalStock = product.batches.reduce((acc, b) => acc + b.quantity, 0)

        if (status === 'low') {
            return totalStock <= product.minStockLevel
        }

        if (status === 'expiring') {
            return product.batches.some(b => {
                const daysUntilExpiry = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                return daysUntilExpiry <= 60
            })
        }

        return true
    })

    return (
        <div className="space-y-6">
            <InventoryFilters />

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Medicine Name</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Category</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Stock</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Batch Status</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Price</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {products.map((product) => {
                                const totalStock = product.batches.reduce((acc, b) => acc + b.quantity, 0)
                                const isLowStock = totalStock <= product.minStockLevel

                                // Check if any batch is expiring within 60 days
                                const nearExpiryBatch = product.batches.find(b => {
                                    const daysUntilExpiry = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                    return daysUntilExpiry <= 60
                                })

                                return (
                                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="p-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                                            <p className="text-xs text-gray-400">{product.batches.length} Batches</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {totalStock}
                                                </span>
                                                {isLowStock && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/30">
                                                        <AlertCircle className="h-3 w-3" /> LOW
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {nearExpiryBatch ? (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 w-fit">
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    Expiring Soon ({new Date(nearExpiryBatch.expiryDate).toLocaleDateString()})
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 w-fit">
                                                    <Package className="h-3.5 w-3.5" />
                                                    Good Condition
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right font-medium text-gray-900 dark:text-white">
                                            ${product.sellingPrice.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <InventoryActions productId={product.id} />
                                        </td>
                                    </tr>
                                )
                            })}

                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500 dark:text-gray-400">
                                        No medicines found. Click "Add Stock" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
