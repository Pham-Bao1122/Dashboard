'use client'

import { Power } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SensorData } from '@/components/hooks/use-firebase-data'

interface DeviceStatusCardsProps {
  data: SensorData | null
  loading: boolean
}

export function DeviceStatusCards({ data, loading }: DeviceStatusCardsProps) {
  const relays = [
    {
      label: 'Relay 1',
      state: data?.LORA_ACTIVATE ?? false,
      description: 'Primary control relay',
    },
    {
      label: 'Relay 2',
      state: data?.auto ?? false,
      description: 'Secondary control relay',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {relays.map((relay) => (
        <Card key={relay.label} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{relay.label}</CardTitle>
              <Power className={`w-4 h-4 ${relay.state ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{relay.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={relay.state ? 'default' : 'secondary'}>
                  {loading ? 'Loading...' : relay.state ? 'ON' : 'OFF'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
