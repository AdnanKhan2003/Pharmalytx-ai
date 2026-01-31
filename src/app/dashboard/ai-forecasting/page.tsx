import { getDemandForecast } from "@/app/actions/ai"
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { ExportButton } from "@/components/ui/export-button"

export default async function AiForecastingPage() {
    const forecasts = await getDemandForecast()

    const exportData = forecasts.map((f: any) => ({
        name: f.name,
        category: f.category,
        currentStock: f.currentStock,
        predictedDemand: f.predictedDemand,
        dailyRate: f.dailyRate,
        suggestion: f.suggestion,
        status: f.status
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <ExportButton
                    data={exportData}
                    columns={[
                        { header: 'Product Name', key: 'name' },
                        { header: 'Category', key: 'category' },
                        { header: 'Current Stock', key: 'currentStock' },
                        { header: 'Predicted Demand', key: 'predictedDemand' },
                        { header: 'Daily Rate', key: 'dailyRate' },
                        { header: 'Suggested Reorder', key: 'suggestion' },
                        { header: 'Status', key: 'status' }
                    ]}
                    filename="ai_forecast_report"
                    className="mb-4"
                />
            </div>

            <div className="bg-linear-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-yellow-300" />
                        AI Demand Forecasting
                    </h2>
                    <p className="text-violet-100 max-w-xl">
                        Our advanced predictive engine analyzes your last 30 days of sales data to forecast future demand and optimize your inventory levels.
                    </p>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reorder Recommendations */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Reorder Recommendations
                    </h3>
                    <div className="space-y-4">
                        {forecasts.filter((f: any) => f.status !== 'HEALTHY').map((item: any) => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-orange-50/50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30 gap-3 sm:gap-0">
                                <div className="w-full sm:w-auto">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {item.currentStock} | Predicted: {item.predictedDemand}</p>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block items-center">
                                    <span className="block text-sm font-bold text-orange-600">+{item.suggestion} Units</span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Suggested</span>
                                </div>
                            </div>
                        ))}
                        {forecasts.filter((f: any) => f.status !== 'HEALTHY').length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                No reorder recommendations currently. Inventory levels are optimal.
                            </div>
                        )}
                    </div>
                </div>

                {/* Healthy Stock / Trends */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Trending Products
                    </h3>
                    <div className="space-y-4">
                        {forecasts.slice(0, 5).map((item: any) => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors gap-3 sm:gap-0">
                                <div className="w-full sm:w-auto">
                                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm font-semibold text-blue-600">{item.dailyRate}/day</p>
                                        <p className="text-[10px] text-gray-400">Velocity</p>
                                    </div>
                                    {item.status === 'HEALTHY' && (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
