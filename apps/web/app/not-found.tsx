/**
 * 404 Not Found Page
 * A visually engaging page with lost book metaphor and grid background
 */

import Link from 'next/link';
import {
  ArrowLeft,
  HomeIcon,
  SearchIcon,
  BookOpenIcon,
  GhostIcon
} from 'lucide-react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { SiteHeaderWrapper } from '~/(marketing)/_components/site-header-wrapper';
import { SiteFooter } from '~/(marketing)/_components/site-footer';
import { NotFoundContent } from './_components/not-found-content';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('common:notFound');

  return {
    title,
  };
};

const NotFoundPage = async () => {
  const client = getSupabaseServerClient();
  const { data } = await client.auth.getClaims();

  return (
    <div className="relative min-h-screen flex flex-col">
      <SiteHeaderWrapper user={data?.claims} />
      <NotFoundContent />
      <SiteFooter />
    </div>
  );
};

export default withI18n(NotFoundPage);
