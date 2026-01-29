'use client';

import type { JwtPayload } from '@supabase/supabase-js';
import { useState } from 'react';

import { Header } from '@kit/ui/marketing';

import { AppLogo } from '~/components/app-logo';

import { SiteHeaderAccountSection } from './site-header-account-section';
import { SiteNavigation } from './site-navigation';
import { SearchButton } from './search-button';
import { SearchModal } from './bookstore/search-modal';
import { mockBooks } from '~/lib/../data/mock-books';
import { mockCategories } from '~/lib/../data/mock-categories';
import { mockAuthors } from '~/lib/../data/mock-authors';

export function SiteHeader(props: { user?: JwtPayload | null }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <Header
        logo={<AppLogo />}
        navigation={<SiteNavigation />}
        actions={
          <>
            <SearchButton onClick={() => setIsSearchOpen(true)} />
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
    </>
  );
}
