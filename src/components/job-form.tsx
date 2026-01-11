
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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
import { AlertTriangle, Loader2, Upload } from "lucide-react"
import { createJobAction } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/firebase"

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
  imageUrl: z.string().min(1, {
    message: "An image is required.",
  })
})

type JobFormValues = z.infer<typeof jobFormSchema>

const defaultValues: Partial<JobFormValues> = {
  title: "",
  description: "",
  skills: "",
  location: "",
  payment: undefined,
  sos: false,
  imageUrl: "",
}

export function JobForm() {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: JobFormValues) {
    if (!user) {
        toast({ variant: "destructive", title: "You must be logged in to create a job." });
        return;
    }

    startTransition(async () => {
        const result = await createJobAction(data, user.uid);
        if (result?.success) {
            form.reset();
            setImagePreview(null);
            toast({
                title: "Job Created!",
                description: "Your job has been posted successfully.",
            });
            router.push(`/dashboard?tab=postings`);
        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: result?.message || "There was a problem with your request.",
            })
        }
    });
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        form.setValue('imageUrl', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

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
            name="imageUrl"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Job Image</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <label className="flex-grow cursor-pointer rounded-md border border-dashed flex flex-col items-center justify-center p-4 text-center text-muted-foreground hover:bg-muted/50 transition-colors">
                                <Upload className="h-8 w-8 mb-2" />
                                <span>Click to upload an image</span>
                                <Input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                            {imagePreview && (
                                <div className="w-32 h-32 relative rounded-md overflow-hidden shrink-0">
                                    <Image src={imagePreview} alt="Image preview" fill className="object-cover" />
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormDescription>
                        A professional image helps your job post stand out.
                    </FormDescription>
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
