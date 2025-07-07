"use client"

import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Check } from "lucide-react";

type ApplicantListProps = {
    applicants: User[];
    jobId: string;
}

export function ApplicantList({ applicants, jobId }: ApplicantListProps) {
    if (applicants.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Applicants</CardTitle>
                    <CardDescription>No one has applied for this job yet.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const handleSelectApplicant = (userId: string) => {
        alert(`Selected applicant ${userId} for job ${jobId}. You can now chat with them.`);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Applicants ({applicants.length})</CardTitle>
                <CardDescription>Review the candidates who have applied for this job.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {applicants.map(applicant => (
                        <li key={applicant.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={applicant.avatarUrl} data-ai-hint="person avatar" />
                                    <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{applicant.name}</p>
                                    <Link href={`/profile/${applicant.id}`} className="text-sm text-primary hover:underline">View Profile</Link>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handleSelectApplicant(applicant.id)}>
                                <Check className="mr-2 h-4 w-4" /> Select
                            </Button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
