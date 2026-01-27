import ReturnInterface from "@/components/returns/return-interface"
import { ArchiveRestore } from "lucide-react"

export default function ReturnsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                    <ArchiveRestore className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Return Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Process refund and restore inventory</p>
                </div>
            </div>

            <ReturnInterface />
        </div>
    )
}
