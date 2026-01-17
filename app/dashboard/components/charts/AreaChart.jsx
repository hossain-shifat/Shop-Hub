'use client'

import { LineChart as RechartsLine, Line, AreaChart as RechartsArea, Area, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function AreaChart({ data, dataKeys, title, colors = ['#8b5cf6', '#ec4899'] }) {
    return (
        <div className="card bg-base-200 p-6">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RechartsArea data={data}>
                    <defs>
                        {dataKeys.map((key, index) => (
                            <linearGradient key={key.key} id={`color-${key.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.2)" />
                    <XAxis dataKey="name" stroke="currentColor" style={{ fontSize: '12px' }} />
                    <YAxis stroke="currentColor" style={{ fontSize: '12px' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'oklch(var(--b1))',
                            border: '1px solid oklch(var(--bc) / 0.2)',
                            borderRadius: '8px'
                        }}
                    />
                    <Legend />
                    {dataKeys.map((key, index) => (
                        <Area
                            key={key.key}
                            type="monotone"
                            dataKey={key.key}
                            name={key.name}
                            stroke={colors[index % colors.length]}
                            fillOpacity={1}
                            fill={`url(#color-${key.key})`}
                            strokeWidth={2}
                        />
                    ))}
                </RechartsArea>
            </ResponsiveContainer>
        </div>
    )
}
