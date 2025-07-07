import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserById } from "@/lib/data";
import { Pencil, MapPin } from "lucide-react";

export default async function ProfilePage() {
    // Mock getting the current logged-in user
    const user = await getUserById('user-5');

    if (!user) {
        return <p>User not found.</p>;
    }

    return (
        <div className="container mx-auto max-w-4xl py-12">
            <Card>
                <CardHeader className="relative">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                            <AvatarImage src={user.avatarUrl} data-ai-hint="person portrait" />
                            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left">
                            <CardTitle className="font-headline text-4xl">{user.name}</CardTitle>
                            <CardDescription className="mt-2 text-lg flex items-center justify-center md:justify-start">
                                <MapPin className="mr-2 h-5 w-5"/>
                                {user.location}
                            </CardDescription>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" className="absolute top-4 right-4">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit Profile</span>
                    </Button>
                </CardHeader>
                <CardContent className="mt-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-headline text-xl font-semibold mb-3">About</h3>
                            <p className="text-muted-foreground">
                                A brief bio would go here. Since we didn't collect it during onboarding, this is a great place for users to add more personality to their profile. They could talk about their work ethic, experience, or what they're passionate about.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-headline text-xl font-semibold mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.skills.map(skill => (
                                    <Badge key={skill} className="text-base px-4 py-1">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
