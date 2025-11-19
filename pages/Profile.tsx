import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, User, Bell, Settings } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface UserPreferences {
  displayName?: string;
  bio?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  newsletterSubscribed: boolean;
}

export default function Profile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications'>('profile');

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  const { data: preferences, isLoading: preferencesLoading } = useQuery<{ success: boolean; preferences: UserPreferences }>({
    queryKey: ['/api/user/preferences'],
    enabled: !!user,
  });

  const form = useForm({
    defaultValues: {
      displayName: '',
      bio: '',
      emailNotifications: true,
      pushNotifications: true,
      newsletterSubscribed: false,
    },
  });

  useEffect(() => {
    if (preferences?.preferences) {
      form.reset({
        displayName: preferences.preferences.displayName || '',
        bio: preferences.preferences.bio || '',
        emailNotifications: preferences.preferences.emailNotifications !== false,
        pushNotifications: preferences.preferences.pushNotifications !== false,
        newsletterSubscribed: preferences.preferences.newsletterSubscribed === true,
      });
    }
  }, [preferences, form]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: {
      displayName?: string;
      bio?: string;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      newsletterSubscribed?: boolean;
    }) => {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
      toast({
        title: 'Success',
        description: 'Preferences updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive',
      });
    },
  });

  const handlePreferencesSubmit = (values: any) => {
    updatePreferencesMutation.mutate(values);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 flex items-center gap-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="tab-profile"
          >
            <User className="h-4 w-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 flex items-center gap-2 font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="tab-preferences"
          >
            <Settings className="h-4 w-4" />
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 flex items-center gap-2 font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="tab-notifications"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input value={user.username} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user.email || 'Not set'} disabled />
                </div>
                <div>
                  <Label>First Name</Label>
                  <Input value={user.firstName || 'Not set'} disabled />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={user.lastName || 'Not set'} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent>
              {preferencesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handlePreferencesSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="How should we display your name?" data-testid="input-display-name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Tell us about yourself..." rows={4} data-testid="textarea-bio" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Email Notifications</FormLabel>
                            <FormDescription>Receive notifications via email</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-email-notifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Push Notifications</FormLabel>
                            <FormDescription>Receive push notifications</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-push-notifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newsletterSubscribed"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Newsletter</FormLabel>
                            <FormDescription>Subscribe to our newsletter</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-newsletter"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={updatePreferencesMutation.isPending}
                      className="w-full"
                      data-testid="button-save-preferences"
                    >
                      {updatePreferencesMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Preferences
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Notification settings are managed in the Preferences tab above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
