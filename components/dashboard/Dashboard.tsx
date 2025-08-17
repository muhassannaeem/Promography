"use client"

import { useState, useEffect } from "react"
import { SearchBar } from "./SearchBar"
import { PromptCard } from "@/components/prompts/PromptCard"
import { PromptCardSkeleton } from "@/components/prompts/PromptCardSkeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Clock, Plus, Sparkles } from "lucide-react"
import { getPrompts, getTrendingPrompts, searchPrompts, type Prompt } from "@/lib/firestore"
import Link from "next/link"

export function Dashboard() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [trendingPrompts, setTrendingPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("recent")

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [recentPrompts, trending] = await Promise.all([getPrompts(20), getTrendingPrompts(10)])
      setPrompts(recentPrompts)
      setTrendingPrompts(trending)
    } catch (error) {
      console.error("Failed to load prompts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      loadInitialData()
      return
    }

    try {
      setLoading(true)
      const results = await searchPrompts(query)
      setPrompts(results)
      setActiveTab("recent")
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentPrompts = activeTab === "trending" ? trendingPrompts : prompts

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>AI Prompt Community</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-serif font-bold leading-tight">
            Discover Amazing
            <span className="text-primary block">AI Prompts</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Find the perfect prompt for any task, from creative writing to complex problem-solving. Join thousands of
            creators sharing their best AI prompts.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <SearchBar onSearch={handleSearch} />

          <Button asChild size="lg" className="font-medium shadow-lg hover:shadow-xl transition-shadow">
            <Link href="/create">
              <Plus className="h-5 w-5 mr-2" />
              Share Your Prompt
            </Link>
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="recent" className="flex items-center space-x-2 transition-all">
                <Clock className="h-4 w-4" />
                <span>Recent</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center space-x-2 transition-all">
                <TrendingUp className="h-4 w-4" />
                <span>Trending</span>
              </TabsTrigger>
            </TabsList>

            {searchQuery && (
              <div className="bg-muted px-3 py-1 rounded-full">
                <p className="text-sm text-muted-foreground">
                  {currentPrompts.length} results for "{searchQuery}"
                </p>
              </div>
            )}
          </div>

          <TabsContent value="recent" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PromptCardSkeleton key={i} />
                ))}
              </div>
            ) : currentPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPrompts.map((prompt, index) => (
                  <div
                    key={prompt.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <PromptCard prompt={prompt} onUpdate={loadInitialData} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No prompts found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? "Try adjusting your search terms." : "Be the first to share a prompt!"}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button asChild>
                      <Link href="/create">Share First Prompt</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PromptCardSkeleton key={i} />
                ))}
              </div>
            ) : trendingPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingPrompts.map((prompt, index) => (
                  <div
                    key={prompt.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <PromptCard prompt={prompt} onUpdate={loadInitialData} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No trending prompts yet</h3>
                    <p className="text-muted-foreground">Start liking prompts to see trending content here.</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
