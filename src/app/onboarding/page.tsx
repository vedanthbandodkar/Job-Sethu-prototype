"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useTransition } from "react"
import { completeOnboardingAction } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useUser } from "@/firebase"
import { Skeleton } from "@/components/ui/skeleton"

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  location: z.string().min(3, "Please enter a valid location."),
  skills: z.string().min(1, "Please list at least one skill."),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const { user, loading } = useUser();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      location: "",
      skills: "",
    },
  })
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
    if (user) {
      form.setValue('name', user.displayName || '');
    }
  }, [user, loading, router, form])

  function onSubmit(data: OnboardingValues) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No user found. Please sign in again.",
        })
        router.push('/login');
        return;
    }

    startTransition(async () => {
        const result = await completeOnboardingAction(data, user.uid, user.email, user.photoURL);
        if (result.success) {
            toast({
                title: "Profile Complete!",
                description: "Welcome! Redirecting to your dashboard.",
            })
            router.push(`/dashboard`);
        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: result.message || "There was a problem with your request.",
            })
        }
    })
  }
  
  if (loading || !user) {
    return (
        <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }


  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Welcome to Hire Ups!</CardTitle>
          <CardDescription>Let's set up your profile so you can get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alice Johnson" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco, CA" {...field} />
                    </FormControl>
                    <FormDescription>This helps us find jobs near you.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., React, Plumbing, Graphic Design" {...field} />
                    </FormControl>
                    <FormDescription>Enter your skills separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Complete Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
