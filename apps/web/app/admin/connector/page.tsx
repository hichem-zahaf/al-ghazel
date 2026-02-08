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
} from 'lucide-react';

import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { cn } from '@kit/ui/utils';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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

// Default API key from environment
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_IG_SCRAPER_API || '';

export default function InstagramConnectorPage() {
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
  const debouncedUsername = useDebounce(username, 500);

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
              Extract and save Instagram posts from user profiles
            </p>
          </div>
        </div>

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
                  ig-scraper5.p.rapidapi.com/user/stories
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageBody>
  );
}
