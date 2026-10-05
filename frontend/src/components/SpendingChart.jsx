import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const data = [
  { day: "1", amount: 120 },
  { day: "5", amount: 80 },
  { day: "10", amount: 240 },
  { day: "15", amount: 180 },
  { day: "20", amount: 320 },
  { day: "25", amount: 210 },
  { day: "30", amount: 390 },
]

function SpendingChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.08)"
          />

          <XAxis
            dataKey="day"
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#111113",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              color: "#f5f5f5",
            }}
          />

          <Area
            type="monotone"
            dataKey="amount"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.12}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SpendingChart