'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, Search, BookOpen, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

// Types for category data
interface CategoryPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  readTime: number;
  views: number;
  author: {
    name: string;
    image: string | null;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
  isPopular: boolean;
  posts: CategoryPost[];
}

const BlogCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        const response = await fetch(`/api/blog/categories?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [searchTerm]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popularCategories = categories.filter(cat => cat.isPopular);
  const selectedCategoryData = selectedCategory ? categories.find(cat => cat.slug === selectedCategory) : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Blog Categories
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Explore our articles organized by topics. Find exactly what you&apos;re looking for 
            in web development, design, and technology.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading categories...</p>
          </div>
        )}

        {/* Popular Categories */}
        {!loading && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Popular Categories</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedCategory(category.slug)}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <Badge variant="secondary">{category.postCount} posts</Badge>
                  </div>
                  <CardDescription className="text-base">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Articles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        )}

        {/* All Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">All Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedCategory(category.slug)}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant="outline">{category.postCount}</Badge>
                  </div>
                  <CardDescription>
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.postCount} articles
                    </span>
                    <Button variant="ghost" size="sm">
                      Browse →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Category Detail Modal/Section */}
        {selectedCategoryData && (
          <div className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full ${selectedCategoryData.color}`}></div>
                  <h2 className="text-3xl font-bold">{selectedCategoryData.name}</h2>
                  <Badge variant="secondary">{selectedCategoryData.postCount} posts</Badge>
                </div>
                <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                  Close
                </Button>
              </div>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                {selectedCategoryData.description}
              </p>

              <h3 className="text-xl font-semibold mb-4">Latest Articles</h3>
              <div className="space-y-4">
                {selectedCategoryData.posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold mb-2">
                            <Link 
                              href={`/blog/${post.slug}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.author.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(post.publishedAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime} min read
                            </div>
                            <div className="text-gray-400">
                              {post.views.toLocaleString()} views
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/blog/${post.slug}`}>
                            Read More
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button asChild>
                  <Link href={`/blog?category=${selectedCategoryData.slug}`}>
                    View All {selectedCategoryData.name} Articles
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search terms.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Total Categories
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {categories.reduce((sum, cat) => sum + cat.postCount, 0)}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Total Articles
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {popularCategories.length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Popular Categories
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-6 opacity-90">
            Get the latest articles from your favorite categories delivered to your inbox.
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

export default BlogCategoriesPage;