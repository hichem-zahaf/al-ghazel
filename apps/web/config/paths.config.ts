import { z } from 'zod';

const PathsSchema = z.object({
  auth: z.object({
    signIn: z.string().min(1),
    signUp: z.string().min(1),
    verifyMfa: z.string().min(1),
    callback: z.string().min(1),
    passwordReset: z.string().min(1),
    passwordUpdate: z.string().min(1),
  }),
  app: z.object({
    home: z.string().min(1),
    profileSettings: z.string().min(1),
  }),
  admin: z.object({
    dashboard: z.string().min(1),
    orders: z.string().min(1),
    users: z.string().min(1),
    books: z.string().min(1),
    authors: z.string().min(1),
    settings: z.string().min(1),
  }),
});

const pathsConfig = PathsSchema.parse({
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    verifyMfa: '/auth/verify',
    callback: '/auth/callback',
    passwordReset: '/auth/password-reset',
    passwordUpdate: '/update-password',
  },
  app: {
    home: '/home',
    profileSettings: '/home/settings',
  },
  admin: {
    dashboard: '/admin',
    orders: '/admin/orders',
    users: '/admin/users',
    books: '/admin/books',
    authors: '/admin/authors',
    settings: '/admin/settings',
  },
} satisfies z.infer<typeof PathsSchema>);

export default pathsConfig;
