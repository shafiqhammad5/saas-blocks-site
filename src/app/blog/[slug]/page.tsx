import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, Eye } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

// Mock blog data (in a real app, this would come from a database or CMS)
const blogPosts = [
  {
    id: '1',
    title: 'Building Modern UI Components with React and TypeScript',
    slug: 'building-modern-ui-components-react-typescript',
    excerpt: 'Learn how to create reusable, type-safe UI components that scale with your application. We\'ll cover best practices, patterns, and tools.',
    content: `
# Building Modern UI Components with React and TypeScript

Creating reusable, maintainable UI components is crucial for any modern React application. In this comprehensive guide, we'll explore best practices for building components that are both type-safe and scalable.

## Why TypeScript for React Components?

TypeScript brings several advantages to React development:

- **Type Safety**: Catch errors at compile time rather than runtime
- **Better IntelliSense**: Enhanced autocomplete and documentation
- **Refactoring Confidence**: Safe refactoring with IDE support
- **Self-Documenting Code**: Types serve as inline documentation

## Component Design Principles

### 1. Single Responsibility Principle

Each component should have a single, well-defined purpose:

\`\`\`tsx
// Good: Focused component
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  disabled = false 
}) => {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
\`\`\`

### 2. Composition Over Inheritance

Favor composition patterns that allow flexible component combinations:

\`\`\`tsx
// Flexible card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={\`card \${className || ''}\`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={\`card-header \${className || ''}\`}>
    {children}
  </div>
);

const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={\`card-content \${className || ''}\`}>
    {children}
  </div>
);
\`\`\`

## Advanced TypeScript Patterns

### Generic Components

Create flexible components that work with different data types:

\`\`\`tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

### Discriminated Unions

Use discriminated unions for components with multiple variants:

\`\`\`tsx
type AlertProps = 
  | { variant: 'success'; message: string; }
  | { variant: 'error'; message: string; error: Error; }
  | { variant: 'warning'; message: string; action?: () => void; };

const Alert: React.FC<AlertProps> = (props) => {
  switch (props.variant) {
    case 'success':
      return <div className="alert-success">{props.message}</div>;
    case 'error':
      return (
        <div className="alert-error">
          {props.message}
          <details>{props.error.message}</details>
        </div>
      );
    case 'warning':
      return (
        <div className="alert-warning">
          {props.message}
          {props.action && <button onClick={props.action}>Action</button>}
        </div>
      );
  }
};
\`\`\`

## Testing Strategies

### Unit Testing with Jest and React Testing Library

\`\`\`tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
\`\`\`

## Performance Optimization

### Memoization

Use React.memo and useMemo for expensive operations:

\`\`\`tsx
const ExpensiveComponent = React.memo<Props>(({ data, onSelect }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: expensiveCalculation(item)
    }));
  }, [data]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} item={item} onSelect={onSelect} />
      ))}
    </div>
  );
});
\`\`\`

## Conclusion

Building modern UI components with React and TypeScript requires careful consideration of design patterns, type safety, and performance. By following these principles and patterns, you can create components that are:

- **Reusable**: Work across different parts of your application
- **Maintainable**: Easy to update and extend
- **Type-safe**: Catch errors early in development
- **Performant**: Optimized for rendering efficiency

Remember to always consider your specific use case and team preferences when implementing these patterns. The goal is to create a component library that serves your application's needs while maintaining code quality and developer experience.
    `,
    coverImage: '/api/placeholder/1200/600',
    isPublished: true,
    publishedAt: '2024-01-15T10:00:00Z',
    views: 1250,
    readTime: 8,
    author: {
      name: 'Sarah Johnson',
      image: '/api/placeholder/80/80',
      bio: 'Senior Frontend Developer with 8+ years of experience in React and TypeScript. Passionate about creating scalable UI architectures.'
    },
    categories: ['React', 'TypeScript'],
    tags: ['Components', 'Best Practices', 'Development'],
    seo: {
      metaTitle: 'Building Modern UI Components with React and TypeScript | SaaS Blocks',
      metaDescription: 'Learn how to create reusable, type-safe UI components that scale with your application. Complete guide with best practices, patterns, and examples.',
      keywords: ['React components', 'TypeScript', 'UI development', 'frontend', 'reusable components']
    }
  },
  // Add more mock posts as needed...
];

const relatedPosts = [
  {
    id: '2',
    title: 'The Complete Guide to TailwindCSS v4',
    slug: 'complete-guide-tailwindcss-v4',
    coverImage: '/api/placeholder/300/200',
    readTime: 12
  },
  {
    id: '3',
    title: 'State Management Patterns in Modern React',
    slug: 'state-management-patterns-modern-react',
    coverImage: '/api/placeholder/300/200',
    readTime: 10
  },
  {
    id: '4',
    title: 'Optimizing Performance in React Applications',
    slug: 'optimizing-performance-react-applications',
    coverImage: '/api/placeholder/300/200',
    readTime: 15
  }
];

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = blogPosts.find(p => p.slug === params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | SaaS Blocks',
      description: 'The requested blog post could not be found.'
    };
  }

  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    keywords: post.seo.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [{
        url: post.coverImage,
        width: 1200,
        height: 600,
        alt: post.title
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage]
    },
    alternates: {
      canonical: `https://saasblocks.dev/blog/${post.slug}`
    }
  };
}

// Generate static params for static generation
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

const BlogPostPage = ({ params }: BlogPostPageProps) => {
  const post = blogPosts.find(p => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Convert markdown-like content to JSX (simplified)
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-4xl font-bold mb-6 mt-8">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-3xl font-semibold mb-4 mt-8">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-2xl font-semibold mb-3 mt-6">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 mb-2">{line.slice(2)}</li>;
      }
      if (line.startsWith('```')) {
        return <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto"></div>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-4 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {post.author.name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views.toLocaleString()} views
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-medium">Share:</span>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-12">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1200}
            height={600}
            className="w-full rounded-xl shadow-lg"
            priority
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          {renderContent(post.content)}
        </div>

        {/* Tags */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Author Bio */}
        <div className="mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{post.author.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Image
                  src={relatedPost.coverImage}
                  alt={relatedPost.title}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    <Link 
                      href={`/blog/${relatedPost.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {relatedPost.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <BookOpen className="h-3 w-3" />
                    {relatedPost.readTime} min read
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg mb-6 opacity-90">
              Get the latest articles and tutorials delivered to your inbox.
            </p>
            <Button variant="secondary" size="lg">
              Subscribe to Newsletter
            </Button>
          </CardContent>
        </Card>
      </article>
      
      <Footer />
    </div>
  );
};

export default BlogPostPage;