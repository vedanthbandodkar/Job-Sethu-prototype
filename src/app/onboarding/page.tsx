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
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useTransition } from "react"
import { completeOnboardingAction } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  location: z.string().min(3, "Please enter a valid location."),
  skills: z.string().min(1, "Please list at least one skill."),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const userId = searchParams.get('userId')

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      location: "",
      skills: "",
    },
  })

  useEffect(() => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Invalid Access",
        description: "You must sign up before accessing the onboarding page.",
      })
      router.replace('/signup')
    }
  }, [userId, router, toast])

  function onSubmit(data: OnboardingValues) {
    if (!userId) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No user ID found. Please sign up again.",
        })
        router.push('/signup');
        return;
    }

    startTransition(async () => {
        const result = await completeOnboardingAction({ ...data, userId });
        if (result.success) {
            toast({
                title: "Profile Complete!",
                description: "Welcome! Redirecting to your dashboard.",
            })
            router.push(`/dashboard?userId=${userId}`);
        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: result.message || "There was a problem with your request.",
            })
        }
    })
  }
  
  if (!userId) {
    return (
        <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
            <p>Invalid onboarding session. Redirecting...</p>
        </div>
    );
  }


  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Welcome to Job Sethu!</CardTitle>
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
