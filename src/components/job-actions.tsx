
"use client"

import type { Job } from "@/lib/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Check, Send, CheckCheck, Loader2, IndianRupee, Ban } from "lucide-react";
import { useTransition } from "react";
import { applyForJobAction, markJobCompleteAction, cancelJobAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type JobActionsProps = {
    job: Job;
    currentUserId: string;
}

export function JobActions({ job, currentUserId }: JobActionsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const isPoster = job.posterId === currentUserId;
    const isWorker = job.workerId === currentUserId;
    const hasApplied = job.applicants.includes(currentUserId);

    const handleApply = () => {
        startTransition(async () => {
            await applyForJobAction(job.id, currentUserId);
            toast({
                title: "Successfully Applied!",
                description: "The job poster has been notified. You can see this job in your dashboard.",
            });
        });
    };

    const handleMarkComplete = () => {
        startTransition(async () => {
            await markJobCompleteAction(job.id);
            toast({
                title: "Job Completed!",
                description: "You've marked this job as complete.",
            });
        });
    };

    const handleCancelJob = () => {
        startTransition(async () => {
            await cancelJobAction(job.id);
             toast({
                title: "Job Canceled",
                description: "This job post has been removed.",
            })
            router.push(`/dashboard?userId=${currentUserId}&tab=postings`);
        });
    }

    const handlePayment = () => {
        toast({
            title: "Payment Processing",
            description: "In a real app, this would redirect to a payment gateway.",
        });
    }

    const getActionForUser = () => {
        if (isPoster) {
            switch (job.status) {
                case 'open':
                    return (
                        <Button variant="destructive" onClick={handleCancelJob} className="w-full" size="lg" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2"/>}
                            Cancel Job
                        </Button>
                    );
                case 'assigned':
                    return <p className="text-center text-sm text-muted-foreground">You can chat with the assigned worker to coordinate.</p>;
                case 'completed':
                    return (
                        <Button onClick={handlePayment} className="w-full" size="lg">
                            <IndianRupee className="mr-2"/> Pay Now
                        </Button>
                    );
                case 'paid':
                     return <p className="text-center text-sm text-green-600 font-semibold flex items-center justify-center"><CheckCheck className="mr-2 h-5 w-5"/> This job has been paid.</p>
                case 'canceled':
                     return <p className="text-center text-sm text-muted-foreground">This job has been canceled.</p>
            }
        }

        if (job.status === 'completed' || job.status === 'paid') {
             return <p className="text-center text-green-600 font-semibold flex items-center justify-center"><CheckCheck className="mr-2 h-5 w-5"/> This job is completed.</p>
        }
        
        if (isWorker) {
            return (
                <Button onClick={handleMarkComplete} className="w-full" size="lg" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2"/>}
                     Mark as Complete
                </Button>
            );
        }

        if (hasApplied) {
            return <Button className="w-full" size="lg" disabled>Applied</Button>
        }

        if (job.status === 'open') {
             return (
                <Button onClick={handleApply} className="w-full" size="lg" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2"/>}
                    Apply Now
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
