import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { getCategory } from "../constants/categories";

function CategorySpendingChart({ data }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />

          <XAxis
            dataKey="category"
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => getCategory(value).label}
          />

          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} zł`}
          />

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              backgroundColor: "#111113",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              color: "#f5f5f5",
            }}
            formatter={(value) => [`${Number(value).toFixed(2)} zł`, "Spent"]}
            labelFormatter={(label) => getCategory(label).label}
          />

          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={getCategory(entry.category).chartColor}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategorySpendingChart;
