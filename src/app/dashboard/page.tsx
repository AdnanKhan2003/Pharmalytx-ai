import { getDashboardMetrics } from "@/app/actions/dashboard"
import SalesChart from "@/components/dashboard/sales-chart"
import { ArrowUpRight, DollarSign, Package, AlertTriangle, Activity } from "lucide-react"
import { ExportButton } from "@/components/ui/export-button"

export default async function DashboardPage() {
    const metrics = await getDashboardMetrics()

    const recentSalesExportData = metrics.recentSales.map(sale => ({
        id: sale.id,
        date: new Date(sale.date).toLocaleDateString(),
        amount: sale.amount.toFixed(2),
        items: sale.itemsList
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <ExportButton
                    data={recentSalesExportData}
                    columns={[
                        { header: 'Order ID', key: 'id' },
                        { header: 'Date', key: 'date' },
                        { header: 'Amount ($)', key: 'amount' },
                        { header: 'Items', key: 'items' }
                    ]}
                    filename="recent_sales"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Metric Cards */}
                <MetricCard
                    title="Total Revenue"
                    value={`$${metrics.revenue.toFixed(2)}`}
                    change="All time"
                    icon={DollarSign}
                    trend="up"
                />
                <MetricCard
                    title="Active Inventory"
                    value={metrics.totalStock.toString()}
                    change="Products in stock"
                    icon={Package}
                    trend="neutral"
                />
                <MetricCard
                    title="Low Stock Alerts"
                    value={metrics.lowStockCount.toString()}
                    change="Items need reorder"
                    icon={AlertTriangle}
                    trend="down"
                    className="border-red-100 bg-red-50/50"
                    iconClassName="text-red-600 bg-red-100"
                />
                <MetricCard
                    title="Expiring Soon"
                    value={metrics.expiringSoonCount.toString()}
                    change="Next 30 days"
                    icon={Activity}
                    trend="down"
                    className="border-orange-100 bg-orange-50/50"
                    iconClassName="text-orange-600 bg-orange-100"
                />

                {/* Charts Section */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-[400px]">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Sales Analytics</h3>
                    <SalesChart data={metrics.chartData} />
                </div>

                {/* Recent Activity */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Sales</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {metrics.recentSales.map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold">#</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Order</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(sale.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">${sale.amount.toFixed(2)}</span>
                            </div>
                        ))}
                        {metrics.recentSales.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4 col-span-full">No recent sales</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({
    title,
    value,
    change,
    icon: Icon,
    className,
    iconClassName,
    trend
}: {
    title: string,
    value: string,
    change: string,
    icon: any,
    className?: string,
    iconClassName?: string,
    trend?: 'up' | 'down' | 'neutral'
}) {
    return (
        <div className={`p-6 rounded-2xl border border-white/60 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
                <div className={`p-2 rounded-lg ${iconClassName || 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500" />}
                        {change}
                    </p>
                </div>
            </div>
        </div>
    )
}

