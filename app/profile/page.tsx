"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PromptCard } from "@/components/prompts/PromptCard"
import { ProfileEditForm } from "@/components/profile/ProfileEditForm"
import { Edit, Heart, FileText, TrendingUp, Calendar } from "lucide-react"
import { getPromptsByUser, type Prompt } from "@/lib/firestore"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
  const [likedPrompts, setLikedPrompts] = useState<Prompt[]>([])
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalLikes: 0,
    totalViews: 0,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    } else if (user) {
      loadUserData()
    }
  }, [user, loading])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoadingData(true)

      // Get user's prompts
      const prompts = await getPromptsByUser(user.uid)
      setUserPrompts(prompts)

      // Get liked prompts
      const likedPromptsQuery = query(collection(db, "prompts"), where("likedBy", "array-contains", user.uid))
      const likedSnapshot = await getDocs(likedPromptsQuery)
      const liked = likedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Prompt[]
      setLikedPrompts(liked)

      // Calculate stats
      const totalLikes = prompts.reduce((sum, prompt) => sum + prompt.likes, 0)
      const totalViews = prompts.reduce((sum, prompt) => sum + prompt.views, 0)

      setStats({
        totalPrompts: prompts.length,
        totalLikes,
        totalViews,
      })
    } catch (error) {
      console.error("Failed to load user data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <ProfileEditForm onCancel={() => setIsEditing(false)} onSave={() => setIsEditing(false)} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile?.photoURL || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {userProfile?.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-serif font-bold">{userProfile?.displayName || "Anonymous"}</h1>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>

                  {userProfile?.bio && <p className="text-muted-foreground">{userProfile.bio}</p>}

                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {userProfile?.createdAt?.toDate().toLocaleDateString()}</span>
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

          {/* Prompts Tabs */}
          <Tabs defaultValue="shared" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shared">My Prompts ({userPrompts.length})</TabsTrigger>
              <TabsTrigger value="liked">Liked Prompts ({likedPrompts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="shared" className="space-y-6">
              {userPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} onUpdate={loadUserData} showEditButton={true} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      You haven't shared any prompts yet. Start sharing your creative AI prompts with the community!
                    </p>
                    <Button asChild>
                      <a href="/create">Share Your First Prompt</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="liked" className="space-y-6">
              {likedPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {likedPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} onUpdate={loadUserData} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No liked prompts yet</h3>
                    <p className="text-muted-foreground text-center">
                      Start exploring and liking prompts that inspire you!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
