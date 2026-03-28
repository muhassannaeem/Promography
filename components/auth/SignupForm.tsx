"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface SignupFormProps {
  onToggleMode: () => void
}

export function SignupForm({ onToggleMode }: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (!email.trim()) {
      setError("Email is required")
      setLoading(false)
      return
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }
    if (!displayName.trim()) {
      setError("Display name is required")
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      await signUp(email, password, displayName)
    } catch (error: any) {
      // Handle Firebase-specific errors
      const errorCode = error.code || error.message
      const errorMessages: Record<string, string> = {
        "auth/configuration-not-found": "Firebase Authentication is not enabled in your project. Please enable Email/Password authentication in Firebase Console → Authentication → Sign-in method.",
        "auth/email-already-in-use": "This email is already registered",
        "auth/invalid-email": "Invalid email address",
        "auth/weak-password": "Password is too weak (use letters, numbers, symbols)",
        "auth/operation-not-allowed": "Account creation is not enabled. Enable Email/Password in Firebase Console → Authentication → Sign-in method.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/invalid-api-key": "API configuration error. Please check your Firebase setup.",
        "auth/missing-password": "Password is required",
        "auth/user-disabled": "This account has been disabled",
      }
      
      const userMessage = errorMessages[errorCode] || error.message || "Failed to create account"
      setError(userMessage)
      console.error("Signup error:", { code: errorCode, message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-serif">Create account</CardTitle>
        <CardDescription>Join Promography and start sharing AI prompts</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <button type="button" onClick={onToggleMode} className="text-primary hover:underline font-medium">
            Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
