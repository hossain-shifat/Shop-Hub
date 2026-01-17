export function StatsCard({ title, value, change, icon: Icon, trend = 'up' }) {
    return (
        <div className="card bg-base-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-base-content/60 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold mb-2">{value}</h3>
                    {change && (
                        <p className={`text-sm font-semibold ${trend === 'up' ? 'text-success' : 'text-error'}`}>
                            {trend === 'up' ? '↑' : '↓'} {change}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${trend === 'up' ? 'bg-success/10' : 'bg-error/10'
                        }`}>
                        <Icon className={`w-6 h-6 ${trend === 'up' ? 'text-success' : 'text-error'}`} />
                    </div>
                )}
            </div>
        </div>
    )
}
