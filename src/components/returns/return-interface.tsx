'use client'

import { useState } from "react"
import { getSalesForReturn, processReturn } from "@/app/actions/returns"
import { Search, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type SaleItem = {
    id: string
    quantity: number
    price: number
    batchId: string
    batch: {
        product: { name: string, category: string }
        batchNumber: string
    }
}

type Sale = {
    id: string
    createdAt: Date
    totalAmount: number
    items: SaleItem[]
}

export default function ReturnInterface() {
    const [query, setQuery] = useState("")
    const [sales, setSales] = useState<Sale[]>([])
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
    const [returnItems, setReturnItems] = useState<Record<string, number>>({}) // batchId -> quantity
    const [reason, setReason] = useState("Customer Return")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSearch = async () => {
        const results = await getSalesForReturn(query)
        setSales(results as any) // Type casting for simplicity here
        setSelectedSale(null)
    }

    const toggleReturnItem = (batchId: string, maxQty: number) => {
        setReturnItems(prev => {
            const current = prev[batchId] || 0
            if (current > 0) {
                const copy = { ...prev }
                delete copy[batchId]
                return copy
            } else {
                return { ...prev, [batchId]: 1 }
            }
        })
    }

    const updateQty = (batchId: string, delta: number, maxQty: number) => {
        setReturnItems(prev => {
            const current = prev[batchId] || 0
            const newQty = current + delta
            if (newQty <= 0) {
                const copy = { ...prev }
                delete copy[batchId]
                return copy
            }
            if (newQty > maxQty) return prev
            return { ...prev, [batchId]: newQty }
        })
    }

    const handleSubmit = async () => {
        if (!selectedSale) return

        const itemsToReturn = Object.entries(returnItems).map(([batchId, quantity]) => ({
            batchId,
            quantity
        }))

        if (itemsToReturn.length === 0) {
            toast.error("Select items to return")
            return
        }

        setLoading(true)
        const result = await processReturn(selectedSale.id, itemsToReturn, reason)
        if (result.success) {
            toast.success(result.message)
            setSelectedSale(null)
            setReturnItems({})
            setSales([])
            setQuery("")
            router.refresh()
        } else {
            toast.error(result.message)
        }
        setLoading(false)
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Search Section */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-600" />
                        Find Sale
                    </h2>
                    <div className="flex gap-2">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by Sale ID..."
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    <div className="mt-4 space-y-3">
                        {sales.map(sale => (
                            <div
                                key={sale.id}
                                onClick={() => { setSelectedSale(sale); setReturnItems({}) }}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSale?.id === sale.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{sale.id.slice(0, 8)}...</span>
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">{new Date(sale.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800 dark:text-gray-200">Total: ${sale.totalAmount.toFixed(2)}</span>
                                    <span className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-600 dark:text-gray-400">{sale.items.length} Items</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Return Process Section */}
            <div className="space-y-6">
                {selectedSale ? (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm animate-in slide-in-from-right-4 fade-in duration-300">
                        <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <RotateCcw className="h-5 w-5 text-orange-500" />
                            Process Return
                        </h2>

                        <div className="space-y-4 mb-6">
                            {selectedSale.items.map(item => {
                                const returnQty = returnItems[item.batchId] || 0
                                return (
                                    <div key={item.id} className={`p-3 rounded-xl border ${returnQty > 0 ? 'border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-800'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.batch.product.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Batch: {item.batch.batchNumber}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">${item.price}</p>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Sold: {item.quantity}</span>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQty(item.batchId, -1, item.quantity)}
                                                    className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                                                    disabled={returnQty === 0}
                                                >
                                                    -
                                                </button>
                                                <span className={`w-6 text-center text-sm font-bold ${returnQty > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                                    {returnQty}
                                                </span>
                                                <button
                                                    onClick={() => updateQty(item.batchId, 1, item.quantity)}
                                                    className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Reason</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                    <option>Customer Return</option>
                                    <option>Damaged Product</option>
                                    <option>Expired (Sold by mistake)</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Refund Amount</span>
                                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                    ${Object.entries(returnItems).reduce((acc, [batchId, qty]) => {
                                        const item = selectedSale.items.find(i => i.batchId === batchId)
                                        return acc + (item ? item.price * qty : 0)
                                    }, 0).toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading || Object.keys(returnItems).length === 0}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex justify-center"
                            >
                                {loading ? 'Processing...' : 'Confirm Return'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-gray-400 dark:text-gray-500">
                        <RotateCcw className="h-12 w-12 mb-2 opacity-50" />
                        <p>Select a sale to search items for return</p>
                    </div>
                )}
            </div>
        </div>
    )
}
