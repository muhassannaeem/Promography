"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PromptCard } from "@/components/prompts/PromptCard"
import { FileText, Heart, TrendingUp, Calendar, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPromptsByUser, type Prompt } from "@/lib/firestore"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"

interface PublicUserProfile {
  uid: string
  displayName: string
  bio: string
  photoURL: string
  createdAt: any
}

export default function PublicProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const userId = params.userId as string

  const [userProfile, setUserProfile] = useState<PublicUserProfile | null>(null)
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalLikes: 0,
    totalViews: 0,
  })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (userId) {
      loadUserProfile()
    }
  }, [userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)

      // Get user profile
      const userDoc = await getDoc(doc(db, "users", userId))
      if (!userDoc.exists()) {
        setNotFound(true)
        return
      }

      const profile = userDoc.data() as PublicUserProfile
      setUserProfile(profile)

      // Get user's prompts
      const prompts = await getPromptsByUser(userId)
      setUserPrompts(prompts)

      // Calculate stats
      const totalLikes = prompts.reduce((sum, prompt) => sum + prompt.likes, 0)
      const totalViews = prompts.reduce((sum, prompt) => sum + prompt.views, 0)

      setStats({
        totalPrompts: prompts.length,
        totalLikes,
        totalViews,
      })
    } catch (error) {
      console.error("Failed to load user profile:", error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (notFound || !userProfile) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
              <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
              <Button asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Redirect to own profile if viewing self
  if (user && user.uid === userId) {
    window.location.href = "/profile"
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Back Button */}
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile.photoURL || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {userProfile.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div>
                    <h1 className="text-2xl font-serif font-bold">{userProfile.displayName || "Anonymous"}</h1>
                  </div>

                  {userProfile.bio && <p className="text-muted-foreground">{userProfile.bio}</p>}

                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {userProfile.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPrompts}</div>
                <p className="text-xs text-muted-foreground">Prompts shared</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLikes}</div>
                <p className="text-xs text-muted-foreground">Likes received</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-muted-foreground">Views received</p>
              </CardContent>
            </Card>
          </div>

          {/* User's Prompts */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold">
              {userProfile.displayName}'s Prompts ({userPrompts.length})
            </h2>

            {userPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} onUpdate={loadUserProfile} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
                  <p className="text-muted-foreground text-center">
                    {userProfile.displayName} hasn't shared any prompts yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
