import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link className="flex items-center space-x-2" href="/">
              <div className="h-6 w-6 rounded bg-gradient-to-r from-blue-600 to-purple-600" />
              <span className="font-bold">SaaSBlocks</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium TailwindCSS UI blocks for building beautiful SaaS applications faster.
            </p>
            <div className="mt-6 flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://github.com" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://twitter.com" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://linkedin.com" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/blocks"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  UI Blocks
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-sm font-semibold">Stay Updated</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Get the latest updates on new components and features.
            </p>
            <form className="mt-4 flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center space-y-2 md:flex-row md:space-x-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 SaaSBlocks. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="transition-colors hover:text-foreground"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}