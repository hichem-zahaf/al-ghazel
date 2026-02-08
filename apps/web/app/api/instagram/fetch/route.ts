import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// API Response Types
interface InstagramImageCandidate {
  url: string;
  width: number;
  height: number;
}

interface InstagramVideoVersion {
  type: number;
  width: number;
  height: number;
  url: string;
  id: string;
}

interface InstagramPostNode {
  code: string;
  pk: string;
  id: string;
  caption?: {
    text?: string;
  } | null;
  image_versions2?: {
    candidates: InstagramImageCandidate[];
  } | null;
  video_versions?: InstagramVideoVersion[] | null;
  user?: {
    pk: string;
    username: string;
    full_name?: string;
    profile_pic_url?: string;
  } | null;
}

interface InstagramUserProfile {
  pk: string;
  username: string;
  full_name?: string;
  profile_pic_url?: string;
}

interface InstagramApiResponse {
  items?: Array<{
    node: InstagramPostNode;
  }>;
  user?: InstagramUserProfile;
  after_cursor?: string;
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
}

interface ProfileData {
  pk: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
}

const DATA_DIR = join(process.cwd(), 'data');
const POSTS_DIR = join(DATA_DIR, 'posts');
const PROFILES_DIR = join(DATA_DIR, 'profiles');
const MAX_REQUEST_LIMIT = 100; // Hard limit to prevent infinite loops

// Ensure directories exist
async function ensureDirectories() {
  if (!existsSync(POSTS_DIR)) {
    await mkdir(POSTS_DIR, { recursive: true });
  }
  if (!existsSync(PROFILES_DIR)) {
    await mkdir(PROFILES_DIR, { recursive: true });
  }
}

// Save profile to JSON file
async function saveProfile(profile: ProfileData): Promise<boolean> {
  await ensureDirectories();
  const profilePath = join(PROFILES_DIR, `${profile.username}.json`);

  // Check if profile exists
  const profileExists = existsSync(profilePath);

  // Write or update profile
  await writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf-8');

  return profileExists; // Returns true if it was an update
}

// Save post to JSON file
async function savePost(post: PostData): Promise<boolean> {
  await ensureDirectories();
  const postPath = join(POSTS_DIR, `${post.code}.json`);

  // Check if post exists
  const postExists = existsSync(postPath);

  // Only save if it doesn't exist
  if (!postExists) {
    await writeFile(postPath, JSON.stringify(post, null, 2), 'utf-8');
  }

  return postExists; // Returns true if it already existed
}

// Extract best quality image from candidates
function getBestImage(candidates?: InstagramImageCandidate[] | null): { url: string; width: number; height: number } | null {
  if (!candidates || candidates.length === 0) {
    return null;
  }

  // Find the highest resolution image
  const sorted = [...candidates].sort((a, b) => b.width - a.width);
  const first = sorted[0];
  if (!first) {
    return null;
  }
  return {
    url: first.url,
    width: first.width,
    height: first.height,
  };
}

// Fetch posts from Instagram API
async function fetchInstagramPosts(
  usernameOrId: string,
  apiKey: string,
  afterCursor?: string
): Promise<{ data: InstagramApiResponse; error?: string }> {
  const url = new URL('https://ig-scraper5.p.rapidapi.com/user/posts');
  url.searchParams.set('id_or_username', usernameOrId);

  if (afterCursor) {
    url.searchParams.set('after_cursor', afterCursor);
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'ig-scraper5.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        data: {},
        error: `API request failed: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      data: {},
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// POST /api/instagram/fetch - Fetch and save Instagram posts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usernameOrId, numberOfPosts, afterCursor, apiKey } = body;

    // Validate input
    if (!usernameOrId) {
      return NextResponse.json({ error: 'Username or ID is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const targetPostCount = numberOfPosts ? parseInt(String(numberOfPosts), 10) : 10;
    let currentAfterCursor = afterCursor;
    let extractedPosts = 0;
    let requestCount = 0;
    const newPosts: string[] = [];
    const updatedProfiles: string[] = [];
    const skippedPosts: string[] = [];

    // Fetch posts until we reach the target or hit the limit
    while (
      extractedPosts < targetPostCount &&
      requestCount < MAX_REQUEST_LIMIT
    ) {
      requestCount++;

      const { data, error } = await fetchInstagramPosts(
        usernameOrId,
        apiKey,
        currentAfterCursor
      );

      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }

      // Save profile if present
      if (data.user) {
        const profileData: ProfileData = {
          pk: data.user.pk,
          username: data.user.username,
          full_name: data.user.full_name || '',
          profile_pic_url: data.user.profile_pic_url || '',
        };

        const existed = await saveProfile(profileData);
        if (!existed) {
          updatedProfiles.push(profileData.username);
        }
      }

      // Process posts
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          if (extractedPosts >= targetPostCount) break;

          const node = item.node;

          // Extract post data
          const postData: PostData = {
            code: node.code,
            pk: node.pk,
            id: node.id,
            caption: {
              text: node.caption?.text || '',
            },
            image: getBestImage(node.image_versions2?.candidates) || {
              url: '',
              width: 0,
              height: 0,
            },
          };

          // Save post (skips if already exists)
          const existed = await savePost(postData);
          if (!existed) {
            newPosts.push(postData.code);
            extractedPosts++;
          } else {
            skippedPosts.push(postData.code);
          }
        }
      }

      // Check if there's a next page
      currentAfterCursor = data.after_cursor;
      if (!currentAfterCursor) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      extractedPosts,
      requestCount,
      newPosts,
      updatedProfiles,
      skippedPosts,
      hasNextPage: !!currentAfterCursor,
      nextCursor: currentAfterCursor,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/instagram/fetch - Check API endpoint status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    description: 'Instagram posts fetch API',
  });
}
