"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, X, Plus, ArrowLeft } from "lucide-react"
import { createPrompt } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function CreatePromptPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prompt: "",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirect if not authenticated
  if (!user) {
    router.push("/")
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required"
    if (!formData.description.trim()) return "Description is required"
    if (!formData.prompt.trim()) return "Prompt is required"
    if (formData.tags.length === 0) return "At least one tag is required"
    if (formData.title.length > 100) return "Title must be less than 100 characters"
    if (formData.description.length > 500) return "Description must be less than 500 characters"
    if (formData.prompt.length > 2000) return "Prompt must be less than 2000 characters"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    try {
      await createPrompt(
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          prompt: formData.prompt.trim(),
          tags: formData.tags,
        },
        user.uid,
        userProfile?.displayName || user.displayName || "Anonymous",
      )

      toast({
        title: "Success!",
        description: "Your prompt has been shared with the community.",
      })

      router.push("/")
    } catch (error: any) {
      setError(error.message || "Failed to create prompt")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif font-bold">Share Your Prompt</h1>
            <p className="text-muted-foreground">Help others by sharing your creative AI prompts with the community</p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Prompt</CardTitle>
              <CardDescription>Fill in the details below to share your prompt with the community</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Professional Email Writer"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your prompt does and when to use it..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">{formData.description.length}/500 characters</p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">
                    Tags <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="tags"
                      placeholder="Add a tag (e.g., email, writing, business)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      maxLength={20}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTag}
                      disabled={!tagInput.trim() || formData.tags.length >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                          <span>{tag}</span>
                          <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {formData.tags.length}/10 tags • Press Enter or click + to add tags
                  </p>
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">
                    Prompt <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Write your AI prompt here. Be specific and clear about what you want the AI to do..."
                    value={formData.prompt}
                    onChange={(e) => handleInputChange("prompt", e.target.value)}
                    maxLength={2000}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{formData.prompt.length}/2000 characters</p>
                </div>

                {/* Preview */}
                {formData.title && formData.description && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-serif">{formData.title}</CardTitle>
                        <CardDescription>{formData.description}</CardDescription>
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {formData.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      {formData.prompt && (
                        <CardContent className="pt-0">
                          <div className="bg-background p-3 rounded border">
                            <p className="text-sm font-mono line-clamp-4">{formData.prompt}</p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Share Prompt
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
