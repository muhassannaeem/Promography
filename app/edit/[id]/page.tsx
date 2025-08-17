"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save, ArrowLeft } from "lucide-react"
import { getPromptById, updatePrompt, type Prompt } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function EditPromptPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [promptText, setPromptText] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingPrompt, setLoadingPrompt] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    } else if (user) {
      loadPrompt()
    }
  }, [user, loading, params.id])

  const loadPrompt = async () => {
    try {
      const promptData = await getPromptById(params.id)
      if (!promptData) {
        toast({
          title: "Error",
          description: "Prompt not found",
          variant: "destructive",
        })
        router.push("/profile")
        return
      }

      // Check if user is the author
      if (promptData.authorId !== user?.uid) {
        toast({
          title: "Unauthorized",
          description: "You can only edit your own prompts",
          variant: "destructive",
        })
        router.push("/profile")
        return
      }

      setPrompt(promptData)
      setTitle(promptData.title)
      setDescription(promptData.description)
      setPromptText(promptData.prompt)
      setTags(promptData.tags)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load prompt",
        variant: "destructive",
      })
      router.push("/profile")
    } finally {
      setLoadingPrompt(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !prompt) return

    if (!title.trim() || !description.trim() || !promptText.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await updatePrompt(prompt.id, {
        title: title.trim(),
        description: description.trim(),
        prompt: promptText.trim(),
        tags,
      })

      toast({
        title: "Success!",
        description: "Your prompt has been updated successfully",
      })

      router.push("/profile")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingPrompt) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <h1 className="text-3xl font-serif font-bold">Edit Prompt</h1>
          <p className="text-muted-foreground mt-2">Update your AI prompt to share with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a catchy title for your prompt"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{title.length}/100 characters</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your prompt does and how to use it"
                  maxLength={500}
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{description.length}/500 characters</p>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-2">
                  Tags (up to 5)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {tags.length < 5 && (
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag (e.g., email, coding, creative)"
                      maxLength={20}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>The Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                  Your AI Prompt *
                </label>
                <Textarea
                  id="prompt"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Write your AI prompt here. Be specific and clear about what you want the AI to do..."
                  maxLength={2000}
                  rows={8}
                  className="font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{promptText.length}/2000 characters</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Prompt
                </>
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/profile">Cancel</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
