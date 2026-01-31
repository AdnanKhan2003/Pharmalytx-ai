import ReturnInterface from "@/components/returns/return-interface"
import { ArchiveRestore } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { ExportButton } from "@/components/ui/export-button"

export default async function ReturnsPage() {
    const returns = await prisma.returnRecord.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
            sale: {
                select: { id: true, paymentMethod: true }
            },
            items: {
                include: {
                    batch: {
                        include: {
                            product: { select: { name: true } }
                        }
                    }
                }
            }
        }
    })

    const exportData = returns.map(r => ({
        returnId: r.id,
        saleId: r.saleId,
        date: new Date(r.createdAt).toLocaleDateString(),
        reason: r.reason,
        refundAmount: r.refundAmount.toFixed(2),
        items: r.items.map(i => `${i.batch.product.name} (x${i.quantity})`).join(', ')
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3 mb-2 md:mb-0">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                        <ArchiveRestore className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Return Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">Process refund and restore inventory</p>
                    </div>
                </div>
                <div className="w-full md:w-auto flex justify-end">
                    <ExportButton
                        data={exportData}
                        columns={[
                            { header: 'Return ID', key: 'returnId' },
                            { header: 'Original Sale ID', key: 'saleId' },
                            { header: 'Date', key: 'date' },
                            { header: 'Reason', key: 'reason' },
                            { header: 'Refund Amount ($)', key: 'refundAmount' },
                            { header: 'Items', key: 'items' }
                        ]}
                        filename="returns_history"
                    />
                </div>
            </div>

            <ReturnInterface />
        </div>
    )
}
