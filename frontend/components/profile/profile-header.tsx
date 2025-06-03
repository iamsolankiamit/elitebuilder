'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Edit3, 
  Github, 
  ExternalLink,
  Linkedin,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EditProfileDialog } from './edit-profile-dialog'
import type { User as UserType } from '@/lib/types'

interface ProfileHeaderProps {
  user: UserType
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500'
    if (score >= 75) return 'text-blue-500'
    if (score >= 50) return 'text-amber-500'
    return 'text-slate-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Elite'
    if (score >= 75) return 'Expert'
    if (score >= 50) return 'Advanced'
    if (score >= 25) return 'Intermediate'
    return 'Beginner'
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 bg-gradient-to-br from-background to-background/50 border-border/50 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || user.username}
                    className="h-32 w-32 rounded-full border-4 border-primary/20"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-4 border-primary/20 flex items-center justify-center">
                    <User className="h-16 w-16 text-primary/60" />
                  </div>
                )}
                
                {user.isAdmin && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-2 -right-2 bg-amber-500 hover:bg-amber-600"
                  >
                    Admin
                  </Badge>
                )}
                
                {user.isSponsor && (
                  <Badge 
                    variant="default" 
                    className="absolute -bottom-2 -right-2 bg-purple-500 hover:bg-purple-600"
                  >
                    Sponsor
                  </Badge>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="hover-lift"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {/* Main Info */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold gradient-text">
                  {user.name || user.username}
                </h1>
                {user.name && (
                  <p className="text-muted-foreground text-lg">@{user.username}</p>
                )}
                
                {user.bio && (
                  <p className="text-muted-foreground mt-4 max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                
                {user.timezone && (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 flex items-center justify-center text-xs">🕐</span>
                    <span>{user.timezone}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3">
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors hover-lift"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                
                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors hover-lift"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                
                {user.portfolioUrl && (
                  <a
                    href={user.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors hover-lift"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Portfolio</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Career Score */}
            <div className="lg:w-48">
              <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="space-y-2">
                  <Trophy className="h-8 w-8 mx-auto text-primary" />
                  <div>
                    <div className={`text-3xl font-bold ${getScoreColor(user.careerScore)}`}>
                      {user.careerScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Career Score</div>
                    <Badge variant="secondary" className="mt-2">
                      {getScoreLabel(user.careerScore)}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </motion.div>

      <EditProfileDialog
        user={user}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  )
} 