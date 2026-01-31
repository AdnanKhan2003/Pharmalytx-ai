'use client'

import { useState } from "react"
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, QrCode } from "lucide-react"
import { processSale } from "@/app/actions/sales"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Product = {
    id: string
    name: string

    price: number // Cost Price
    sellingPrice: number // Selling Price
    category: string
    batches: { id: string, quantity: number, expiryDate: Date, batchNumber: string }[]
}

type CartItem = Product & {
    cartQuantity: number
    selectedBatchId: string
}

export default function PosInterface({ products }: { products: Product[] }) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const [showMobileCart, setShowMobileCart] = useState(false)
    const router = useRouter()

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )

    const getTotalStock = (p: Product) => p.batches.reduce((acc, b) => acc + b.quantity, 0)

    const addToCart = (product: Product) => {
        // Find best batch (earliest expiry that has stock) - FIFO logic
        const sortedBatches = [...product.batches]
            .filter(b => b.quantity > 0)
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

        if (sortedBatches.length === 0) {
            toast.error("Out of Stock")
            return
        }

        const bestBatch = sortedBatches[0]

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && item.selectedBatchId === bestBatch.id)
            if (existing) {
                if (existing.cartQuantity >= bestBatch.quantity) {
                    toast.warning("Max stock reached for this batch")
                    return prev
                }
                return prev.map(item => item.id === product.id && item.selectedBatchId === bestBatch.id
                    ? { ...item, cartQuantity: item.cartQuantity + 1 }
                    : item
                )
            }
            toast.success("Added to cart")
            // Use sellingPrice for the cart item price
            return [...prev, { ...product, cartQuantity: 1, selectedBatchId: bestBatch.id, price: product.sellingPrice }]
        })
    }

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index))
    }

    const updateQuantity = (index: number, delta: number) => {
        setCart(prev => {
            const item = prev[index]
            const batch = item.batches.find(b => b.id === item.selectedBatchId)
            if (!batch) return prev

            const newQty = item.cartQuantity + delta
            if (newQty <= 0) return prev.filter((_, i) => i !== index)
            if (newQty > batch.quantity) return prev

            return prev.map((item, i) => i === index ? { ...item, cartQuantity: newQty } : item)
        })
    }

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0)

    const handleCheckout = async () => {
        setLoading(true)
        const items = cart.map(item => ({
            productId: item.id,
            batchId: item.selectedBatchId,
            quantity: item.cartQuantity,
            price: item.price
        }))

        const result = await processSale(items, totalAmount, "CASH") // Default to CASH for now
        if (result.success) {
            toast.success("Sale completed successfully!")
            setCart([])
            setShowMobileCart(false)
            // Ideally redirect to invoice or refresh
            router.refresh()
        } else {
            toast.error(result.message)
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* 1. Header/Search Area (Fixed) */}
            <div className="relative mb-4 flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search medicines..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>

            {/* 2. Content Area (Flexible) */}
            <div className="flex-1 overflow-hidden relative flex gap-6 min-h-0">

                {/* Product Grid (Takes all space on mobile, shared on desktop) */}
                <div className="flex-1 overflow-y-auto pr-2 pb-20 lg:pb-0">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 pb-4">
                        {filteredProducts.map(product => {
                            const stock = getTotalStock(product)
                            return (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    disabled={stock <= 0}
                                    className="text-left bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group disabled:opacity-50 disabled:cursor-not-allowed flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-2 w-full">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase truncate max-w-[80px]">
                                            {product.category}
                                        </span>
                                        <span className={`text-[10px] font-bold shrink-0 ${stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                            {stock > 0 ? `${stock} in stock` : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1 mb-2">{product.name}</h3>
                                    <p className="text-blue-600 dark:text-blue-400 font-bold">${product.sellingPrice.toFixed(2)}</p>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Cart Sidebar (Desktop: Static | Mobile: Hidden/Overlay) */}
                <div className={`
                    bg-white dark:bg-gray-900 lg:bg-transparent
                    lg:w-96 lg:static lg:flex lg:flex-col lg:rounded-2xl lg:border lg:border-gray-200 lg:dark:border-gray-800 lg:shadow-xl
                    ${showMobileCart
                        ? 'fixed inset-0 z-50 flex flex-col lg:static'
                        : 'hidden lg:flex'
                    }
                `}>
                    {/* Mobile Header for Cart Overlay */}
                    {showMobileCart && (
                        <div className="lg:hidden p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
                            <h2 className="font-bold text-lg text-gray-800 dark:text-white">Current Order</h2>
                            <button onClick={() => setShowMobileCart(false)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                Close
                            </button>
                        </div>
                    )}

                    {/* Desktop Header */}
                    <div className="hidden lg:block p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 lg:rounded-t-2xl">
                        <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Current Order
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-gray-900 lg:bg-transparent">
                        {cart.map((item, index) => (
                            <div key={`${item.id}-${item.selectedBatchId}`} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                <div className="min-w-0 flex-1 mr-2">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">${item.price} x {item.cartQuantity}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-1 py-0.5">
                                        <button onClick={() => updateQuantity(index, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400"><Minus className="h-3 w-3" /></button>
                                        <span className="text-xs font-bold w-4 text-center text-gray-900 dark:text-white">{item.cartQuantity}</span>
                                        <button onClick={() => updateQuantity(index, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400"><Plus className="h-3 w-3" /></button>
                                    </div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white w-14 text-right">${(item.price * item.cartQuantity).toFixed(2)}</p>
                                    <button onClick={() => removeFromCart(index)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                                <ShoppingCart className="h-12 w-12" />
                                <p className="text-sm">Cart is empty</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 space-y-4 lg:rounded-b-2xl">
                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span>Tax (0%)</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-800">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <CreditCard className="h-5 w-5" />
                                    Record Sale
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>

            {/* 3. Mobile Bottom Bar (Visible only on mobile when cart is closed) */}
            {!showMobileCart && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-center gap-4">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</p>
                        </div>
                        <button
                            onClick={() => setShowMobileCart(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            View Order ({cart.reduce((acc, i) => acc + i.cartQuantity, 0)})
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
