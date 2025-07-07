
import { JobCard } from '@/components/job-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getJobs } from '@/lib/data';
import type { Job } from '@/lib/types';
import { Briefcase, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const allJobs = await getJobs();
  // Mock current user ID
  const currentUserId = 'user-1';

  const myPostings = allJobs.filter(job => job.posterId === currentUserId);
  const myApplications = allJobs.filter(job => job.applicants.includes(currentUserId) || job.workerId === currentUserId);
  const defaultTab = searchParams?.tab === 'postings' ? 'postings' : 'applications';

  return (
    <div className="container mx-auto py-12">
      <h1 className="font-headline text-4xl font-bold mb-8">My Dashboard</h1>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="applications"><CheckCircle className="mr-2 h-4 w-4" />My Applications</TabsTrigger>
          <TabsTrigger value="postings"><Briefcase className="mr-2 h-4 w-4" />My Postings</TabsTrigger>
        </TabsList>
        <TabsContent value="applications" className="mt-6">
          {myApplications.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myApplications.map((job: Job) => (
                <JobCard key={job.id} job={job} />
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
          {myPostings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myPostings.map((job: Job) => (
                <JobCard key={job.id} job={job} />
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
