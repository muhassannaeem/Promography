"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfileEditFormProps {
  onCancel: () => void
  onSave: () => void
}

export function ProfileEditForm({ onCancel, onSave }: ProfileEditFormProps) {
  const { userProfile, updateUserProfile } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || "",
    bio: userProfile?.bio || "",
    photoURL: userProfile?.photoURL || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.displayName.trim()) return "Display name is required"
    if (formData.displayName.length > 50) return "Display name must be less than 50 characters"
    if (formData.bio.length > 200) return "Bio must be less than 200 characters"
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
      await updateUserProfile({
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        photoURL: formData.photoURL.trim(),
      })

      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      })

      onSave()
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return ""

    setUploading(true)
    try {
      // Create a simple file reader for preview
      const reader = new FileReader()
      return new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target?.result as string
          resolve(result)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error("Upload failed:", error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image must be less than 5MB")
      return
    }

    try {
      setSelectedFile(file)
      const dataUrl = await handleFileUpload(file)
      handleInputChange("photoURL", dataUrl)
    } catch (error) {
      setError("Failed to process image")
    }
  }

  const handleRemovePhoto = () => {
    setSelectedFile(null)
    handleInputChange("photoURL", "")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your profile information and settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Picture */}
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.photoURL || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {formData.displayName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photo-upload">Upload from Computer</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {formData.photoURL && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemovePhoto}
                        disabled={uploading}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Upload an image (max 5MB) or enter a URL below</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoURL">Or use Image URL</Label>
                  <Input
                    id="photoURL"
                    placeholder="https://example.com/your-photo.jpg"
                    value={formData.photoURL.startsWith("data:") ? "" : formData.photoURL}
                    onChange={(e) => handleInputChange("photoURL", e.target.value)}
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              placeholder="Your display name"
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">{formData.displayName.length}/50 characters</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell others about yourself..."
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              maxLength={200}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{formData.bio.length}/200 characters</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
