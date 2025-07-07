"use client"

import type { Job } from "@/lib/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Check, Send, CheckCheck, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { applyForJobAction, markJobCompleteAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type JobActionsProps = {
    job: Job;
    isPoster: boolean;
    isWorker: boolean;
    hasApplied: boolean;
    currentUserId: string;
}

export function JobActions({ job, isPoster, isWorker, hasApplied, currentUserId }: JobActionsProps) {
    const [isApplying, startApplyingTransition] = useTransition();
    const [isCompleting, startCompletingTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const handleApply = () => {
        startApplyingTransition(async () => {
            await applyForJobAction(job.id, currentUserId);
            toast({
                title: "Successfully Applied!",
                description: "The job poster has been notified. You can see this job in your dashboard.",
            });
            router.refresh();
        });
    };

    const handleMarkComplete = () => {
        startCompletingTransition(async () => {
            await markJobCompleteAction(job.id);
            toast({
                title: "Job Completed!",
                description: "You've marked this job as complete.",
            });
            router.refresh();
        });
    };


    const getActionForUser = () => {
        if (job.status === 'completed') {
            return <p className="text-center text-green-600 font-semibold flex items-center justify-center"><CheckCheck className="mr-2 h-5 w-5"/> This job is completed.</p>
        }
        if (isPoster) {
             if (job.status === 'assigned') {
                 return <p className="text-center text-sm text-muted-foreground">You can chat with the assigned worker to coordinate.</p>
            }
            return <p className="text-center text-sm text-muted-foreground">You are the poster of this job. Review applicants below.</p>
        }
        if (isWorker) {
            return (
                <Button onClick={handleMarkComplete} className="w-full" size="lg" disabled={isCompleting}>
                    {isCompleting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Marking...
                        </>
                    ) : (
                        <><Check className="mr-2"/> Mark as Complete</>
                    )}
                </Button>
            );
        }
        if (hasApplied) {
            return <Button className="w-full" size="lg" disabled>Applied</Button>
        }
        if (job.status === 'open') {
             return (
                <Button onClick={handleApply} className="w-full" size="lg" disabled={isApplying}>
                    {isApplying ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying...
                        </>
                    ) : (
                        <><Send className="mr-2"/> Apply Now</>
                    )}
                </Button>
            )
        }
        return <p className="text-center text-sm text-muted-foreground">This job has already been assigned.</p>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Actions</CardTitle>
            </CardHeader>
            <CardContent>
                {getActionForUser()}
            </CardContent>
        </Card>
    )
}
