
import { JobCard } from '@/components/job-card';
import { getJobs } from '@/lib/data';
import type { Job } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined }}) {
  const query = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const userId = typeof searchParams?.userId === 'string' ? searchParams.userId : undefined;
  const jobs = await getJobs(query);
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-bold md:text-5xl">Find Your Next Opportunity</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Browse through hundreds of local jobs and find the perfect fit for your skills.
        </p>
        <form className="mt-8 mx-auto max-w-2xl flex items-center space-x-2">
            <Input 
              type="text" 
              name="q"
              placeholder="Search for jobs, skills, or keywords..." 
              className="flex-grow text-base" 
              defaultValue={query}
            />
            {userId && <input type="hidden" name="userId" value={userId} />}
            <Button type="submit" size="lg">
                <Search className="mr-2 h-5 w-5" /> Search
            </Button>
        </form>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-bold">{query ? `Search results for "${query}"` : 'Recent Jobs'}</h2>
        </div>
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job: Job) => (
              <JobCard key={job.id} job={job} userId={userId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
              <h2 className="font-headline text-2xl font-semibold">No jobs found.</h2>
              <p className="mt-2 text-muted-foreground">Try a different search term or check back later.</p>
          </div>
        )}
      </section>
    </div>
  );
}
