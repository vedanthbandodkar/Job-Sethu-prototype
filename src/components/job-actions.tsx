"use client"

import type { Job } from "@/lib/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Check, Send, CheckCheck, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { applyForJobAction } from "@/app/actions";

type JobActionsProps = {
    job: Job;
    isPoster: boolean;
    isWorker: boolean;
    hasApplied: boolean;
    currentUserId: string;
}

export function JobActions({ job, isPoster, isWorker, hasApplied, currentUserId }: JobActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleApply = () => {
        startTransition(async () => {
            await applyForJobAction(job.id, currentUserId);
            alert("Applied to job!");
        });
    };

    const handleMarkComplete = () => alert("Job marked as complete. Waiting for poster confirmation.");
    const handleConfirmCompletion = () => alert("Job completed and payment processed!");


    const getActionForUser = () => {
        if (job.status === 'completed') {
            return <p className="text-center text-green-600 font-semibold flex items-center justify-center"><CheckCheck className="mr-2 h-5 w-5"/> This job is completed.</p>
        }
        if (isPoster) {
            return <p className="text-center text-sm text-muted-foreground">You are the poster of this job. You can manage applicants or chat with the assigned worker.</p>
        }
        if (isWorker) {
            return <Button onClick={handleMarkComplete} className="w-full" size="lg"><Check className="mr-2"/> Mark as Complete</Button>
        }
        if (hasApplied) {
            return <Button className="w-full" size="lg" disabled>Applied</Button>
        }
        if (job.status === 'open') {
             return (
                <Button onClick={handleApply} className="w-full" size="lg" disabled={isPending}>
                    {isPending ? (
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

    const getActionForPoster = () => {
        if (job.status === 'completed') return null; // Already handled above

        // This is a placeholder for a future state e.g., 'pending_completion'
        // For now, let's assume if the worker is 'user-2' on 'job-2', they've marked it complete
        if (isPoster && job.id === 'job-2' && job.workerId === 'user-2' && job.status === 'assigned') {
            return (
                <div className="mt-4">
                    <Button onClick={handleConfirmCompletion} variant="default" className="w-full bg-green-600 hover:bg-green-700" size="lg">
                        <CheckCheck className="mr-2"/> Confirm Completion
                    </Button>
                    <p className="text-xs text-center mt-2 text-muted-foreground">The worker has marked this job as complete.</p>
                </div>
            )
        }
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Actions</CardTitle>
            </CardHeader>
            <CardContent>
                {getActionForUser()}
                {getActionForPoster()}
            </CardContent>
        </Card>
    )
}
