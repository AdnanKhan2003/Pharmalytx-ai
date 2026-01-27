import EditSupplierForm from "@/components/suppliers/edit-supplier-form"
import { getSupplier } from "@/app/actions/inventory"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supplier = await getSupplier(id)

    if (!supplier) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/suppliers"
                    className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Supplier</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Update supplier information.</p>
                </div>
            </div>

            <EditSupplierForm supplier={supplier} />
        </div>
    )
}
