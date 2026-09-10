import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

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
          <CartesianGrid strokeDasharray="3 3" stroke="#292929" />

          <XAxis
            dataKey="category"
            stroke="#71717a"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              value.charAt(0).toUpperCase() + value.slice(1)
            }
          />

          <YAxis
            stroke="#71717a"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} zł`}
          />

          <Tooltip
            cursor={{ fill: "#222222" }}
            contentStyle={{
              backgroundColor: "#181818",
              border: "1px solid #292929",
              borderRadius: "8px",
              color: "#f5f5f5",
            }}
            formatter={(value) => [`${Number(value).toFixed(2)} zł`, "Spent"]}
            labelFormatter={(label) =>
              label.charAt(0).toUpperCase() + label.slice(1)
            }
          />

          <Bar dataKey="amount" fill="#ffffff" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategorySpendingChart;
