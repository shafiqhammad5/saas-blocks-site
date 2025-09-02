"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Eye, 
  Heart, 
  Download, 
  Code, 
  Palette,
  Smartphone,
  Tablet,
  Monitor
} from "lucide-react";

// Mock data - in a real app, this would come from an API or database
const mockBlock = {
  id: 1,
  title: "Hero Section with CTA",
  description: "A modern hero section with gradient background, compelling headline, and call-to-action buttons. Perfect for landing pages and marketing sites.",
  category: "Marketing",
  tags: ["hero", "cta", "gradient", "landing"],
  difficulty: "Easy",
  isPremium: false,
  likes: 245,
  views: 1200,
  author: "SaaSBlocks Team",
  createdAt: "2024-01-15",
  updatedAt: "2024-01-20",
  dependencies: ["@tailwindcss/typography", "lucide-react"],
  responsive: true,
  darkMode: true,
  accessibility: "WCAG 2.1 AA",
  codePreview: {
    html: `<section class="relative overflow-hidden py-20 sm:py-32">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    <div class="mx-auto max-w-2xl text-center">
      <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Build something
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          amazing
        </span>
      </h1>
      <p class="mt-6 text-lg leading-8 text-gray-600">
        Create beautiful, responsive interfaces with our premium TailwindCSS components.
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <button class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
          Get started
        </button>
        <button class="text-sm font-semibold leading-6 text-gray-900">
          Learn more <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  </div>
</section>`,
    react: `import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Build something{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              amazing
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Create beautiful, responsive interfaces with our premium TailwindCSS components.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" size="lg">
              Learn more
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    css: `.hero-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-text-gradient {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }
}

@media (min-width: 640px) {
  .hero-title {
    font-size: 3.75rem;
    line-height: 1;
  }
}`
  }
};

export default function BlockDetailPage() {
  const params = useParams();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("react");
  const [viewportSize, setViewportSize] = useState<"mobile" | "tablet" | "desktop">("desktop");

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getViewportClass = () => {
    switch (viewportSize) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-2xl";
      default:
        return "max-w-full";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <section className="border-b py-4">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/blocks" className="hover:text-foreground">
              Blocks
            </Link>
            <span>/</span>
            <span className="text-foreground">{mockBlock.title}</span>
          </div>
        </div>
      </section>

      {/* Block Header */}
      <section className="border-b py-8">
        <div className="container">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/blocks">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blocks
                  </Link>
                </Button>
                {mockBlock.isPremium && (
                  <Badge variant="secondary">Pro</Badge>
                )}
                <Badge variant="outline">{mockBlock.difficulty}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {mockBlock.title}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {mockBlock.description}
              </p>
              
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {mockBlock.likes} likes
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {mockBlock.views} views
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mockBlock.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Heart className="mr-2 h-4 w-4" />
                Like
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Preview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Preview
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewportSize === "mobile" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewportSize("mobile")}
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewportSize === "tablet" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewportSize("tablet")}
                      >
                        <Tablet className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewportSize === "desktop" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewportSize("desktop")}
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-lg border bg-background p-6">
                    <div className={`mx-auto transition-all duration-300 ${getViewportClass()}`}>
                      {/* Preview Component */}
                      <div className="relative overflow-hidden py-20 sm:py-32">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                          <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                              Build something{" "}
                              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                amazing
                              </span>
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-muted-foreground">
                              Create beautiful, responsive interfaces with our premium TailwindCSS components.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                              <Button size="lg">
                                Get started
                              </Button>
                              <Button variant="ghost" size="lg">
                                Learn more
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Code */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="react">React</TabsTrigger>
                      <TabsTrigger value="html">HTML</TabsTrigger>
                      <TabsTrigger value="css">CSS</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="react" className="mt-4">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute right-2 top-2 z-10"
                          onClick={() => copyToClipboard(mockBlock.codePreview.react, "react")}
                        >
                          {copiedCode === "react" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                          <code>{mockBlock.codePreview.react}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="html" className="mt-4">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute right-2 top-2 z-10"
                          onClick={() => copyToClipboard(mockBlock.codePreview.html, "html")}
                        >
                          {copiedCode === "html" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                          <code>{mockBlock.codePreview.html}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="css" className="mt-4">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute right-2 top-2 z-10"
                          onClick={() => copyToClipboard(mockBlock.codePreview.css, "css")}
                        >
                          {copiedCode === "css" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                          <code>{mockBlock.codePreview.css}</code>
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Component Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Component Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                    <p className="text-sm">{mockBlock.category}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Difficulty</h4>
                    <Badge variant="outline" className="mt-1">
                      {mockBlock.difficulty}
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Author</h4>
                    <p className="text-sm">{mockBlock.author}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                    <p className="text-sm">{new Date(mockBlock.updatedAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Fully Responsive
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Dark Mode Support
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    {mockBlock.accessibility} Compliant
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    TypeScript Ready
                  </div>
                </CardContent>
              </Card>

              {/* Dependencies */}
              <Card>
                <CardHeader>
                  <CardTitle>Dependencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockBlock.dependencies.map((dep) => (
                      <div key={dep} className="flex items-center gap-2 text-sm">
                        <Code className="h-3 w-3 text-muted-foreground" />
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{dep}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}