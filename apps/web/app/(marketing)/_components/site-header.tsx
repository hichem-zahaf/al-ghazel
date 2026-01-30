'use client';

import type { JwtPayload } from '@supabase/supabase-js';
import { useState } from 'react';

import { Header } from '@kit/ui/marketing';

import { AppLogo } from '~/components/app-logo';

import { SiteHeaderAccountSection } from './site-header-account-section';
import { SiteNavigation } from './site-navigation';
import { SearchButton } from './search-button';
import { DiscoverButton } from './discover-button';
import { AiChatButton } from './ai-chat-button';
import { SearchModal } from './bookstore/search-modal';
import { BookDiscoveryModal } from './bookstore/book-discovery-modal';
import { AiChatModal } from './bookstore/ai-chat-modal';
import { mockBooks } from '~/lib/../data/mock-books';
import { mockCategories } from '~/lib/../data/mock-categories';
import { mockAuthors } from '~/lib/../data/mock-authors';

export function SiteHeader(props: { user?: JwtPayload | null }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  return (
    <>
      <Header
        logo={<AppLogo />}
        navigation={<SiteNavigation />}
        actions={
          <>
            <SearchButton onClick={() => setIsSearchOpen(true)} />
            <AiChatButton onClick={() => setIsAiChatOpen(true)} />
            <DiscoverButton onClick={() => setIsDiscoveryOpen(true)} />
            <SiteHeaderAccountSection user={props.user ?? null} />
          </>
        }
      />
      <SearchModal
        books={mockBooks}
        categories={mockCategories}
        authors={mockAuthors}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <BookDiscoveryModal
        books={mockBooks}
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
      />
      <AiChatModal
        books={mockBooks}
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />
    </>
  );
}
