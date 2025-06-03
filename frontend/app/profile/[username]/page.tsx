'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { PublicProfileHeader } from '@/components/profile/public-profile-header'
import { PublicProfileTabs } from '@/components/profile/public-profile-tabs'
import type { User } from '@/lib/types'

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return

      try {
        setIsLoading(true)
        setError(null)
        
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock user data - replace with actual API response
        const mockUser: User = {
          id: 1,
          email: `${username}@example.com`,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          username: username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          githubId: `github-${username}`,
          githubUrl: `https://github.com/${username}`,
          portfolioUrl: `https://${username}.dev`,
          linkedinUrl: `https://linkedin.com/in/${username}`,
          bio: `I'm a passionate developer who loves building innovative solutions with AI and modern web technologies.`,
          location: 'San Francisco, CA',
          timezone: 'PST',
          careerScore: Math.floor(Math.random() * 100),
          isSponsor: false,
          isAdmin: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
        
        setUser(mockUser)
      } catch (err) {
        setError('Failed to load user profile')
        console.error('Error fetching user profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [username])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Profile Not Found</h1>
            <p className="text-muted-foreground">
              {error || 'The user profile you are looking for does not exist.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <PublicProfileHeader user={user} />
          <PublicProfileTabs 
            user={user} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </motion.div>
      </main>
    </div>
  )
} 