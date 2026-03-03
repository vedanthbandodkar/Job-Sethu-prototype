
"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc } from 'firebase/firestore';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, MapPin, Loader2, Save, XCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from '@/lib/types';
import { updateUserProfileAction } from "@/app/actions";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  location: z.string().optional(),
  skills: z.string().optional(),
  about: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
    const { user: authUser, loading: authLoading } = useUser();
    const db = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isEditMode, setIsEditMode] = useState(false);

    const userRef = useMemo(() => (db && authUser ? doc(db, 'users', authUser.uid) : null), [db, authUser]);
    const [userSnapshot, userLoading] = useDocument(userRef);
    const user = useMemo(() => (userSnapshot?.exists() ? { id: userSnapshot.id, ...userSnapshot.data() } as UserType : undefined), [userSnapshot]);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || '',
                location: user.location || '',
                skills: user.skills?.join(', ') || '',
                about: user.about || '',
            });
        }
    }, [user, form, isEditMode]);
    
    const loading = authLoading || userLoading;

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!authUser) {
        router.replace('/login');
        return null;
    }

    if (!user) {
        return (
            <div className="container mx-auto max-w-4xl py-12 text-center">
                <p>Profile not found. Let's create it.</p>
                <Button onClick={() => router.push('/onboarding')} className="mt-4">Complete Profile</Button>
            </div>
        );
    }
    
    const onSubmit = (data: ProfileFormValues) => {
        if (!user) return;
        
        // Don't submit fields that don't apply to the user type
        const submissionData = {
            name: data.name,
            about: data.about,
            ...(user.userType === 'worker' && {
                location: data.location,
                skills: data.skills,
            }),
        };

        startTransition(async () => {
            const result = await updateUserProfileAction(submissionData, user.id);
            if (result.success) {
                toast({ title: "Profile Updated!", description: "Your changes have been saved." });
                setIsEditMode(false);
            } else {
                toast({ variant: 'destructive', title: 'Update failed', description: result.message });
            }
        });
    }

    return (
        <div className="container mx-auto max-w-4xl py-12">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader className="relative">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                    <AvatarImage src={user.avatarUrl} data-ai-hint="person portrait" />
                                    <AvatarFallback className="text-4xl">{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="text-center md:text-left flex-grow">
                                    {isEditMode ? (
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="text-4xl font-headline h-auto p-0 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <CardTitle className="font-headline text-4xl">{user.name ?? "Unnamed User"}</CardTitle>
                                    )}

                                    {user.userType === 'worker' && (
                                        isEditMode ? (
                                            <FormField
                                                control={form.control}
                                                name="location"
                                                render={({ field }) => (
                                                    <FormItem className="mt-2">
                                                        <FormControl>
                                                            <div className="flex items-center">
                                                                <MapPin className="mr-2 h-5 w-5 text-muted-foreground"/>
                                                                <Input {...field} className="text-lg border-0 p-0 h-auto shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ) : (
                                            user.location && (
                                                <CardDescription className="mt-2 text-lg flex items-center justify-center md:justify-start">
                                                    <MapPin className="mr-2 h-5 w-5"/>
                                                    {user.location}
                                                </CardDescription>
                                            )
                                        )
                                    )}
                                </div>
                            </div>
                            
                            <div className="absolute top-4 right-4 flex gap-2">
                                {isEditMode ? (
                                    <>
                                        <Button type="button" variant="outline" size="sm" onClick={() => setIsEditMode(false)} disabled={isPending}>
                                            <XCircle />
                                            <span>Cancel</span>
                                        </Button>
                                        <Button type="submit" size="sm" disabled={isPending}>
                                            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
                                            <span>Save</span>
                                        </Button>
                                    </>
                                ) : (
                                    <Button type="button" variant="outline" size="icon" onClick={() => setIsEditMode(true)}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit Profile</span>
                                    </Button>
                                )}
                            </div>

                        </CardHeader>
                        <CardContent className="mt-6">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-headline text-xl font-semibold mb-3">About</h3>
                                    {isEditMode ? (
                                        <FormField
                                            control={form.control}
                                            name="about"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea {...field} placeholder="Tell us a little bit about yourself" className="min-h-[100px]" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground whitespace-pre-wrap">
                                            {user.about || "This user hasn't written an about section yet."}
                                        </p>
                                    )}
                                </div>
                                {user.userType === 'worker' && (
                                <div>
                                    <h3 className="font-headline text-xl font-semibold mb-3">Skills</h3>
                                     {isEditMode ? (
                                        <FormField
                                            control={form.control}
                                            name="skills"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Enter skills, separated by commas" />
                                                    </FormControl>
                                                     <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        user.skills && user.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {user.skills.map(skill => (
                                                    <Badge key={skill} className="text-base px-4 py-1">{skill}</Badge>
                                                ))}
                                            </div>
                                        )
                                     )}
                                </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
