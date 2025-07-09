
"use client";

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Job } from '@/lib/types';
import { MapPin, IndianRupee, AlertTriangle, ArrowRight, Ban, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { cancelJobAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type JobCardProps = {
  job: Job;
  userId?: string | null;
};

export function JobCard({ job, userId }: JobCardProps) {
  const [timeAgo, setTimeAgo] = useState('');
  const [isCancelling, startCancelTransition] = useTransition();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // This check is to prevent hydration mismatch errors on the server.
    // The server-rendered output will be an empty string, and the client will update it.
    setTimeAgo(formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }));
  }, [job.createdAt]);

  const jobUrl = userId ? `/jobs/${job.id}?userId=${userId}` : `/jobs/${job.id}`;
  const isDashboardPostings = pathname === '/dashboard' && job.posterId === userId;
  const canCancel = isDashboardPostings && job.status === 'open';

  const handleCancelJob = () => {
    startCancelTransition(async () => {
        await cancelJobAction(job.id);
        toast({
            title: "Job Canceled",
            description: "Your job post has been successfully removed.",
        })
    });
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-lg bg-card">
      <div className="relative">
        {job.imageUrl ? (
          <div className="relative h-40 w-full">
            <Image src={job.imageUrl} alt={job.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        ) : (
          <div className="h-4 bg-muted" />
        )}
        <CardHeader className={job.imageUrl ? 'absolute bottom-0 text-white' : ''}>
          <div className="flex justify-between items-start gap-4">
              <div className="flex-grow">
                  <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                  <CardDescription className={`flex items-center text-sm pt-1 ${job.imageUrl ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      <MapPin className="mr-1.5 h-4 w-4" /> {job.location}
                  </CardDescription>
              </div>
              <div className="flex flex-col items-end space-y-1.5 shrink-0">
                  {job.sos && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> SOS
                      </Badge>
                  )}
                  {job.status !== 'open' && (
                      <Badge variant={job.status === 'completed' || job.status === 'canceled' ? 'outline' : 'secondary'} className="capitalize bg-white/20 text-white border-none">
                          {job.status}
                      </Badge>
                  )}
              </div>
          </div>
        </CardHeader>
      </div>
      <CardContent className="flex-grow pt-6">
        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.slice(0,3).map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
            {job.skills.length > 3 && <Badge variant="secondary">+{job.skills.length - 3} more</Badge>}
        </div>
      </CardContent>
      <Separator className="my-0" />
      <CardFooter className="flex justify-between items-center p-4 bg-muted/20">
        <div className='flex flex-col'>
            <div className="flex items-center font-bold text-lg">
                <IndianRupee className="mr-1 h-5 w-5"/>
                {job.payment}
            </div>
            <p className="text-xs text-muted-foreground">
              Posted {timeAgo || '...'}
            </p>
        </div>

        <div className="flex items-center gap-2">
            {canCancel && (
                <Button variant="destructive" size="sm" onClick={handleCancelJob} disabled={isCancelling}>
                    {isCancelling ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        </>
                    ) : (
                        <>
                            <Ban className="mr-2 h-4 w-4" />
                            Cancel
                        </>
                    )}
                </Button>
            )}
             <Button asChild size="sm">
                <Link href={jobUrl}>
                    View Job <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
