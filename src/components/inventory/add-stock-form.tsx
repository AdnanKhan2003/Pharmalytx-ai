'use client'

import { createProduct } from "@/app/actions/inventory"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { useState, useEffect } from "react"
import { Loader2, Save } from "lucide-react"

// Categories for dropdown (could be dynamic later)
const CATEGORIES = [
    "Antibiotics", "Analgesics", "Antipyretics", "Antiseptics",
    "Vitamins", "Supplements", "First Aid", "Diabetes", "Cardiology"
]

export default function AddStockForm({ suppliers }: { suppliers: { id: string, name: string }[] }) {
    const initialState = { message: '', errors: {} }
    const [state, dispatch] = useActionState(createProduct, initialState) // Updated hook name for React 19/Next 15+

    return (
        <form action={dispatch} className="space-y-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Product Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Medicine Name</label>
                        <input name="name" type="text" placeholder="e.g. Amoxicillin 500mg" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
                        <ErrorMessage errors={state.errors?.name} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select name="category" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" required>
                            <option value="">Select Category</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ErrorMessage errors={state.errors?.category} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Manufacturer</label>
                        <input name="manufacturer" type="text" placeholder="e.g. GSK" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                        <select name="supplierId" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" required>
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <ErrorMessage errors={state.errors?.supplierId} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost Price ($)</label>
                        <input name="price" type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
                        <ErrorMessage errors={state.errors?.price} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Selling Price ($)</label>
                        <input name="sellingPrice" type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
                        <ErrorMessage errors={state.errors?.sellingPrice} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Min. Stock Alert Level</label>
                        <input name="minStockLevel" type="number" defaultValue={10} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        <ErrorMessage errors={state.errors?.minStockLevel} />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Initial Batch Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Batch Number</label>
                        <input name="batchNumber" type="text" placeholder="e.g. BATCH-001" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
                        <ErrorMessage errors={state.errors?.batchNumber} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                        <input name="quantity" type="number" placeholder="0" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
                        <ErrorMessage errors={state.errors?.quantity} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                        <input name="expiryDate" type="date" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
                        <ErrorMessage errors={state.errors?.expiryDate} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <SubmitButton />
            </div>

            {state.message && (
                <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                    {state.message}
                </div>
            )}
        </form>
    )
}

function ErrorMessage({ errors }: { errors?: string[] }) {
    if (!errors?.length) return null
    return (
        <p className="text-xs text-red-500 mt-1">{errors[0]}</p>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-70"
        >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {pending ? "Saving..." : "Save Product"}
        </button>
    )
}
