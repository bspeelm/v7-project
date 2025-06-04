import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { UserSettings } from '@/components/profile/UserSettings'
import { useAuthStore } from '@/store/useAuthStore'
import type { AthleteProfile } from '@/types'

// Mock data - replace with API calls
const mockProfile: AthleteProfile = {
  userId: '1',
  age: 42,
  weight: 175,
  height: 178,
  yearsClimbing: 3,
  currentGrades: {
    indoor: {
      slab: 'V6',
      vertical: 'V5',
      overhang: 'V4'
    },
    outdoor: {
      sport: '5.11a',
      boulder: 'V4',
      trad: ''
    }
  },
  goals: [
    {
      id: '1',
      grade: 'V7',
      targetDate: '2025-12-31',
      type: 'boulder',
      description: 'Send my first V7 boulder'
    }
  ],
  weaknesses: ['Overhang climbing', 'Dynamic moves', 'Core tension'],
  strengths: ['Crimps', 'Technical footwork', 'Route reading'],
  dietaryRestrictions: ['Vegetarian'],
  injuryHistory: [],
  updatedAt: new Date().toISOString()
}

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('profile')

  if (!user) return null

  const handleProfileSubmit = (data: any) => {
    console.log('Profile update:', data)
    // TODO: API call to update profile
  }

  const handleSettingsUpdate = (data: any) => {
    console.log('Settings update:', data)
    // TODO: API call to update settings
  }

  const handlePasswordUpdate = (_currentPassword: string, _newPassword: string) => {
    console.log('Password update')
    // TODO: API call to update password
  }

  const handleCancelSubscription = () => {
    console.log('Cancel subscription')
    // TODO: API call to cancel subscription
  }

  const handleUpgradeSubscription = (tier: 'pro' | 'premium') => {
    console.log('Upgrade to:', tier)
    // TODO: API call to upgrade subscription
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile & Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Athlete Profile</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <ProfileForm 
            profile={mockProfile} 
            onSubmit={handleProfileSubmit}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <UserSettings
            user={user}
            onUpdateSettings={handleSettingsUpdate}
            onUpdatePassword={handlePasswordUpdate}
            onCancelSubscription={handleCancelSubscription}
            onUpgradeSubscription={handleUpgradeSubscription}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}