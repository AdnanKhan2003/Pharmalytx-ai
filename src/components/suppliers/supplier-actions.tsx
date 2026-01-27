'use client'

import { Edit, Trash2 } from "lucide-react"
import { deleteSupplier } from "@/app/actions/inventory"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import DeleteConfirmationModal from "@/components/ui/delete-modal"

export default function SupplierActions({ supplierId }: { supplierId: string }) {
    const router = useRouter()

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        const result = await deleteSupplier(supplierId)
        setLoading(false)
        setShowDeleteModal(false)

        if (result.success) {
            toast.success(result.message)
            router.refresh()
        } else {
            toast.error(result.message)
        }
    }



    return (
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
                href={`/dashboard/suppliers/${supplierId}/edit`}
                className="text-xs p-2 flex items-center gap-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors font-medium"
                title="Edit Supplier"
            >
                <Edit className="h-3 w-3" />
                Edit
            </Link>
            <button
                onClick={() => setShowDeleteModal(true)}
                className="text-xs p-2 flex items-center gap-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors font-medium"
                title="Delete Supplier"
            >
                <Trash2 className="h-3 w-3" />
                Delete
            </button>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Supplier?"
                description="Are you sure you want to delete this supplier? This action cannot be undone and will fail if the supplier has associated products."
                loading={loading}
            />
        </div>
    )
}
