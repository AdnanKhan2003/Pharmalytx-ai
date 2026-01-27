import { getDetailedReports } from "@/app/actions/reports"
import CategoryPieChart from "@/components/reports/category-pie-chart"
import { DollarSign, TrendingUp, Percent, BarChart3 } from "lucide-react"

export default async function ReportsPage() {
    const reports = await getDetailedReports()

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <MetricCard
                    title="Net Profit"
                    value={`$${reports.financials.profit.toFixed(2)}`}
                    icon={DollarSign}
                    color="text-green-600 bg-green-100"
                />
                <MetricCard
                    title="Profit Margin"
                    value={`${reports.financials.margin}%`}
                    icon={Percent}
                    color="text-blue-600 bg-blue-100"
                />
                <MetricCard
                    title="Total Revenue"
                    value={`$${reports.financials.revenue.toFixed(2)}`}
                    icon={TrendingUp}
                    color="text-indigo-600 bg-indigo-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        Sales by Category
                    </h3>
                    <CategoryPieChart data={reports.categoryData} />
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Top Performing Products</h3>
                    <div className="space-y-4">
                        {reports.topSellingProducts.map((product, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-4">#{i + 1}</span>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.quantity} units sold</p>
                                    </div>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">${product.revenue.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h4>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    )
}
