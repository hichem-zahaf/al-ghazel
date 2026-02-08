'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Instagram,
  Eye,
  EyeOff,
  Loader2,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Database,
  FileText,
  User,
  Trash2,
  Sparkles,
  Check,
  Expand,
} from 'lucide-react';

import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Checkbox } from '@kit/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { cn } from '@kit/ui/utils';

// Types
type ValidationStatus = 'idle' | 'valid' | 'invalid';

interface ValidationResult {
  status: ValidationStatus;
  cleanedValue?: string;
  message?: string;
}

interface FetchResult {
  success: boolean;
  extractedPosts: number;
  requestCount: number;
  newPosts: string[];
  updatedProfiles: string[];
  skippedPosts: string[];
  hasNextPage: boolean;
  nextCursor?: string;
  error?: string;
}

interface PostData {
  code: string;
  pk: string;
  id: string;
  caption: {
    text: string;
  };
  image: {
    url: string;
    width: number;
    height: number;
  };
  author?: string;
}

// Default API key from environment
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_IG_SCRAPER_API || '';

// Extract Tab Component
function ExtractTab() {
  // API Key state
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [afterCursor, setAfterCursor] = useState('');
  const [numberOfPosts, setNumberOfPosts] = useState('10');

  // Validation state
  const [validation, setValidation] = useState<ValidationResult>({
    status: 'idle',
  });

  // Fetch state
  const [isFetching, setIsFetching] = useState(false);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounced username validation
  const [debouncedUsername, setDebouncedUsername] = useState(username);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUsername(username), 500);
    return () => clearTimeout(timer);
  }, [username]);

  // Validate username only
  const validateInput = useCallback((value: string): ValidationResult => {
    if (!value.trim()) {
      return {
        status: 'idle',
      };
    }

    const trimmed = value.trim();

    // Remove @ symbol if present, remove spaces
    const cleaned = trimmed.replace(/^@/, '').replace(/\s+/g, '');

    // Validate username format (alphanumeric, underscores, periods)
    if (/^[a-zA-Z0-9._]+$/.test(cleaned)) {
      return {
        status: 'valid',
        cleanedValue: cleaned,
        message: `Username: @${cleaned}`,
      };
    }

    return {
      status: 'invalid',
      message: 'Invalid username format. Use letters, numbers, dots, and underscores only.',
    };
  }, []);

  // Run validation when debounced input changes
  useEffect(() => {
    setValidation(validateInput(debouncedUsername));
  }, [debouncedUsername, validateInput]);

  // Auto-fill the cleaned value when validation passes
  useEffect(() => {
    if (validation.status === 'valid' && validation.cleanedValue) {
      setUsername(validation.cleanedValue);
    }
  }, [validation]);

  // Handle fetch posts
  const handleFetch = async () => {
    if (validation.status !== 'valid') {
      setError('Please enter a valid username.');
      return;
    }

    if (!apiKey) {
      setError('API key is required.');
      return;
    }

    setIsFetching(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/instagram/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: validation.cleanedValue,
          numberOfPosts: parseInt(numberOfPosts, 10) || 10,
          afterCursor: afterCursor || undefined,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setResult(data);

      // Auto-fill the next cursor if available
      if (data.nextCursor && data.nextCursor !== afterCursor) {
        setAfterCursor(data.nextCursor);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsFetching(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setUsername('');
    setAfterCursor('');
    setNumberOfPosts('10');
    setResult(null);
    setError(null);
    setValidation({ status: 'idle' });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* API Key Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Configuration</CardTitle>
            <CardDescription>
              Enter your RapidAPI key for the IG Scraper service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your RapidAPI key"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {DEFAULT_API_KEY && !apiKey && (
                <p className="text-xs text-muted-foreground">
                  Using default API key from environment
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fetch Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Extract Posts from Instagram Profile</CardTitle>
            <CardDescription>
              Enter a username to fetch their posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className={cn(
                  validation.status === 'invalid' && 'border-destructive focus-visible:ring-destructive',
                  validation.status === 'valid' && 'border-green-500 focus-visible:ring-green-500'
                )}
              />
              {validation.status !== 'idle' && (
                <p className={cn(
                  'text-xs flex items-center gap-1',
                  validation.status === 'valid' ? 'text-green-600' : 'text-destructive'
                )}>
                  {validation.status === 'valid' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {validation.message}
                </p>
              )}
            </div>

            {/* Number of Posts */}
            <div className="space-y-2">
              <Label htmlFor="posts-count">Number of Posts to Fetch</Label>
              <Input
                id="posts-count"
                type="number"
                min="1"
                max="100"
                value={numberOfPosts}
                onChange={(e) => setNumberOfPosts(e.target.value)}
              />
            </div>

            {/* Pagination Cursor */}
            <div className="space-y-2">
              <Label htmlFor="after-cursor">After Cursor (Pagination)</Label>
              <Input
                id="after-cursor"
                value={afterCursor}
                onChange={(e) => setAfterCursor(e.target.value)}
                placeholder="Auto-filled from previous requests"
              />
              <p className="text-xs text-muted-foreground">
                This field is automatically filled when there are more posts to fetch
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleFetch}
                disabled={isFetching || validation.status !== 'valid' || !apiKey}
                className="flex-1"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Fetch Posts
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isFetching}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Fetch Complete
              </CardTitle>
              <CardDescription>
                Successfully extracted {result.extractedPosts} posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <FileText className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{result.newPosts.length}</p>
                    <p className="text-xs text-muted-foreground">New Posts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{result.updatedProfiles.length}</p>
                    <p className="text-xs text-muted-foreground">Profiles</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                  <Database className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-600">{result.skippedPosts.length}</p>
                    <p className="text-xs text-muted-foreground">Skipped</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <RefreshCw className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{result.requestCount}</p>
                    <p className="text-xs text-muted-foreground">Requests</p>
                  </div>
                </div>
              </div>

              {/* Pagination Info */}
              {result.hasNextPage && (
                <Alert>
                  <ArrowRight className="h-4 w-4" />
                  <AlertTitle>More Posts Available</AlertTitle>
                  <AlertDescription>
                    There are more posts to fetch. The cursor has been auto-filled. Click &quot;Fetch Posts&quot; again to continue.
                  </AlertDescription>
                </Alert>
              )}

              {/* New Posts List */}
              {result.newPosts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">New Posts Saved:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.newPosts.map((code) => (
                      <Badge key={code} variant="secondary" className="font-mono text-xs">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar Info */}
      <div className="space-y-6">
        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <span className="font-bold text-orange">1.</span>
              <p>Enter a username (e.g., @username)</p>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-orange">2.</span>
              <p>Specify how many posts to fetch</p>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-orange">3.</span>
              <p>Click &quot;Fetch Posts&quot; to start extraction</p>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-orange">4.</span>
              <p>Posts are saved as JSON files in the data directory</p>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-orange">5.</span>
              <p>If more posts exist, the cursor auto-fills for pagination</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">Post files include:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• code</li>
                <li>• pk</li>
                <li>• id</li>
                <li>• caption.text</li>
                <li>• image (URL, width, height)</li>
              </ul>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">Profile files include:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• pk</li>
                <li>• username</li>
                <li>• full_name</li>
                <li>• profile_pic_url</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* API Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-mono bg-muted p-2 rounded break-all">
              ig-scraper5.p.rapidapi.com/user/posts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sync Tab Component
function SyncTab() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [allPostCodes, setAllPostCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPosts, setTotalPosts] = useState(0);

  // View theme: 'compact' | 'default' | 'expanded'
  const [viewTheme, setViewTheme] = useState<'compact' | 'default' | 'expanded'>('default');

  // Dialog states
  const [removePromoDialog, setRemovePromoDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewPostDialog, setViewPostDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [promoText, setPromoText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractingAuthor, setExtractingAuthor] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load posts
  const loadPosts = useCallback(async () => {
    try {
      const response = await fetch(`/api/instagram/posts?page=${page}&limit=${pageSize}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setTotalPosts(data.total || 0);

      // Load all post codes for "Select All" functionality
      if (allPostCodes.length === 0) {
        const allResponse = await fetch('/api/instagram/posts?page=1&limit=1000');
        const allData = await allResponse.json();
        setAllPostCodes((allData.posts || []).map((p: PostData) => p.code));
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, allPostCodes.length]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const togglePostSelection = (code: string) => {
    const newSelection = new Set(selectedPosts);
    if (newSelection.has(code)) {
      newSelection.delete(code);
    } else {
      newSelection.add(code);
    }
    setSelectedPosts(newSelection);
  };

  const toggleSelectAll = async () => {
    if (selectedPosts.size === allPostCodes.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(allPostCodes));
    }
  };

  const handleViewPost = (post: PostData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedPost(post);
    setViewPostDialog(true);
  };

  const handleRemovePromo = async () => {
    if (!promoText.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/instagram/posts/remove-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postCodes: Array.from(selectedPosts),
          textToRemove: promoText,
        }),
      });

      if (response.ok) {
        setRemovePromoDialog(false);
        setPromoText('');
        loadPosts(); // Reload posts
        setSelectedPosts(new Set());
        setAllPostCodes([]); // Reset all post codes
      }
    } catch (error) {
      console.error('Failed to remove promo:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/instagram/posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postCodes: Array.from(selectedPosts),
        }),
      });

      if (response.ok) {
        setDeleteDialog(false);
        loadPosts(); // Reload posts
        setSelectedPosts(new Set());
        setAllPostCodes([]); // Reset all post codes
      }
    } catch (error) {
      console.error('Failed to delete posts:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExtractAuthor = async () => {
    setExtractingAuthor(true);
    try {
      const response = await fetch('/api/instagram/posts/extract-author', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postCodes: Array.from(selectedPosts),
        }),
      });

      if (response.ok) {
        loadPosts(); // Reload posts to show updated authors
        setSelectedPosts(new Set());
      }
    } catch (error) {
      console.error('Failed to extract author:', error);
    } finally {
      setExtractingAuthor(false);
    }
  };

  const getGridCols = () => {
    switch (viewTheme) {
      case 'compact':
        return 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10';
      case 'expanded':
        return 'grid-cols-1 md:grid-cols-2';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const getCardPadding = () => {
    switch (viewTheme) {
      case 'compact':
        return 'p-2';
      case 'expanded':
        return 'p-4';
      default:
        return 'p-3';
    }
  };

  const totalPages = Math.ceil(totalPosts / pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      {posts.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                >
                  {selectedPosts.size === allPostCodes.length && allPostCodes.length > 0 ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <div className="mr-2 h-4 w-4 border-2 border-current" />
                  )}
                  {selectedPosts.size === allPostCodes.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Badge variant="secondary">
                  {selectedPosts.size} / {allPostCodes.length} selected
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {/* Page Size Selector */}
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                  className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="12">12 per page</option>
                  <option value="24">24 per page</option>
                  <option value="48">48 per page</option>
                  <option value="96">96 per page</option>
                </select>

                {/* View Theme Selector */}
                <select
                  value={viewTheme}
                  onChange={(e) => setViewTheme(e.target.value as 'compact' | 'default' | 'expanded')}
                  className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="compact">Compact</option>
                  <option value="default">Default</option>
                  <option value="expanded">Expanded</option>
                </select>

                {/* Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRemovePromoDialog(true)}
                  disabled={selectedPosts.size === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Promo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExtractAuthor}
                  disabled={selectedPosts.size === 0 || extractingAuthor}
                >
                  {extractingAuthor ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Extract Author
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialog(true)}
                  disabled={selectedPosts.size === 0 || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No posts found. Extract posts from Instagram first.</p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${getGridCols()}`}>
          {posts.map((post) => (
            <Card
              key={post.code}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                selectedPosts.has(post.code) && 'ring-2 ring-orange',
                getCardPadding()
              )}
              onClick={() => togglePostSelection(post.code)}
            >
              <CardHeader className={cn('space-y-2', viewTheme === 'compact' ? 'p-1' : '')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedPosts.has(post.code)}
                      onCheckedChange={() => togglePostSelection(post.code)}
                    />
                    {post.author && (
                      <Badge variant="secondary" className={cn('text-xs', viewTheme === 'compact' ? 'text-[10px]' : '')}>
                        {post.author}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn('h-7 w-7 p-0', viewTheme === 'compact' && 'h-5 w-5')}
                    onClick={(e) => handleViewPost(post, e)}
                  >
                    <Expand className={cn('h-4 w-4', viewTheme === 'compact' && 'h-3 w-3')} />
                  </Button>
                </div>
                <div className={cn(
                  'bg-muted rounded-md overflow-hidden',
                  viewTheme === 'compact' ? 'aspect-square' : 'aspect-square',
                  viewTheme === 'expanded' && 'aspect-[4/3]'
                )}>
                  <img
                    src={post.image.url}
                    alt={post.code}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </CardHeader>
              {viewTheme !== 'compact' && (
                <CardContent className={cn('pt-0', viewTheme === 'expanded' ? 'space-y-2' : '')}>
                  <p className={cn(
                    'text-muted-foreground mb-2',
                    viewTheme === 'expanded' ? 'text-sm line-clamp-4' : 'text-xs line-clamp-3'
                  )}>
                    {post.caption.text}
                  </p>
                  <p className={cn('text-muted-foreground font-mono', viewTheme === 'expanded' ? 'text-xs' : 'text-[10px]')}>
                    {post.code}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {posts.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>

          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            let pageNum;
            if (totalPages <= 10) {
              pageNum = i + 1;
            } else if (page <= 5) {
              pageNum = i + 1;
            } else if (page >= totalPages - 4) {
              pageNum = totalPages - 9 + i;
            } else {
              pageNum = page - 5 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(pageNum)}
                className="min-w-[2.5rem]"
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Remove Promo Dialog */}
      <Dialog open={removePromoDialog} onOpenChange={setRemovePromoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Promo Text</DialogTitle>
            <DialogDescription>
              Enter the text to remove from the captions of {selectedPosts.size} selected post(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="promo-text">Text to Remove</Label>
              <Textarea
                id="promo-text"
                placeholder="Enter the promo text to remove..."
                value={promoText}
                onChange={(e) => setPromoText(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemovePromoDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemovePromo}
              disabled={isProcessing || !promoText.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Text
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Posts</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPosts.size} post(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Delete {selectedPosts.size} Post{selectedPosts.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Post Dialog */}
      <Dialog open={viewPostDialog} onOpenChange={setViewPostDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>
              Full information about this Instagram post
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              {/* Post Image */}
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedPost.image.url}
                  alt={selectedPost.code}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Post Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Code</Label>
                  <p className="font-mono text-sm">{selectedPost.code}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">PK</Label>
                  <p className="font-mono text-sm">{selectedPost.pk}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">ID</Label>
                  <p className="font-mono text-sm">{selectedPost.id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Author</Label>
                  <p className="text-sm">{selectedPost.author || 'Not set'}</p>
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Caption</Label>
                <div className="p-3 bg-muted rounded-lg max-h-60 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{selectedPost.caption.text}</p>
                </div>
              </div>

              {/* Image Info */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Image Details</Label>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-xs"><span className="font-medium">URL:</span> <span className="font-mono break-all">{selectedPost.image.url}</span></p>
                  <p className="text-xs"><span className="font-medium">Size:</span> {selectedPost.image.width} x {selectedPost.image.height}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPostDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InstagramConnectorPage() {
  return (
    <PageBody>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange/10 rounded-lg">
            <Instagram className="h-6 w-6 text-orange" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Instagram Connector</h1>
            <p className="text-muted-foreground mt-1">
              Extract and sync Instagram posts
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="extract">
          <TabsList>
            <TabsTrigger value="extract">
              <Download className="h-4 w-4 mr-2" />
              Extract
            </TabsTrigger>
            <TabsTrigger value="sync">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="mt-6">
            <ExtractTab />
          </TabsContent>

          <TabsContent value="sync" className="mt-6">
            <SyncTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageBody>
  );
}
