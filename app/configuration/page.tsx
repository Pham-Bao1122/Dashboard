'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useFirebaseData } from '@/components/hooks/use-firebase-data'

interface ConfigFormData {
  dataInterval: number
  tempThreshold: number
  humidityThreshold: number
  autoSchedule: boolean
}

export default function ConfigurationPage() {
  const [saving, setSaving] = useState(false)
  const { updateConfig } = useFirebaseData()
  const { register, handleSubmit, watch, setValue } = useForm<ConfigFormData>({
    defaultValues: {
      dataInterval: 2,
      tempThreshold: 35,
      humidityThreshold: 80,
      autoSchedule: false,
    },
  })

  const autoSchedule = watch('autoSchedule')

  const onSubmit = async (data: ConfigFormData) => {
    setSaving(true)
    await updateConfig(data)
    setSaving(false)
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configuration</h1>
          <p className="text-muted-foreground">
            Manage system settings and alert thresholds
          </p>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Data Collection Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Collection</CardTitle>
              <CardDescription>Configure how frequently data is collected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataInterval">Data Transmission Interval (seconds)</Label>
                <Input
                  id="dataInterval"
                  type="number"
                  min="1"
                  max="60"
                  {...register('dataInterval', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  How often sensor data is transmitted to the server
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Alert Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Thresholds</CardTitle>
              <CardDescription>Set limits for automatic alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tempThreshold">Temperature Threshold (°C)</Label>
                <Input
                  id="tempThreshold"
                  type="number"
                  min="0"
                  max="60"
                  {...register('tempThreshold', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Alert will trigger when temperature exceeds this value
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="humidityThreshold">Humidity Threshold (%)</Label>
                <Input
                  id="humidityThreshold"
                  type="number"
                  min="0"
                  max="100"
                  {...register('humidityThreshold', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Alert will trigger when humidity exceeds this value
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Settings</CardTitle>
              <CardDescription>Additional system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Auto Schedule</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable automated scheduling for device control
                  </p>
                </div>
                <Switch
                  checked={autoSchedule}
                  onCheckedChange={(checked) => setValue('autoSchedule', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </form>
      </div>
    </LayoutWrapper>
  )
}
