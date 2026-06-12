import React from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export function SparkLine({ data, color, height = 48 }: { data: number[], color: string, height?: number }) {
  const chartData = data.map((v, i) => ({ val: v, idx: i }))
  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line 
            type="monotone" 
            dataKey="val" 
            stroke={color} 
            strokeWidth={1.5} 
            dot={false} 
            isAnimationActive={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
