"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Plus, Sparkles, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const { user, userProfile, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState<"login" | "signup" | null>(null)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-300">
            Promography
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:from-primary hover:to-accent hover:text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105"
              >
                <Link href="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Share Prompt
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-primary/30 transition-all duration-300 hover:scale-105"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                      <AvatarImage src={userProfile?.photoURL || "/placeholder.svg"} alt={userProfile?.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-semibold">
                        {userProfile?.displayName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-card/95 backdrop-blur-xl border-border/50"
                  align="end"
                  forceMount
                >
                  <div className="flex items-center justify-start gap-2 p-3">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold text-foreground">{userProfile?.displayName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/5">
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthModal("login")}
                className="hover:bg-primary/5 hover:text-primary transition-all duration-300"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAuthModal("signup")}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in-0 slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {showAuthModal === "login" ? "Welcome Back" : "Join Promography"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(null)} className="h-8 w-8 p-0">
                ×
              </Button>
            </div>
            {showAuthModal === "login" ? (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">Sign in to access your prompts and create new ones.</p>
                <Button
                  onClick={() => setShowAuthModal(null)}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Continue to Login
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button onClick={() => setShowAuthModal("signup")} className="text-primary hover:underline">
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Create your account and start sharing amazing AI prompts.
                </p>
                <Button
                  onClick={() => setShowAuthModal(null)}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Get Started
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => setShowAuthModal("login")} className="text-primary hover:underline">
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
