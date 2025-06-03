'use client'

import { motion } from 'framer-motion'
import { 
  Trophy, 
  FileText, 
  Activity, 
  User,
  Calendar,
  Target,
  Star,
  TrendingUp
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { User as UserType, Badge as BadgeType, Submission } from '@/lib/types'

interface PublicProfileTabsProps {
  user: UserType
  activeTab: string
  onTabChange: (tab: string) => void
}

interface ActivityItem {
  id: number
  type: string
  description: string
  createdAt: string
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'badges', label: 'Badges', icon: Trophy },
  { id: 'submissions', label: 'Submissions', icon: FileText },
  { id: 'activity', label: 'Activity', icon: Activity },
]

export function PublicProfileTabs({ user, activeTab, onTabChange }: PublicProfileTabsProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab user={user} />
      case 'badges':
        return <BadgesTab />
      case 'submissions':
        return <SubmissionsTab />
      case 'activity':
        return <ActivityTab />
      default:
        return <OverviewTab user={user} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-1 py-4 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    layoutId="publicActiveTab"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  )
}

function OverviewTab({ user }: { user: UserType }) {
  const stats = [
    { label: 'Career Score', value: user.careerScore.toFixed(1), icon: TrendingUp, color: 'text-primary' },
    { label: 'Total Badges', value: '0', icon: Trophy, color: 'text-amber-500' },
    { label: 'Submissions', value: '0', icon: FileText, color: 'text-blue-500' },
    { label: 'Challenges Won', value: '0', icon: Target, color: 'text-emerald-500' },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6 text-center hover-lift">
              <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

function BadgesTab() {
  // Mock badges data - replace with actual API call
  const badges: BadgeType[] = []

  return (
    <div className="space-y-6">
      {badges.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 text-center hover-lift">
                <div className="h-16 w-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{badge.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                <Badge variant="secondary">{badge.type}</Badge>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No badges yet</h3>
          <p className="text-muted-foreground">
            This user hasn&apos;t earned any badges yet.
          </p>
        </Card>
      )}
    </div>
  )
}

function SubmissionsTab() {
  // Mock submissions data - replace with actual API call
  const submissions: Submission[] = []

  return (
    <div className="space-y-6">
      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission, index) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 hover-lift">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Challenge Title</h3>
                    <p className="text-sm text-muted-foreground">Submitted on {new Date(submission.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{submission.status}</Badge>
                      {submission.score && <Badge variant="outline">Score: {submission.score}</Badge>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
          <p className="text-muted-foreground">
            This user hasn&apos;t made any submissions yet.
          </p>
        </Card>
      )}
    </div>
  )
}

function ActivityTab() {
  // Mock activity data - replace with actual API call
  const activities: ActivityItem[] = []

  return (
    <div className="space-y-6">
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
          <p className="text-muted-foreground">
            This user hasn&apos;t been active recently.
          </p>
        </Card>
      )}
    </div>
  )
} 