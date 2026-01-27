'use client'

import { Search, Filter, X, Package } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { useState } from "react"
import Link from "next/link"

export default function InventoryFilters() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('query', term)
        } else {
            params.delete('query')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const handleFilterChange = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams)
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search medicine..."
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('query')?.toString()}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto relative">
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${searchParams.get('status') || searchParams.get('category')
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                >
                    <Filter className="h-4 w-4" />
                    Filter
                    {(searchParams.get('status') || searchParams.get('category')) && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                    )}
                </button>

                <Link href="/dashboard/inventory/add" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                    <Package className="h-4 w-4" />
                    Add Stock
                </Link>

                {isFilterOpen && (
                    <div className="absolute top-12 right-0 w-64 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl p-4 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Filters</h4>
                            <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Stock Status</label>
                                <select
                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                                    onChange={(e) => handleFilterChange('status', e.target.value || null)}
                                    defaultValue={searchParams.get('status') || ''}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="low">Low Stock</option>
                                    <option value="expiring">Expiring Soon</option>
                                </select>
                            </div>

                            {/* Assuming specific categories exist, can be dynamic later */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Category</label>
                                <select
                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                                    onChange={(e) => handleFilterChange('category', e.target.value || null)}
                                    defaultValue={searchParams.get('category') || ''}
                                >
                                    <option value="">All Categories</option>
                                    <option value="Antibiotics">Antibiotics</option>
                                    <option value="Painkillers">Painkillers</option>
                                    <option value="Vitamins">Vitamins</option>
                                </select>
                            </div>

                            <button
                                onClick={() => {
                                    handleFilterChange('status', null)
                                    handleFilterChange('category', null)
                                    setIsFilterOpen(false)
                                }}
                                className="w-full py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
