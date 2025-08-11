<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { toast } from '@/components/ui/toast'
import { X } from 'lucide-vue-next'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

const router = useRouter()
const auth = useAuth()
const user = computed<any>(() => auth.user || {})

const avatarUrl = computed(() => {
    if (!user.value?.email) return ''
    return `https://unavatar.io/${user.value.email}?fallback=https://avatar.vercel.sh/${user.value.name}?size=128`
})
const initial = computed(() => user.value?.name?.[0] || 'U')
const goToHome = () => { router.push('/home') }

const nameError = ref(''); const emailError = ref(''); const passwordError = ref(''); const deleteError = ref('')

/* Name form */
const nameSchema = toTypedSchema(z.object({ name: z.string().min(2, 'Name is too short') }))
const nameForm = useForm<{ name: string }>({
    validationSchema: nameSchema,
    initialValues: { name: user.value?.name || '' },
})
const updateName = async (values: { name: string }) => {
    nameError.value = ''
    try {
        await auth.updateName(values.name)
        toast({ title: 'Success', description: h('span', {}, `Your name has been updated to ${values.name}`) })
    } catch (err) {
        console.error('Error updating name:', err)
        nameError.value = 'Failed to update name'
        toast({ title: 'Error', description: nameError.value, variant: 'destructive' })
    }
}

/* Email form */
const emailSchema = toTypedSchema(z.object({
    email: z.string().email({ message: 'Email invalide' }),
    password: z.string().min(6, 'Mot de passe trop court'),
}))
const emailForm = useForm<{ email: string; password: string }>({
    validationSchema: emailSchema,
    initialValues: { email: '', password: '' },
})
const updateEmail = async (values: { email: string; password: string }) => {
    emailError.value = ''
    try {
        await auth.updateEmail(values.email, values.password)
        toast({ title: 'Mise à jour réussie', description: h('span', {}, `Votre email a été mis à jour avec succès à ${values.email}`) })
        emailForm.resetForm({ values: { email: '', password: '' } })
    } catch (err: any) {
        console.error('Error updating email:', err)
        if (err?.response?.data?.message === 'User already exists') emailError.value = "L'email est déjà utilisé par un autre compte"
        else if (err?.response?.data?.message === 'Invalid credentials') emailError.value = 'Mot de passe incorrect'
        else emailError.value = "Échec de la mise à jour de l'email"
        toast({ title: 'Error', description: emailError.value, variant: 'destructive' })
    }
}

/* Password form */
const passwordSchema = toTypedSchema(z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine(d => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
}))
const passwordForm = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>({
    validationSchema: passwordSchema,
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
})
const passwordSuccess = ref(false)
watch(() => [passwordForm.values.currentPassword, passwordForm.values.newPassword, passwordForm.values.confirmPassword], () => {
    if (passwordSuccess.value) passwordSuccess.value = false
})
const updatePassword = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    passwordError.value = ''
    passwordSuccess.value = false
    try {
        await auth.updatePassword(values.currentPassword, values.newPassword)
        passwordSuccess.value = true
        toast({ title: 'Success', description: h('span', {}, 'Your password has been updated successfully') })
        passwordForm.resetForm({ values: { currentPassword: '', newPassword: '', confirmPassword: '' } })
    } catch (err: any) {
        console.error('Error updating password:', err)
        passwordError.value = err?.response?.data?.message === 'Invalid credentials'
            ? 'Current password is incorrect'
            : 'Failed to update password'
        toast({ title: 'Error', description: passwordError.value, variant: 'destructive' })
    }
}

