"use client";

import { JobCard } from '@/components/job-card';
import type { JobWithDate } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

<<<<<<< HEAD
  const jobsRef = db ? collection(db, 'jobs') : null;
  let q = jobsRef ? query(jobsRef, where("status", "==", "open"), orderBy("createdAt", "desc")) : null;

  const [jobsSnapshot, loading, error] = useCollection(q);
=======
  // Base query
  const jobsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'jobs'), where("status", "==", "open"), orderBy("createdAt", "desc"));
  }, [db]);
  
  // Note: Firestore does not support full-text search natively. 
  // This query only gets open jobs. A real search implementation would use a third-party service like Algolia.
  const [jobsSnapshot, loading, error] = useCollection(jobsQuery);
>>>>>>> a178267 (Try fixing this error: `Console Error: Maximum update depth exceeded. Th)

  const jobs = useMemo(() => jobsSnapshot?.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
  })) as JobWithDate[] | undefined, [jobsSnapshot]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    if (!searchQuery) return jobs;

    const lowercasedQuery = searchQuery.toLowerCase();
    return jobs.filter(job => 
        job.title.toLowerCase().includes(lowercasedQuery) ||
        job.description.toLowerCase().includes(lowercasedQuery) ||
        job.skills.some(skill => skill.toLowerCase().includes(lowercasedQuery))
    );
  }, [jobs, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const q = formData.get('q') as string;
    setSearchQuery(q);
<<<<<<< HEAD
    alert("Full-text search is not implemented in this prototype. Showing all open jobs.");
=======
>>>>>>> 709c275 (make the search functionality work)
  }
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-bold md:text-5xl">Find Your Next Opportunity</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Browse through hundreds of local jobs and find the perfect fit for your skills.
        </p>
        <form onSubmit={handleSearch} className="mt-8 mx-auto max-w-2xl flex items-center space-x-2">
            <Input 
              type="text" 
              name="q"
              placeholder="Search by title, skill, or keyword..." 
              className="flex-grow text-base" 
              defaultValue={searchQuery}
            />
            <Button type="submit" size="lg">
                <Search className="mr-2 h-5 w-5" /> Search
            </Button>
        </form>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-bold">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Recent Jobs'}
            </h2>
        </div>

        {loading && (
             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[380px] w-full rounded-lg" />)}
             </div>
        )}
<<<<<<< HEAD

        {!loading && jobs && jobs.length > 0 ? (
=======
        {!loading && filteredJobs && filteredJobs.length > 0 ? (
>>>>>>> 709c275 (make the search functionality work)
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job: JobWithDate) => (
              <JobCard key={job.id} job={job} userId={user?.uid} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
              <h2 className="font-headline text-2xl font-semibold">No jobs found.</h2>
<<<<<<< HEAD
              <p className="mt-2 text-muted-foreground">Check back later for new opportunities.</p>
            </div>
          )
=======
              <p className="mt-2 text-muted-foreground">{searchQuery ? 'Try a different search term.' : 'Check back later for new opportunities.'}</p>
          </div>
>>>>>>> 709c275 (make the search functionality work)
        )}

        {error && <p className="text-destructive text-center">Error loading jobs: {error.message}</p>}
      </section>
    </div>
  );
}