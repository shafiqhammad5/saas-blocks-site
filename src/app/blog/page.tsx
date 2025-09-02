'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Search, Filter } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

// Mock blog data
const blogPosts = [
  {
    id: '1',
    title: 'Building Modern UI Components with React and TypeScript',
    slug: 'building-modern-ui-components-react-typescript',
    excerpt: 'Learn how to create reusable, type-safe UI components that scale with your application. We\'ll cover best practices, patterns, and tools.',
    content: '',
    coverImage: '/api/placeholder/800/400',
    isPublished: true,
    publishedAt: '2024-01-15T10:00:00Z',
    views: 1250,
    readTime: 8,
    author: {
      name: 'Sarah Johnson',
      image: '/api/placeholder/40/40'
    },
    categories: ['React', 'TypeScript'],
    tags: ['Components', 'Best Practices', 'Development']
  },
  {
    id: '2',
    title: 'The Complete Guide to TailwindCSS v4',
    slug: 'complete-guide-tailwindcss-v4',
    excerpt: 'Discover the new features and improvements in TailwindCSS v4. From performance enhancements to new utilities, everything you need to know.',
    content: '',
    coverImage: '/api/placeholder/800/400',
    isPublished: true,
    publishedAt: '2024-01-12T14:30:00Z',
    views: 980,
    readTime: 12,
    author: {
      name: 'Mike Chen',
      image: '/api/placeholder/40/40'
    },
    categories: ['CSS', 'TailwindCSS'],
    tags: ['Styling', 'Framework', 'Tutorial']
  },
  {
    id: '3',
    title: 'Implementing Dark Mode in Next.js Applications',
    slug: 'implementing-dark-mode-nextjs',
    excerpt: 'A comprehensive guide to adding dark mode support to your Next.js applications with proper SSR handling and user preferences.',
    content: '',
    coverImage: '/api/placeholder/800/400',
    isPublished: true,
    publishedAt: '2024-01-10T09:15:00Z',
    views: 756,
    readTime: 6,
    author: {
      name: 'Alex Rodriguez',
      image: '/api/placeholder/40/40'
    },
    categories: ['Next.js', 'UI/UX'],
    tags: ['Dark Mode', 'Theme', 'User Experience']
  },
  {
    id: '4',
    title: 'State Management Patterns in Modern React',
    slug: 'state-management-patterns-modern-react',
    excerpt: 'Explore different state management approaches in React applications, from useState to Zustand and everything in between.',
    content: '',
    coverImage: '/api/placeholder/800/400',
    isPublished: true,
    publishedAt: '2024-01-08T16:45:00Z',
    views: 1100,
    readTime: 10,
    author: {
      name: 'Emma Wilson',
      image: '/api/placeholder/40/40'
    },
    categories: ['React', 'State Management'],
    tags: ['Hooks', 'Context', 'Zustand']
  },
  {
    id: '5',
    title: 'Optimizing Performance in React Applications',
    slug: 'optimizing-performance-react-applications',
    excerpt: 'Learn advanced techniques to optimize your React applications for better performance, including memoization, lazy loading, and more.',
    content: '',
    coverImage: '/api/placeholder/800/400',
    isPublished: true,
    publishedAt: '2024-01-05T11:20:00Z',
    views: 890,
    readTime: 15,
    author: {
      name: 'David Kim',
      image: '/api/placeholder/40/40'
    },
    categories: ['React', 'Performance'],
    tags: ['Optimization', 'Memoization', 'Best Practices']
  },
  {
    id: '6',
    title: 'Building Accessible Web Components',
    slug: 'building-accessible-web-components',
    excerpt: 'A deep dive into creating web components that are accessible to all users, following WCAG guidelines and best practices.',
    content: '',
    coverImage: '/api/placeholder/800/400',
    isPublished: true,
    publishedAt: '2024-01-03T13:10:00Z',
    views: 645,
    readTime: 9,
    author: {
      name: 'Lisa Thompson',
      image: '/api/placeholder/40/40'
    },
    categories: ['Accessibility', 'Web Components'],
    tags: ['A11y', 'WCAG', 'Inclusive Design']
  }
];

const categories = ['All', 'React', 'TypeScript', 'CSS', 'TailwindCSS', 'Next.js', 'UI/UX', 'Performance', 'Accessibility'];

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort posts
  const filteredPosts = blogPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || post.categories.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'popular':
          return b.views - a.views;
        case 'readTime':
          return a.readTime - b.readTime;
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Insights, tutorials, and best practices for modern web development. 
            Stay updated with the latest trends and techniques.
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
          <Card className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  width={600}
                  height={300}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {featuredPost.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-2xl mb-3">
                  <Link 
                    href={`/blog/${featuredPost.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {featuredPost.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-base mb-4">
                  {featuredPost.excerpt}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {featuredPost.author.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(featuredPost.publishedAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime} min read
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/blog/${featuredPost.slug}`}>
                    Read More
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="readTime">Quick Reads</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">
                    {post.categories[0]}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime} min
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/blog/${post.slug}`}>
                    Read Article
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search terms or filters.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-6 opacity-90">
            Get the latest articles and tutorials delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="flex-1 bg-white text-gray-900"
            />
            <Button variant="secondary">
              Subscribe
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPage;