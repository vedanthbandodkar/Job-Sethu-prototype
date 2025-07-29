

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompletedJobsForUser, getUserById } from "@/lib/data";
import { Pencil, MapPin, Briefcase, CalendarCheck, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format, formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EditProfileForm } from "@/components/edit-profile-form";
import type { User } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ searchParams }: { searchParams?: { userId?: string, viewUserId?: string } }) {
    // The current logged-in user
    const currentUserId = searchParams?.userId || 'user-5';
    // The user whose profile is being viewed
    const profileUserId = searchParams?.viewUserId || currentUserId;
    
    const user = await getUserById(profileUserId);
    const completedJobs = await getCompletedJobsForUser(profileUserId);

    if (!user) {
        return <p className="p-8 text-center">User not found.</p>;
    }
    
    // Check if the current user is viewing their own profile
    const isOwnProfile = currentUserId === profileUserId;

    const memberSince = user.createdAt ? format(user.createdAt, "MMMM yyyy") : 'N/A';

    return (
        <div className="container mx-auto max-w-4xl py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    <Card>
                        <CardHeader className="relative">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                    <AvatarImage src={user.avatarUrl} data-ai-hint="person portrait" />
                                    <AvatarFallback className="text-4xl">{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="text-center mt-4">
                                    <CardTitle className="font-headline text-2xl">{user.name ?? "Unnamed User"}</CardTitle>
                                    <CardDescription className="mt-1 text-base flex items-center justify-center">
                                        <MapPin className="mr-1.5 h-4 w-4"/>
                                        {user.location}
                                    </CardDescription>
                                </div>
                            </div>
                           {isOwnProfile && (
                             <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon" className="absolute top-4 right-4">
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit Profile</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[480px]">
                                    <DialogHeader>
                                        <DialogTitle>Edit Profile</DialogTitle>
                                        <DialogDescription>
                                            Make changes to your profile here. Click save when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <EditProfileForm user={user as User} />
                                </DialogContent>
                            </Dialog>
                           )}
                        </CardHeader>
                        <CardContent className="mt-2">
                             <div className="space-y-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                    <Briefcase className="mr-3 h-4 w-4" />
                                    <span>{completedJobs.length} Jobs Completed</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="mr-3 h-4 w-4" />
                                    <span>Member since {memberSince}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {user.skills.map(skill => (
                                    <Badge key={skill} className="text-sm px-3 py-1">{skill}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">About {user.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground whitespace-pre-wrap">
                                {user.about || "This user hasn't written an about section yet."}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Work History</CardTitle>
                            <CardDescription>A showcase of successfully completed jobs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {completedJobs.length > 0 ? (
                                <ul className="space-y-6">
                                    {completedJobs.map(job => (
                                        <li key={job.id} className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-3 rounded-full">
                                                <CalendarCheck className="h-5 w-5 text-primary"/>
                                            </div>
                                            <div>
                                                <Link href={`/jobs/${job.id}?userId=${currentUserId}`} className="font-semibold hover:underline">{job.title}</Link>
                                                <p className="text-sm text-muted-foreground">
                                                    Completed {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                           ) : (
                             <p className="text-muted-foreground text-center py-4">No completed jobs yet.</p>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
