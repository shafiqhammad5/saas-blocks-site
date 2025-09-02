"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List, Eye, Code, Heart } from "lucide-react";

// Interfaces for blocks data
interface Block {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  tags: string[];
  difficulty: string;
  isPremium: boolean;
  likes: number;
  views: number;
  image: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

const difficulties = ["All", "Easy", "Medium", "Hard"];
const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "recent", label: "Most Recent" },
  { value: "likes", label: "Most Liked" },
  { value: "views", label: "Most Viewed" }
];

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  // Fetch blocks and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch blocks
        const blocksParams = new URLSearchParams({
          search: searchQuery,
          category: selectedCategory !== "All" ? selectedCategory : "",
          difficulty: selectedDifficulty !== "All" ? selectedDifficulty : "",
          premium: showPremiumOnly ? "true" : "",
          sort: sortBy,
          limit: "50"
        });
        
        const [blocksResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/blocks?${blocksParams}`),
          fetch('/api/blocks/categories')
        ]);
        
        if (!blocksResponse.ok || !categoriesResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const blocksData = await blocksResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setBlocks(blocksData.blocks || []);
        setCategories([{ id: 'all', name: 'All' }, ...(categoriesData.categories || [])]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setBlocks([]);
        setCategories([{ id: 'all', name: 'All' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy, showPremiumOnly]);

  const filteredBlocks = useMemo(() => {
    // Since filtering is now handled by the API, we just return the blocks
    return blocks;
  }, [blocks]);

  const categoryOptions = ['All', ...categories.map(cat => cat.name)];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="border-b bg-muted/50 py-12">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              UI Blocks Library
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Copy and paste beautiful, responsive components for your next project.
              {blocks.length} components and counting.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="border-b py-6">
        <div className="container">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-md border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-12">
          <div className="container">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading blocks...</p>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {!loading && (
        <section className="py-8">
          <div className="container">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBlocks.length} components
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                className={showPremiumOnly ? "bg-primary text-primary-foreground" : ""}
              >
                <Filter className="mr-2 h-4 w-4" />
                Premium Only
              </Button>
            </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBlocks.map((block) => (
                <Card key={block.id} className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-video overflow-hidden bg-muted">
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Code className="h-12 w-12" />
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1 text-lg">{block.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {block.description}
                        </CardDescription>
                      </div>
                      {block.isPremium && (
                        <Badge variant="secondary" className="ml-2 shrink-0">
                          Pro
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {block.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {block.views}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {block.difficulty}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {block.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild className="mt-4 w-full" size="sm">
                      <Link href={`/blocks/${block.id}`}>
                        View Component
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {filteredBlocks.map((block) => (
                <Card key={block.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-32 shrink-0 overflow-hidden rounded-md bg-muted">
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <Code className="h-8 w-8" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{block.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {block.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {block.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {block.isPremium && (
                              <Badge variant="secondary">Pro</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {block.difficulty}
                            </Badge>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {block.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {block.views}
                              </div>
                            </div>
                            <Button asChild size="sm">
                              <Link href={`/blocks/${block.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredBlocks.length === 0 && (
            <div className="py-12 text-center">
              <Code className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No components found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setShowPremiumOnly(false);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}