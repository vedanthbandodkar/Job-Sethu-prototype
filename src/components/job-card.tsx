"use client";

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Job } from '@/lib/types';
import { MapPin, IndianRupee, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

type JobCardProps = {
  job: Job;
  userId?: string | null;
};

export function JobCard({ job, userId }: JobCardProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }));
  }, [job.createdAt]);

  const jobUrl = userId ? `/jobs/${job.id}?userId=${userId}` : `/jobs/${job.id}`;

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-lg bg-card">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
                <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                <CardDescription className="flex items-center text-sm text-muted-foreground pt-1">
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
                    <Badge variant={job.status === 'completed' ? 'outline' : 'secondary'} className="capitalize">
                        {job.status}
                    </Badge>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
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

        <Button asChild>
          <Link href={jobUrl}>
            View Job <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
