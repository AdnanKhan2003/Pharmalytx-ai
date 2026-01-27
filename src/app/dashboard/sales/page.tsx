import PosInterface from "@/components/sales/pos-interface"
import { prisma } from "@/lib/prisma"
import { ExportButton } from "@/components/ui/export-button"

export default async function SalesPage() {
    const products = await prisma.product.findMany({
        include: {
            batches: true
        },
        orderBy: {
            name: 'asc'
        }
    })

    const recentSales = await prisma.sale.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            cashier: { select: { name: true } },
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

    const exportData = recentSales.map(s => ({
        id: s.id,
        date: new Date(s.createdAt).toLocaleDateString(),
        time: new Date(s.createdAt).toLocaleTimeString(),
        amount: s.totalAmount.toFixed(2),
        method: s.paymentMethod,
        cashier: s.cashier?.name || 'Unknown',
        items: s.items.map(i => `${i.batch.product.name} (x${i.quantity})`).join(', ')
    }));

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex justify-end px-4">
                <ExportButton
                    data={exportData}
                    columns={[
                        { header: 'Sale ID', key: 'id' },
                        { header: 'Date', key: 'date' },
                        { header: 'Time', key: 'time' },
                        { header: 'Amount ($)', key: 'amount' },
                        { header: 'Payment Method', key: 'method' },
                        { header: 'Cashier', key: 'cashier' },
                        { header: 'Items', key: 'items' }
                    ]}
                    filename="sales_history"
                />
            </div>
            {/* Header is handled in layout, but we might want a different view here if we want full screen POS. 
                 For now, render inside dashboard layout. */}
            <PosInterface products={products} />
        </div>
    )
}
