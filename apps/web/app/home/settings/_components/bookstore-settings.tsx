'use client';

import { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  BookOpen,
  Shield,
  CreditCard,
  Globe,
  Palette,
  Trash2,
  ArrowRight,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Switch } from '@kit/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Separator } from '@kit/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { LanguageSelector } from '@kit/ui/language-selector';

import { usePersonalAccountData } from '@kit/accounts/hooks/use-personal-account-data';

type SettingsTab =
  | 'profile'
  | 'preferences'
  | 'notifications'
  | 'security'
  | 'billing'
  | 'danger';

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: TabItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <User className="h-4 w-4" />,
    description: 'Manage your account information',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: <Palette className="h-4 w-4" />,
    description: 'Customize your reading experience',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="h-4 w-4" />,
    description: 'Control your notification settings',
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Shield className="h-4 w-4" />,
    description: 'Password and authentication',
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: <CreditCard className="h-4 w-4" />,
    description: 'Payment methods and orders',
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    icon: <Trash2 className="h-4 w-4" />,
    description: 'Delete account and data',
  },
];

function BookstoreSettings({ userId, features, paths }: {
  userId: string;
  features: {
    enableAccountDeletion: boolean;
    enablePasswordUpdate: boolean;
  };
  paths: {
    callback: string;
  };
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const user = usePersonalAccountData(userId);

  if (!user.data || user.isPending) {
    return <LoadingOverlay fullPage />;
  }

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-32">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 flex-shrink-0">
        <Card className="sticky top-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Settings</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1 px-2 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <ArrowRight className="ml-auto h-4 w-4" />
                  )}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{activeTabData?.label}</h2>
          <p className="text-muted-foreground">{activeTabData?.description}</p>
        </div>

        {activeTab === 'profile' && (
          <ProfileTab user={user.data} />
        )}
        {activeTab === 'preferences' && <PreferencesTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security' && (
          <SecurityTab
            _user={user.data}
            features={features}
            _paths={paths}
            _userId={userId}
          />
        )}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'danger' && features.enableAccountDeletion && (
          <DangerTab />
        )}
      </main>
    </div>
  );
}

function ProfileTab({ user }: { user: { picture_url?: string | null; name?: string | null; email?: string | null } }) {
  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Profile Picture Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>This will be displayed on your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.picture_url ?? undefined} />
              <AvatarFallback className="text-lg bg-orange text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user.name ?? ''} placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user.email ?? ''} disabled />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address
              </p>
            </div>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PreferencesTab() {
  const [readingGoal, setReadingGoal] = useState('12');
  const [preferredGenre, setPreferredGenre] = useState('fiction');
  const [defaultLanguage, setDefaultLanguage] = useState('english');

  return (
    <div className="space-y-6">
      {/* Reading Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange" />
            Reading Preferences
          </CardTitle>
          <CardDescription>Customize your reading experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reading-goal">Annual Reading Goal</Label>
            <Select value={readingGoal} onValueChange={setReadingGoal}>
              <SelectTrigger id="reading-goal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 books per year</SelectItem>
                <SelectItem value="12">12 books per year</SelectItem>
                <SelectItem value="24">24 books per year</SelectItem>
                <SelectItem value="52">52 books per year</SelectItem>
                <SelectItem value="100">100+ books per year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred-genre">Preferred Genre</Label>
            <Select value={preferredGenre} onValueChange={setPreferredGenre}>
              <SelectTrigger id="preferred-genre">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiction">Fiction</SelectItem>
                <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                <SelectItem value="mystery">Mystery & Thriller</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="scifi">Science Fiction</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="biography">Biography</SelectItem>
                <SelectItem value="self-help">Self-Help</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Default Language</Label>
            <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="arabic">Arabic</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-500" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle dark theme</p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Application Language</Label>
            <LanguageSelector />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const notifications = [
    { id: 'order_updates', label: 'Order Updates', description: 'Get notified about your order status' },
    { id: 'delivery', label: 'Delivery Notifications', description: 'Track your package delivery' },
    { id: 'recommendations', label: 'Book Recommendations', description: 'Personalized book suggestions' },
    { id: 'promotions', label: 'Promotions & Discounts', description: 'Special offers and sales' },
    { id: 'newsletter', label: 'Newsletter', description: 'Weekly book digest' },
    { id: 'reviews', label: 'Review Reminders', description: 'Remind me to review purchased books' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose which emails you want to receive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between py-3">
                <div>
                  <Label htmlFor={notif.id} className="font-medium">
                    {notif.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{notif.description}</p>
                </div>
                <Switch id={notif.id} defaultChecked={notif.id === 'order_updates' || notif.id === 'delivery'} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecurityTab({
  _user,
  features,
  _paths,
  _userId,
}: {
  _user: { picture_url?: string | null; name?: string | null; email?: string | null; id: string };
  features: { enableAccountDeletion: boolean; enablePasswordUpdate: boolean };
  _paths: { callback: string };
  _userId: string;
}) {
  return (
    <div className="space-y-6">
      {/* Password */}
      {features.enablePasswordUpdate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Password
            </CardTitle>
            <CardDescription>Change your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Update Password</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">2FA Status</span>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Secure your account with two-factor authentication
              </p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">
                    {typeof window !== 'undefined' ? window.location.hostname : 'localhost'} • Now
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage your saved payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No payment methods saved yet</p>
            <Button>Add Payment Method</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
          <CardDescription>Your default billing address for orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sa">Saudi Arabia</SelectItem>
                  <SelectItem value="ae">United Arab Emirates</SelectItem>
                  <SelectItem value="eg">Egypt</SelectItem>
                  <SelectItem value="jo">Jordan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Enter city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal">Postal Code</Label>
                <Input id="postal" placeholder="Enter postal code" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" placeholder="Enter street address" />
            </div>
            <Button>Save Address</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DangerTab() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Irreversible and destructive actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Download all your data before deleting your account
              </p>
            </div>
            <Button variant="outline">Export Data</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { BookstoreSettings };
