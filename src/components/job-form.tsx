"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, Loader2 } from "lucide-react"
import { createJobAction } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

const jobFormSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  skills: z.string().min(1, {
    message: "Please add at least one skill.",
  }),
  payment: z.coerce.number().min(1, {
    message: "Payment must be a positive number.",
  }),
  location: z.string().min(3, {
    message: "Location is required.",
  }),
  sos: z.boolean().default(false),
})

type JobFormValues = z.infer<typeof jobFormSchema>

const defaultValues: Partial<JobFormValues> = {
  title: "",
  description: "",
  skills: "",
  location: "",
  payment: undefined,
  sos: false,
}

export function JobForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: JobFormValues) {
    startTransition(async () => {
        const result = await createJobAction(data);
        if (result?.success) {
            form.reset();
            toast({
                title: "Job Created!",
                description: "Your job has been posted successfully.",
            });
            // Wait for a moment before redirecting
            setTimeout(() => {
                router.push('/dashboard?tab=postings');
            }, 1500);
        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: result?.message || "There was a problem with your request.",
            })
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Build a responsive website" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed description of the job requirements."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Skills</FormLabel>
              <FormControl>
                <Input placeholder="e.g., React, Plumbing, Graphic Design" {...field} />
              </FormControl>
              <FormDescription>
                Enter skills separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="payment"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Payment (INR)</FormLabel>
                <FormControl>
                    <Input 
                        type="number"
                        placeholder="e.g., 5000"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : +e.target.value)}
                    />
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
                <FormLabel>Location</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., San Francisco, CA" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="sos"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/50">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-destructive"/>
                  Mark as SOS (Urgent)
                </FormLabel>
                <FormDescription>
                  Enable this if the job needs immediate attention. It will be highlighted.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Job"
          )}
        </Button>
      </form>
    </Form>
  )
}
