import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import type { Metrics } from '@/types'

interface Props {
  metrics: Metrics
}

export function RadarChartComponent({ metrics }: Props) {
  const data = [
    { subject: 'Productivity', A: metrics.productivity.value, fullMark: 10 },
    { subject: 'Reliability', A: metrics.reliability.value, fullMark: 10 },
    { subject: 'Impact', A: metrics.impact.value, fullMark: 10 },
    { subject: 'Mastery', A: metrics.mastery.value, fullMark: 10 },
    { subject: 'Endurance', A: metrics.endurance.value, fullMark: 10 },
  ]

  return (
    <div className="w-full h-[350px] flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Dev Stats"
            dataKey="A"
            stroke="#f97316"
            strokeWidth={2}
            fill="#fdba74"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
