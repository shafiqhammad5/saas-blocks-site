import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Zap, Shield, Star, Users, Blocks, Palette } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              🚀 New: 50+ Premium Components Added
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Premium{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TailwindCSS
              </span>{" "}
              UI Blocks for SaaS
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Build beautiful, responsive SaaS interfaces faster with our curated collection of 
              premium TailwindCSS components. Copy, paste, and customize to match your brand.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/blocks">
                  Browse Components
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to build faster
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Professional-grade components designed specifically for SaaS applications
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Code className="h-5 w-5 flex-none text-blue-600" />
                  Copy & Paste Ready
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Clean, semantic code that you can copy and paste directly into your project. 
                    No complex setup or dependencies required.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Zap className="h-5 w-5 flex-none text-yellow-600" />
                  Lightning Fast
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Optimized for performance with minimal CSS and JavaScript. 
                    Built with Core Web Vitals in mind.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Shield className="h-5 w-5 flex-none text-green-600" />
                  Production Ready
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Battle-tested components used by thousands of developers. 
                    Accessible, responsive, and cross-browser compatible.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Trusted by developers worldwide
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Join thousands of developers building amazing SaaS products
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col bg-background p-8">
                <dt className="text-sm font-semibold leading-6 text-muted-foreground">Components</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-foreground">200+</dd>
              </div>
              <div className="flex flex-col bg-background p-8">
                <dt className="text-sm font-semibold leading-6 text-muted-foreground">Developers</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-foreground">10,000+</dd>
              </div>
              <div className="flex flex-col bg-background p-8">
                <dt className="text-sm font-semibold leading-6 text-muted-foreground">Projects Built</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-foreground">50,000+</dd>
              </div>
              <div className="flex flex-col bg-background p-8">
                <dt className="text-sm font-semibold leading-6 text-muted-foreground">Countries</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-foreground">120+</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Component Categories */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Component Categories
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore our comprehensive library of UI components
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
            {[
              {
                name: "Navigation",
                description: "Headers, sidebars, breadcrumbs, and navigation menus",
                icon: Blocks,
                count: "25+ components",
                color: "text-blue-600"
              },
              {
                name: "Forms & Inputs",
                description: "Form layouts, input fields, validation, and submission flows",
                icon: Users,
                count: "30+ components",
                color: "text-green-600"
              },
              {
                name: "Data Display",
                description: "Tables, cards, lists, and data visualization components",
                icon: Palette,
                count: "40+ components",
                color: "text-purple-600"
              }
            ].map((category) => (
              <Card key={category.name} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                    <CardTitle>{category.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {category.count}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {category.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to build something amazing?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of developers who are building faster with SaaSBlocks. 
              Start with our free components or upgrade to Pro for the full library.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/blocks">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/pricing">View Pro Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
