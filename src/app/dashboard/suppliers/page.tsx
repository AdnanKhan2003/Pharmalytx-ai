import { prisma } from "@/lib/prisma"
import { Search, Filter, Building2, Phone, Mail } from "lucide-react"
import Link from "next/link"
import SupplierActions from "@/components/suppliers/supplier-actions"
import { ExportButton } from "@/components/ui/export-button"

export default async function SuppliersPage() {
    const suppliers = await prisma.supplier.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { products: true }
            }
        }
    })

    const exportData = suppliers.map(s => ({
        name: s.name,
        contact: s.contact || 'N/A',
        email: s.email || 'N/A',
        address: s.address || 'N/A',
        products: s._count.products
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <ExportButton
                        data={exportData}
                        columns={[
                            { header: 'Supplier Name', key: 'name' },
                            { header: 'Contact Person', key: 'contact' },
                            { header: 'Email', key: 'email' },
                            { header: 'Address', key: 'address' },
                            { header: 'Product Count', key: 'products' }
                        ]}
                        filename="suppliers_list"
                    />
                    <Link href="/dashboard/suppliers/add" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                        <Building2 className="h-4 w-4" />
                        Add Supplier
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                    <div key={supplier.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                                {supplier._count.products} Products
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{supplier.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{supplier.contact || 'No contact person'}</p>

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6 flex-1">
                            {supplier.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    {supplier.email}
                                </div>
                            )}
                            {supplier.contact && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    {supplier.address}
                                </div>
                            )}
                        </div>
                        <div className="mt-auto">
                            <SupplierActions supplierId={supplier.id} />
                        </div>
                    </div>
                ))}
            </div>
            {suppliers.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed">
                    <p className="text-gray-500 dark:text-gray-400">No suppliers found. Add one to get started.</p>
                </div>
            )}
        </div>
    )
}
