"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { LoginForm } from "@/components/auth/LoginForm"
import { SignupForm } from "@/components/auth/SignupForm"
import { Header } from "@/components/layout/Header"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { Search, TrendingUp, Users, Zap } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />

        <main className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Section */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-serif font-bold leading-tight">
                  Share Creative
                  <span className="text-primary block">AI Prompts</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Discover and share the best AI prompts for any task. From writing emails to complex coding challenges,
                  find the perfect prompt for your needs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-card">
                  <Search className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Discover</h3>
                    <p className="text-sm text-muted-foreground">Find perfect prompts</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-card">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Trending</h3>
                    <p className="text-sm text-muted-foreground">Popular prompts</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-card">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Community</h3>
                    <p className="text-sm text-muted-foreground">Share with others</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-card">
                  <Zap className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Efficient</h3>
                    <p className="text-sm text-muted-foreground">Save time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Forms */}
            <div className="flex justify-center">
              {authMode === "login" ? (
                <LoginForm onToggleMode={() => setAuthMode("signup")} />
              ) : (
                <SignupForm onToggleMode={() => setAuthMode("login")} />
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>
    </div>
  )
}
