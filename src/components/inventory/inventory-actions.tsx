'use client'

import { Edit, Trash2 } from "lucide-react"
import { deleteProduct } from "@/app/actions/inventory"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import DeleteConfirmationModal from "@/components/ui/delete-modal"

export default function InventoryActions({ productId }: { productId: string }) {
    const router = useRouter()

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        const result = await deleteProduct(productId)
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
        <div className="flex items-center justify-end gap-2">
            <Link
                href={`/dashboard/inventory/${productId}/edit`}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Edit Product"
            >
                <Edit className="h-4 w-4" />
            </Link>
            <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete Product"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Product?"
                description="Are you sure you want to delete this product? This will also delete all associated inventory batches. This action cannot be undone."
                loading={loading}
            />
        </div>
    )
}
