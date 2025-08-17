"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Eye } from "lucide-react"

interface PromptPreviewProps {
  title: string
  description: string
  prompt: string
  tags: string[]
  authorName?: string
  authorAvatar?: string
}

export function PromptPreview({
  title,
  description,
  prompt,
  tags,
  authorName = "You",
  authorAvatar,
}: PromptPreviewProps) {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authorAvatar || "/placeholder.svg"} />
              <AvatarFallback>{authorName?.charAt(0)?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{authorName}</p>
              <p className="text-xs text-muted-foreground">Just now</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>0</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>0</span>
            </div>
          </div>
        </div>

        <div>
          <CardTitle className="text-lg font-serif line-clamp-2">{title}</CardTitle>
          <CardDescription className="mt-2 line-clamp-2">{description}</CardDescription>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-mono line-clamp-6">{prompt}</p>
        </div>
      </CardContent>
    </Card>
  )
}
