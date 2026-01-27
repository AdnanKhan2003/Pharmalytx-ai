import AddStockForm from "@/components/inventory/add-stock-form"
import { getSuppliers } from "@/app/actions/inventory"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AddStockPage() {
    const suppliers = await getSuppliers()

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Link
                    href="/dashboard/inventory"
                    className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Medicine</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Create a new product record and add initial stock.</p>
                </div>
            </div>

            <AddStockForm suppliers={suppliers} />
        </div>
    )
}
