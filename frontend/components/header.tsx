'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { LoginButton } from '@/components/auth/login-button'
import { UserMenu } from '@/components/auth/user-menu'
import { useAuth } from '@/hooks/use-auth'

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover-lift',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'

export function Header() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <motion.header
      className="sticky top-0 z-40 w-full border-b bg-background/50 backdrop-blur-md supports-[backdrop-filter]:bg-background/30"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="font-bold text-xl gradient-text"
            >
              EliteBuilders
            </motion.div>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Challenges</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Featured Challenge
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Build an AI-powered product recommendation engine
                          </p>
                          <div className="mt-4 flex items-center">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                              $25,000 Prize
                            </span>
                          </div>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/challenges" title="All Challenges">
                      Browse all available challenges
                    </ListItem>
                    <ListItem href="/challenges/popular" title="Popular">
                      Most popular challenges this month
                    </ListItem>
                    <ListItem href="/challenges/new" title="New">
                      Recently added challenges
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Leaderboard</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href="/leaderboard/global" title="Global Rankings">
                      See the top builders worldwide
                    </ListItem>
                    <ListItem href="/leaderboard/monthly" title="Monthly Champions">
                      This month's rising stars
                    </ListItem>
                    <ListItem href="/leaderboard/categories" title="By Category">
                      Rankings by challenge category
                    </ListItem>
                    <ListItem href="/leaderboard/sponsors" title="Sponsor Favorites">
                      Submissions loved by sponsors
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/sponsors" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Sponsors
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <LoginButton variant="ghost" size="sm" className="hover-lift" />
                <Button variant="premium" size="pill-sm" className="hover-lift glow-on-hover">
                  Join Now
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
      
      {/* Decorative bottom border with gradient */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
    </motion.header>
  )
} 