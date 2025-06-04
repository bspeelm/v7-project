import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { CreditCard, Shield, Bell } from 'lucide-react'
import type { User } from '@/types'

const settingsSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  preferences: z.object({
    units: z.enum(['metric', 'imperial']),
    timezone: z.string(),
  }),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface UserSettingsProps {
  user: User
  onUpdateSettings: (data: SettingsFormData) => void
  onUpdatePassword: (currentPassword: string, newPassword: string) => void
  onCancelSubscription: () => void
  onUpgradeSubscription: (tier: 'pro' | 'premium') => void
}

export function UserSettings({ 
  user, 
  onUpdateSettings, 
  onUpdatePassword,
  onCancelSubscription,
  onUpgradeSubscription 
}: UserSettingsProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      preferences: user.preferences,
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>()

  const onPasswordSubmit = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    onUpdatePassword(data.currentPassword, data.newPassword)
    resetPassword()
  }

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ]

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Settings
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onUpdateSettings)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Your name"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="units">Preferred Units</Label>
                <Select {...register('preferences.units')}>
                  <option value="imperial">Imperial (lbs, ft)</option>
                  <option value="metric">Metric (kg, cm)</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select {...register('preferences.timezone')}>
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </Select>
              </div>
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...registerPassword('currentPassword', { required: 'Current password is required' })}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...registerPassword('newPassword', { 
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registerPassword('confirmPassword', { required: 'Please confirm your password' })}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-slate-600 capitalize">{user.subscription.tier} Plan</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Status</p>
                <p className="font-medium capitalize">{user.subscription.status}</p>
              </div>
            </div>

            {user.subscription.tier === 'free' && (
              <div className="space-y-3">
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Pro Plan</h4>
                    <span className="text-lg font-bold">$9.99/mo</span>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1 mb-3">
                    <li>• Unlimited journal entries</li>
                    <li>• 100 AI coaching messages/month</li>
                    <li>• Advanced analytics</li>
                    <li>• Training plan generation</li>
                  </ul>
                  <Button 
                    onClick={() => onUpgradeSubscription('pro')}
                    className="w-full"
                  >
                    Upgrade to Pro
                  </Button>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Premium Plan</h4>
                    <span className="text-lg font-bold">$19.99/mo</span>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1 mb-3">
                    <li>• Everything in Pro</li>
                    <li>• Unlimited AI coaching</li>
                    <li>• Video analysis</li>
                    <li>• Custom training plans</li>
                    <li>• API access</li>
                  </ul>
                  <Button 
                    onClick={() => onUpgradeSubscription('premium')}
                    className="w-full"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            )}

            {user.subscription.tier === 'pro' && (
              <div className="space-y-3">
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Premium Plan</h4>
                    <span className="text-lg font-bold">$19.99/mo</span>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1 mb-3">
                    <li>• Unlimited AI coaching (vs 100 messages)</li>
                    <li>• Video analysis</li>
                    <li>• Custom training plans</li>
                    <li>• 1-on-1 AI strategy sessions</li>
                    <li>• API access</li>
                  </ul>
                  <Button 
                    onClick={() => onUpgradeSubscription('premium')}
                    className="w-full"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            )}

            {user.subscription.tier !== 'free' && user.subscription.status === 'active' && (
              <div className="pt-4 border-t">
                <Button 
                  variant="destructive" 
                  onClick={onCancelSubscription}
                  className="w-full"
                >
                  Cancel Subscription
                </Button>
                <p className="text-sm text-slate-600 mt-2 text-center">
                  Your subscription will remain active until {user.subscription.expiresAt}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Email notifications for journal reminders</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>Weekly progress reports</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>Training plan updates</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>New feature announcements</span>
              <input type="checkbox" className="rounded" />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}