
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTransition, useState, useRef, useEffect } from "react"
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
import { Loader2 } from "lucide-react"
import { updateUserProfileAction } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types"
import { DialogClose } from "./ui/dialog"

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  location: z.string().min(3, "Please enter a valid location."),
  skills: z.string().min(1, "Please list at least one skill."),
  about: z.string().max(500, "About section cannot exceed 500 characters.").optional(),
  avatarFile: z.any().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function EditProfileForm({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name ?? "",
      location: user.location ?? "",
      skills: user.skills?.join(", ") ?? "",
      about: user.about ?? "",
      avatarFile: undefined,
    },
    mode: "onChange",
  })
  
  async function onSubmit(data: ProfileFormValues) {
    startTransition(async () => {
        let imageDataUri: string | undefined = undefined;
        if (data.avatarFile && data.avatarFile instanceof File) {
            try {
                imageDataUri = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target?.result as string);
                    reader.onerror = e => reject(e);
                    reader.readAsDataURL(data.avatarFile);
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
        
        const result = await updateUserProfileAction({ 
            ...data, 
            userId: user.id,
            avatarFile: imageDataUri 
        });

        if (result?.success) {
            toast({
                title: "Profile Updated!",
                description: "Your profile has been saved successfully.",
            });
            router.refresh();
            closeButtonRef.current?.click();
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="avatarFile"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={e => onChange(e.target.files?.[0])}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <FormDescription>
                Enter your skills separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Me</FormLabel>
              <FormControl>
                <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-y min-h-[100px]"
                    {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <DialogClose asChild>
                <Button type="button" variant="outline" ref={closeButtonRef}>Cancel</Button>
            </DialogClose>
             <Button type="submit" disabled={isPending}>
                {isPending ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                    </>
                ) : (
                    "Save Changes"
                )}
            </Button>
        </div>
      </form>
    </Form>
  )
}
