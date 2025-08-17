"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Eye, Copy, Check, User, Edit } from "lucide-react"
import { likePrompt, unlikePrompt, incrementViews, type Prompt } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface PromptCardProps {
  prompt: Prompt
  onUpdate?: () => void
  showEditButton?: boolean
}

export function PromptCard({ prompt, onUpdate, showEditButton = false }: PromptCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(prompt.likedBy?.includes(user?.uid || ""))
  const [likes, setLikes] = useState(prompt.likes)
  const [copied, setCopied] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const isAuthor = user?.uid === prompt.authorId

  const handleLike = async () => {
    if (!user || isLiking) return

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
      onUpdate?.()
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

  const handleView = async () => {
    try {
      await incrementViews(prompt.id)
    } catch (error) {
      // Silent fail for view tracking
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-border">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${prompt.authorId}`}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-8 w-8 ring-2 ring-background">
              <AvatarImage src={prompt.authorAvatar || "/placeholder.svg"} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{prompt.authorName}</p>
              <p className="text-xs text-muted-foreground">{prompt.createdAt?.toDate().toLocaleDateString()}</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{prompt.views}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!user || isLiking}
              className={`flex items-center space-x-1 transition-all hover:scale-105 ${
                isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
              }`}
            >
              <Heart className={`h-4 w-4 transition-all ${isLiked ? "fill-current scale-110" : ""}`} />
              <span>{likes}</span>
            </Button>
          </div>
        </div>

        <div>
          <Link href={`/prompt/${prompt.id}`}>
            <CardTitle className="text-lg font-serif line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
              {prompt.title}
            </CardTitle>
          </Link>
          <CardDescription className="mt-2 line-clamp-2">{prompt.description}</CardDescription>
        </div>

        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs hover:bg-primary/20 transition-colors cursor-default"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Link href={`/prompt/${prompt.id}`}>
          <div className="bg-muted/50 p-4 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors cursor-pointer">
            <p className="text-sm font-mono line-clamp-4 leading-relaxed">{prompt.prompt}</p>
          </div>
        </Link>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1 transition-all hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Prompt
              </>
            )}
          </Button>

          {showEditButton && isAuthor && (
            <Button variant="outline" size="sm" asChild className="transition-all hover:bg-secondary bg-transparent">
              <Link href={`/edit/${prompt.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
