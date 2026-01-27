export default function DashboardLoading() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-gray-200/50 rounded-2xl"></div>
                ))}
            </div>
            <div className="h-96 bg-gray-200/50 rounded-2xl"></div>
        </div>
    )
}
