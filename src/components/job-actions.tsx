
"use client"

import type { JobWithDate } from "@/lib/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Check, Send, CheckCheck, Loader2, IndianRupee, Ban } from "lucide-react";
import { useTransition } from "react";
import { applyForJobAction, markJobCompleteAction, cancelJobAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

type JobActionsProps = {
    job: JobWithDate;
}

export function JobActions({ job }: JobActionsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const currentUserId = user?.uid;

    const isPoster = job.posterId === currentUserId;
    const isWorker = job.workerId === currentUserId;
    const hasApplied = currentUserId && job.applicantIds ? job.applicantIds.includes(currentUserId) : false;

    const handleAction = (action: (...args: any[]) => Promise<any>, successTitle: string, successMessage: string, ...args: any[]) => {
        if (!currentUserId) {
            toast({ variant: 'destructive', title: "You must be logged in." });
            router.push('/login');
            return;
        }

        startTransition(async () => {
            const result = await action(...args, currentUserId);
            if (result.success) {
                toast({
                    title: successTitle,
                    description: successMessage,
                });
                router.refresh();
            } else {
                toast({
                    variant: 'destructive',
                    title: "Action Failed",
                    description: result.message || "An unexpected error occurred."
                })
            }
        });
    };

    const handleApply = () => handleAction(applyForJobAction, "Successfully Applied!", "The job poster has been notified.", job.id);
    const handleMarkComplete = () => handleAction(markJobCompleteAction, "Job Completed!", "You've marked this job as complete.", job.id);
    const handleCancelJob = () => handleAction(cancelJobAction, "Job Canceled", "This job post has been removed.", job.id);

    const handlePayment = () => {
        toast({
            title: "Payment Processing",
            description: "In a real app, this would redirect to a payment gateway.",
        });
    }

    const getActionForUser = () => {
        if (!currentUserId) {
             return (
                <Button onClick={() => router.push('/login')} className="w-full" size="lg">
                    <Send className="mr-2"/> Login to Apply
                </Button>
            )
        }
        
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