/* Delete form */
const deleteSchema = toTypedSchema(z.object({
    password: z.string().min(1, 'Password is required'),
    confirmation: z.literal('delete my account', {
        errorMap: () => ({ message: 'Please type "delete my account" to confirm' }),
    }),
}))
const deleteForm = useForm<{ password: string; confirmation: string }>({
    validationSchema: deleteSchema,
    initialValues: { password: '', confirmation: '' },
})
const deleteAccount = async (values: { password: string; confirmation: string }) => {
    deleteError.value = ''
    try {
        await auth.deleteAccount(values.password)
        toast({ title: 'Account Deleted', description: h('span', {}, 'Your account has been permanently deleted') })
    } catch (err: any) {
        console.error('Error deleting account:', err)
        deleteError.value =
            err?.response?.data?.message === 'Invalid credentials' ? 'Incorrect password' : 'Failed to delete account'
        toast({ title: 'Error', description: deleteError.value, variant: 'destructive' })
    }
}
</script>

<template>
  <div class="container py-10 max-w-2xl mx-auto relative bg-primary/5 rounded-lg p-6">
    <!-- Close button -->
    <button 
      @click="goToHome" 
      class="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Close"
    >
      <X class="h-6 w-6" />
    </button>

    <div class="flex flex-col items-center mb-8">
      <Avatar class="h-24 w-24 mb-4">
        <AvatarImage :src="avatarUrl" :alt="user.name" />
        <AvatarFallback class="text-lg">
          {{ initial }}
        </AvatarFallback>
      </Avatar>
      <h1 class="text-3xl font-bold">Account Settings</h1>
      <p class="text-muted-foreground">Manage your account information</p>
    </div>

    <Tabs default-value="profile" class="w-full">
      <TabsList class="grid w-full grid-cols-4 bg-primary/10">
        <TabsTrigger value="profile" class="data-[state=active]:bg-primary data-[state=active]:text-white">Profile</TabsTrigger>
        <TabsTrigger value="email" class="data-[state=active]:bg-primary data-[state=active]:text-white">Email</TabsTrigger>
        <TabsTrigger value="password" class="data-[state=active]:bg-primary data-[state=active]:text-white">Password</TabsTrigger>
        <TabsTrigger value="danger" class="data-[state=active]:bg-primary data-[state=active]:text-white">Danger Zone</TabsTrigger>
      </TabsList>

      <!-- Profile Tab -->
      <TabsContent value="profile">
        <Card class="shadow-sm border-border">
          <CardHeader class="pb-3">
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Form :validation-schema="nameSchema" :initial-values="{ name: user.name || '' }"
                    @submit="(v) => updateName(v as { name: string })"
                    class="space-y-6">
              <Alert v-if="nameError" variant="destructive" class="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{{ nameError }}</AlertDescription>
              </Alert>

              <div class="flex items-center gap-4 mb-4">
                <Avatar class="h-16 w-16">
                  <AvatarImage :src="avatarUrl" :alt="user.name" />
                  <AvatarFallback>{{ initial }}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 class="text-lg font-medium">{{ user.name || 'Your Name' }}</h3>
                  <p class="text-sm text-muted-foreground">{{ user.email || 'your.email@example.com' }}</p>
                </div>
              </div>

              <FormField name="name" v-slot="{ componentField }">
                <FormItem v-auto-animate>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" placeholder="Your name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <Button type="submit" class="w-full sm:w-auto bg-primary text-white">Update Profile</Button>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Email Tab -->
      <TabsContent value="email">
        <Card class="shadow-sm border-border">
          <CardHeader class="pb-3">
            <CardTitle>Email</CardTitle>
            <CardDescription>
              Update your email address. You'll need to confirm with your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Form :validation-schema="emailSchema" :initial-values="{ email: '', password: '' }"
                    @submit="(v) => updateEmail(v as { email: string; password: string })"
                    class="space-y-6">
              <Alert v-if="emailError" variant="destructive" class="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{{ emailError }}</AlertDescription>
              </Alert>

              <div class="p-4 bg-primary/10 rounded-lg mb-2">
                <p class="text-sm font-medium">Current email</p>
                <p class="text-muted-foreground">{{ user.email || 'your.email@example.com' }}</p>
              </div>

              <FormField name="email" v-slot="{ componentField }">
                <FormItem v-auto-animate>
                  <FormLabel>New Email</FormLabel>
                  <FormControl>
                    <Input type="email" v-bind="componentField" placeholder="new.email@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField name="password" v-slot="{ componentField }">
                <FormItem v-auto-animate>
                  <FormLabel>Confirm with Password</FormLabel>
                  <FormControl>
                    <Input type="password" v-bind="componentField" placeholder="Your current password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <Button type="submit" class="w-full sm:w-auto bg-primary text-white">Update Email</Button>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Password Tab -->
      <TabsContent value="password">
        <Card class="shadow-sm border-border">
          <CardHeader class="pb-3">
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Form :validation-schema="passwordSchema"
                    :initial-values="{ currentPassword: '', newPassword: '', confirmPassword: '' }"
                    @submit="(v) => updatePassword(v as { currentPassword: string; newPassword: string; confirmPassword: string })"
                    class="space-y-6">
              <Alert v-if="passwordError" variant="destructive" class="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{{ passwordError }}</AlertDescription>
              </Alert>

              <Alert v-if="passwordSuccess" variant="default" class="mb-4 bg-green-50 border-green-200 text-green-800">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Your password has been updated successfully!</AlertDescription>
              </Alert>

              <div class="p-4 bg-primary/10 rounded-lg mb-2">
                <p class="text-sm font-medium">Password security</p>
                <p class="text-muted-foreground">For your security, we recommend using a strong, unique password that you don't use elsewhere.</p>
              </div>

              <FormField name="currentPassword" v-slot="{ componentField }">
                <FormItem v-auto-animate>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" v-bind="componentField" placeholder="Your current password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField name="newPassword" v-slot="{ componentField }">
                <FormItem v-auto-animate>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" v-bind="componentField" placeholder="New password (min. 6 characters)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField name="confirmPassword" v-slot="{ componentField }">
                <FormItem v-auto-animate>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" v-bind="componentField" placeholder="Confirm new password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <Button type="submit" class="w-full sm:w-auto bg-primary text-white">Update Password</Button>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Danger Zone Tab -->
      <TabsContent value="danger">
        <Card class="shadow-sm border-border">
          <CardHeader class="pb-3 border-b">
            <CardTitle class="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all your data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent class="pt-6">
              <Form :validation-schema="deleteSchema" :initial-values="{ password: '', confirmation: '' }"
                    @submit="(v) => deleteAccount(v as { password: string; confirmation: string })"
                    class="space-y-6">
              <Alert v-if="deleteError" variant="destructive" class="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{{ deleteError }}</AlertDescription>
              </Alert>

              <Alert variant="destructive" class="mb-4">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action is permanent and cannot be undone. All your data will be permanently deleted.
                </AlertDescription>
              </Alert>

              <div class="p-4 bg-destructive/10 rounded-lg border border-destructive/20 mb-2">
                <div class="flex items-center gap-4">
                  <Avatar class="h-16 w-16">
                    <AvatarImage :src="avatarUrl" :alt="user.name" />
                    <AvatarFallback>{{ initial }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 class="text-lg font-medium">{{ user.name || 'Your Name' }}</h3>
                    <p class="text-sm text-muted-foreground">{{ user.email || 'your.email@example.com' }}</p>
                  </div>
                </div>
              </div>

              <FormField name="password" v-slot="{ componentField }">
                <FormItem v-auto-animate>
                  <FormLabel>Confirm with Password</FormLabel>
                  <FormControl>
                    <Input type="password" v-bind="componentField" placeholder="Your current password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField name="confirmation" v-slot="{ componentField }">
                <FormItem v-auto-animate>
                  <FormLabel>Type "delete my account" to confirm</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" placeholder="delete my account" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <Button type="submit" variant="destructive" class="w-full">Delete Account</Button>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
