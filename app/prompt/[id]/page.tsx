"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Eye, Copy, Check, User, ArrowLeft } from "lucide-react"
import { getPromptById, likePrompt, unlikePrompt, incrementViews, type Prompt } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function PromptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadPrompt()
    }
  }, [params.id, user])

  const loadPrompt = async () => {
    try {
      setLoading(true)
      const promptData = await getPromptById(params.id as string)
      if (promptData) {
        setPrompt(promptData)
        setIsLiked(promptData.likedBy?.includes(user?.uid || "") || false)
        setLikes(promptData.likes)
        // Increment view count
        await incrementViews(promptData.id)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Failed to load prompt:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user || !prompt || isLiking) return

    setIsLiking(true)
    try {
      if (isLiked) {
        await unlikePrompt(prompt.id, user.uid)
        setLikes((prev) => prev - 1)
        setIsLiked(false)
      } else {
        await likePrompt(prompt.id, user.uid)
        setLikes((prev) => prev + 1)
        setIsLiked(true)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleCopy = async () => {
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt.prompt)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      })
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

  if (!prompt) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Prompt not found</h1>
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Prompt Detail Card */}
          <Card>
            <CardHeader className="space-y-4">
              {/* Author Info */}
              <div className="flex items-center justify-between">
                <Link
                  href={`/profile/${prompt.authorId}`}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-background">
                    <AvatarImage src={prompt.authorAvatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-lg">{prompt.authorName}</p>
                    <p className="text-sm text-muted-foreground">{prompt.createdAt?.toDate().toLocaleDateString()}</p>
                  </div>
                </Link>

                <div className="flex items-center space-x-6 text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span className="font-medium">{prompt.views + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleLike}
                    disabled={!user || isLiking}
                    className={`flex items-center space-x-2 transition-all hover:scale-105 ${
                      isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                    }`}
                  >
                    <Heart className={`h-5 w-5 transition-all ${isLiked ? "fill-current scale-110" : ""}`} />
                    <span className="font-medium">{likes}</span>
                  </Button>
                </div>
              </div>

              {/* Title and Description */}
              <div className="space-y-3">
                <CardTitle className="text-3xl font-serif leading-tight">{prompt.title}</CardTitle>
                <CardDescription className="text-lg leading-relaxed">{prompt.description}</CardDescription>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-sm px-3 py-1 hover:bg-primary/20 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Prompt Content */}
              <div className="bg-muted/50 p-6 rounded-lg border border-border/50">
                <h3 className="text-lg font-semibold mb-4">Prompt</h3>
                <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">{prompt.prompt}</p>
              </div>

              {/* Copy Button */}
              <Button onClick={handleCopy} size="lg" className="w-full transition-all hover:scale-[1.02]">
                {copied ? (
                  <>
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
