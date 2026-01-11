
"use client";

import { JobCard } from '@/components/job-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JobWithDate } from '@/lib/types';
import { Briefcase, CheckCircle } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, or } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function DashboardPage() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const searchParams = useSearchParams();

  // A single query to get all jobs relevant to the user.
  const allUserJobsQuery = user 
    ? query(
        collection(db!, 'jobs'), 
        or(
          where('posterId', '==', user.uid),
          where('applicantIds', 'array-contains', user.uid),
          where('workerId', '==', user.uid)
        ),
        orderBy('createdAt', 'desc')
      ) 
    : null;
  
  const [allJobsSnapshot, allJobsLoading] = useCollection(allUserJobsQuery);

  const allJobs = useMemo(() => 
    allJobsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() })) as JobWithDate[] | undefined
  , [allJobsSnapshot]);

  const { myPostings, myApplications } = useMemo(() => {
    if (!allJobs || !user) {
      return { myPostings: [], myApplications: [] };
    }
    const postings = allJobs.filter(job => job.posterId === user.uid);
    const applications = allJobs.filter(job => job.posterId !== user.uid);
    return { myPostings: postings, myApplications: applications };
  }, [allJobs, user]);


  const defaultTab = searchParams.get('tab') === 'postings' ? 'postings' : 'applications';
  const loading = userLoading || allJobsLoading;

  return (
    <div className="container mx-auto py-12">
      <h1 className="font-headline text-4xl font-bold mb-8">My Dashboard</h1>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="applications"><CheckCircle className="mr-2 h-4 w-4" />My Applications</TabsTrigger>
          <TabsTrigger value="postings"><Briefcase className="mr-2 h-4 w-4" />My Postings</TabsTrigger>
        </TabsList>
        <TabsContent value="applications" className="mt-6">
            {loading ? (
                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[380px] w-full rounded-lg" />)}
                 </div>
            ) : myApplications && myApplications.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myApplications.map((job: JobWithDate) => (
                    <JobCard key={job.id} job={job} userId={user?.uid} />
                ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
                    <h2 className="font-headline text-2xl font-semibold">No applications yet.</h2>
                    <p className="mt-2 text-muted-foreground">Start applying to jobs to see them here.</p>
                </div>
            )}
        </TabsContent>
        <TabsContent value="postings" className="mt-6">
          {loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[380px] w-full rounded-lg" />)}
                </div>
            ) : myPostings && myPostings.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myPostings.map((job: JobWithDate) => (
                    <JobCard key={job.id} job={job} userId={user?.uid} />
                ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
                    <h2 className="font-headline text-2xl font-semibold">You haven't posted any jobs.</h2>
                    <p className="mt-2 text-muted-foreground">Post a job to find skilled workers.</p>
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
