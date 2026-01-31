import InventoryFilters from "@/components/inventory/inventory-filters"
import { prisma } from "@/lib/prisma"
import { AlertCircle, AlertTriangle, Package } from "lucide-react"
import InventoryActions from "@/components/inventory/inventory-actions"
import { ExportButton } from "@/components/ui/export-button"

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

    const exportData = products.map(p => ({
        name: p.name,
        category: p.category,
        totalStock: p.batches.reduce((acc, b) => acc + b.quantity, 0),
        minStock: p.minStockLevel,
        costPrice: p.price,
        sellingPrice: p.sellingPrice,
        status: p.batches.reduce((acc, b) => acc + b.quantity, 0) <= p.minStockLevel ? 'LOW STOCK' : 'OK'
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="w-full md:w-auto">
                    <InventoryFilters />
                </div>
                <div className="w-full md:w-auto flex justify-end">
                    <ExportButton
                        data={exportData}
                        columns={[
                            { header: 'Medicine Name', key: 'name' },
                            { header: 'Category', key: 'category' },
                            { header: 'Total Stock', key: 'totalStock' },
                            { header: 'Min Stock', key: 'minStock' },
                            { header: 'Selling Price ($)', key: 'sellingPrice' },
                            { header: 'Status', key: 'status' }
                        ]}
                        filename="inventory_summary"
                    />
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {products.map((product) => {
                    const totalStock = product.batches.reduce((acc, b) => acc + b.quantity, 0)
                    const isLowStock = totalStock <= product.minStockLevel
                    const nearExpiryBatch = product.batches.find(b => {
                        const daysUntilExpiry = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        return daysUntilExpiry <= 60
                    })

                    return (
                        <div key={product.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                        {product.category}
                                    </span>
                                </div>
                                <InventoryActions productId={product.id} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Total Stock</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`font-semibold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                            {totalStock}
                                        </span>
                                        {isLowStock && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30">
                                                <AlertCircle className="h-3 w-3" /> LOW
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs text-right">Selling Price</p>
                                    <p className="font-medium text-gray-900 dark:text-white text-right mt-1">
                                        ${product.sellingPrice.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {nearExpiryBatch ? (
                                <div className="flex items-center gap-2 text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    <span>Expiring Soon ({new Date(nearExpiryBatch.expiryDate).toLocaleDateString()})</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-100 dark:border-green-900/30">
                                    <Package className="h-4 w-4 shrink-0" />
                                    <span>Good Condition</span>
                                </div>
                            )}
                        </div>
                    )
                })}
                {products.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                        No medicines found.
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
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

