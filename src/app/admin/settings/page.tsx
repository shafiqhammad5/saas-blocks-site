'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Shield,
  Database,
  Palette,
  Bell,
  Key,
  Users,
  CreditCard,
  FileText,
  Trash2,
  Plus,
  Edit,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    siteUrl: string
    adminEmail: string
    timezone: string
    language: string
  }
  features: {
    userRegistration: boolean
    emailVerification: boolean
    socialLogin: boolean
    blockComments: boolean
    blockRatings: boolean
    publicBlocks: boolean
  }
  email: {
    provider: string
    smtpHost: string
    smtpPort: string
    smtpUser: string
    smtpPassword: string
    fromEmail: string
    fromName: string
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
    requireStrongPassword: boolean
    twoFactorAuth: boolean
  }
  storage: {
    provider: string
    maxFileSize: number
    allowedFileTypes: string[]
    s3Bucket?: string
    s3Region?: string
    s3AccessKey?: string
    s3SecretKey?: string
  }
  notifications: {
    emailNotifications: boolean
    newUserSignup: boolean
    newBlockCreated: boolean
    subscriptionEvents: boolean
    systemAlerts: boolean
  }
}

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: string | null
  createdAt: string
  isActive: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: [] as string[] })

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const [settingsResponse, apiKeysResponse] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/settings/api-keys')
      ])
      
      if (!settingsResponse.ok || !apiKeysResponse.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const settingsData = await settingsResponse.json()
      const apiKeysData = await apiKeysResponse.json()
      
      setSettings(settingsData)
      setApiKeys(apiKeysData)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) throw new Error('Failed to save settings')
      
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const createApiKey = async () => {
    try {
      const response = await fetch('/api/admin/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApiKey)
      })
      
      if (!response.ok) throw new Error('Failed to create API key')
      
      const apiKey = await response.json()
      setApiKeys([...apiKeys, apiKey])
      setNewApiKey({ name: '', permissions: [] })
      setShowApiKeyDialog(false)
      toast.success('API key created successfully')
    } catch (error) {
      console.error('Error creating API key:', error)
      toast.error('Failed to create API key')
    }
  }

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/settings/api-keys/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete API key')
      
      setApiKeys(apiKeys.filter(key => key.id !== id))
      toast.success('API key deleted successfully')
    } catch (error) {
      console.error('Error deleting API key:', error)
      toast.error('Failed to delete API key')
    }
  }

  const toggleApiKey = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/settings/api-keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
      
      if (!response.ok) throw new Error('Failed to update API key')
      
      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, isActive } : key
      ))
      toast.success(`API key ${isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error updating API key:', error)
      toast.error('Failed to update API key')
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No settings found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Unable to load system settings.</p>
          <Button onClick={fetchSettings} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your platform settings and preferences
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic configuration for your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteName: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.general.siteUrl}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteUrl: e.target.value }
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteDescription: e.target.value }
                  })}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, adminEmail: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, timezone: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, language: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Feature Settings
              </CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.userRegistration}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, userRegistration: checked }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require email verification for new accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.emailVerification}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, emailVerification: checked }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Social Login</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable social media authentication
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.socialLogin}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, socialLogin: checked }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Block Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to comment on blocks
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.blockComments}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, blockComments: checked }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Block Ratings</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to rate blocks
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.blockRatings}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, blockRatings: checked }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Blocks</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow blocks to be publicly visible
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.publicBlocks}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, publicBlocks: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailProvider">Email Provider</Label>
                  <Select
                    value={settings.email.provider}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      email: { ...settings.email, provider: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.email.smtpHost}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpHost: e.target.value }
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.email.smtpPort}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPort: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={settings.email.smtpUser}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpUser: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPassword: e.target.value }
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, fromEmail: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.email.fromName}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, fromName: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Strong Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce uppercase, lowercase, numbers, and symbols
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requireStrongPassword}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, requireStrongPassword: checked }
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable 2FA for admin accounts
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Storage Configuration
              </CardTitle>
              <CardDescription>
                Configure file storage and upload settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storageProvider">Storage Provider</Label>
                  <Select
                    value={settings.storage.provider}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      storage: { ...settings.storage, provider: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.storage.maxFileSize}
                    onChange={(e) => setSettings({
                      ...settings,
                      storage: { ...settings.storage, maxFileSize: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
              
              {settings.storage.provider === 's3' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="s3Bucket">S3 Bucket</Label>
                    <Input
                      id="s3Bucket"
                      value={settings.storage.s3Bucket || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        storage: { ...settings.storage, s3Bucket: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s3Region">S3 Region</Label>
                    <Input
                      id="s3Region"
                      value={settings.storage.s3Region || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        storage: { ...settings.storage, s3Region: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s3AccessKey">Access Key</Label>
                    <Input
                      id="s3AccessKey"
                      value={settings.storage.s3AccessKey || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        storage: { ...settings.storage, s3AccessKey: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s3SecretKey">Secret Key</Label>
                    <Input
                      id="s3SecretKey"
                      type="password"
                      value={settings.storage.s3SecretKey || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        storage: { ...settings.storage, s3SecretKey: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  API Keys
                </div>
                <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                      <DialogDescription>
                        Create a new API key for external integrations
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="apiKeyName">Name</Label>
                        <Input
                          id="apiKeyName"
                          value={newApiKey.name}
                          onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                          placeholder="e.g., Mobile App, Third-party Integration"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createApiKey} disabled={!newApiKey.name}>
                        Create Key
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Manage API keys for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 4)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={apiKey.isActive}
                            onCheckedChange={(checked) => toggleApiKey(apiKey.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteApiKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {apiKeys.length === 0 && (
                <div className="text-center py-8">
                  <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No API keys</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first API key to enable external integrations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}