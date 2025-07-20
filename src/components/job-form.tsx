
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, Loader2, Sparkles, Upload } from "lucide-react"
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
  imageSource: z.enum(['ai', 'upload']).default('ai'),
  imageFile: z.any().optional(),
}).refine(data => {
    if (data.imageSource === 'upload') {
        return data.imageFile instanceof File;
    }
    return true;
}, {
    message: "Please upload an image file.",
    path: ["imageFile"],
});

type JobFormValues = z.infer<typeof jobFormSchema>

const defaultValues: Partial<JobFormValues> = {
  title: "",
  description: "",
  skills: "",
  location: "",
  payment: undefined,
  sos: false,
  imageSource: 'ai',
}

export function JobForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
    mode: "onChange",
  })
  
  const imageSource = form.watch("imageSource");

  function onSubmit(data: JobFormValues) {
    const userId = searchParams.get('userId') || 'user-5'; // Default to mock user if not found

    startTransition(async () => {
        let imageDataUri: string | undefined = undefined;
        if (data.imageSource === 'upload' && data.imageFile) {
            try {
                imageDataUri = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target?.result as string);
                    reader.onerror = e => reject(e);
                    reader.readAsDataURL(data.imageFile);
                });
            } catch (error) {
                 toast({
                    variant: "destructive",
                    title: "Image Read Error",
                    description: "Could not read the uploaded image file.",
                })
                return;
            }
        }
        
        const result = await createJobAction({ 
            ...data, 
            userId, 
            imageFile: imageDataUri 
        });

        if (result?.success && result.userId) {
            form.reset();
            toast({
                title: "Job Created!",
                description: "Your job has been posted successfully.",
            });
            // Use router.push for a faster, client-side navigation
            router.push(`/dashboard?tab=postings&userId=${result.userId}`);
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
          name="imageSource"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Job Image</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="ai" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center">
                      <Sparkles className="mr-2 h-4 w-4 text-primary" /> Generate with AI (Default)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="upload" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center">
                       <Upload className="mr-2 h-4 w-4" /> Upload your own
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {imageSource === 'upload' && (
            <FormField
            control={form.control}
            name="imageFile"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Upload Image</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={e => onChange(e.target.files?.[0])}
                    {...rest}
                  />
                </FormControl>
                <FormDescription>
                    We recommend an image with a 16:9 aspect ratio.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


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
