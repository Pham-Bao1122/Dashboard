'use client'

import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const historicalData = [
  { date: 'Mon', temp: 28, humidity: 65, light: 450 },
  { date: 'Tue', temp: 29, humidity: 68, light: 480 },
  { date: 'Wed', temp: 27, humidity: 62, light: 520 },
  { date: 'Thu', temp: 30, humidity: 70, light: 410 },
  { date: 'Fri', temp: 31, humidity: 72, light: 390 },
  { date: 'Sat', temp: 32, humidity: 75, light: 350 },
  { date: 'Sun', temp: 29, humidity: 68, light: 460 },
]

export default function HistoryPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">History & Analytics</h1>
          <p className="text-muted-foreground">
            View historical data and sensor analytics
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Temperature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">29.4°C</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Humidity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68.6%</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Peak Light Intensity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">520 lux</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Historical Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Summary</CardTitle>
            <CardDescription>Average values for each day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="date" stroke="currentColor" opacity={0.5} />
                <YAxis stroke="currentColor" opacity={0.5} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="temp" fill="hsl(var(--chart-1))" name="Temp (°C)" />
                <Bar dataKey="humidity" fill="hsl(var(--chart-2))" name="Humidity (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Records</CardTitle>
            <CardDescription>Sensor readings from the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Temperature</th>
                    <th className="text-left py-3 px-4 font-semibold">Humidity</th>
                    <th className="text-left py-3 px-4 font-semibold">Light Intensity</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4">{row.date}</td>
                      <td className="py-3 px-4">{row.temp}°C</td>
                      <td className="py-3 px-4">{row.humidity}%</td>
                      <td className="py-3 px-4">{row.light} lux</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
