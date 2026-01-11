
"use client";

import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, IndianRupee, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { JobActions } from '@/components/job-actions';
import { ChatInterface } from '@/components/chat-interface';
import { ApplicantList } from '@/components/applicant-list';
import type { User, JobWithDate } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';
import { doc, collection } from 'firebase/firestore';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const jobRef = db ? doc(db, 'jobs', params.id) : null;
  const [jobSnapshot, jobLoading] = useDocument(jobRef);
  const job = jobSnapshot?.exists() ? { id: jobSnapshot.id, ...jobSnapshot.data(), createdAt: jobSnapshot.data().createdAt.toDate() } as JobWithDate : undefined;

  const posterId = job?.posterId;
  const workerId = job?.workerId;
  const applicantIds = job?.applicantIds;
  
  const posterRef = db && posterId ? doc(db, 'users', posterId) : null;
  const [posterSnapshot, posterLoading] = useDocument(posterRef);
  const poster = posterSnapshot?.exists() ? { id: posterSnapshot.id, ...posterSnapshot.data() } as User : undefined;

  const workerRef = db && workerId ? doc(db, 'users', workerId) : null;
  const [workerSnapshot, workerLoading] = useDocument(workerRef);
  const worker = workerSnapshot?.exists() ? { id: workerSnapshot.id, ...workerSnapshot.data() } as User : undefined;

  const applicantsCollectionRef = db && applicantIds?.length ? collection(db, 'users') : null;
  // This is not efficient for many applicants. Firestore doesn't support `where in` with more than 30 items in a query.
  // A real app would structure data differently for this. For now, we fetch one by one.
  // This is just a placeholder for the logic. We will fetch applicants via separate hooks.
  const [applicantsSnapshots, applicantsLoading] = useCollection(applicantsCollectionRef);
  const applicants = applicantsSnapshots?.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as User)
      .filter(u => applicantIds?.includes(u.id)) || [];

  const loading = userLoading || jobLoading || posterLoading || workerLoading || applicantsLoading;

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (!job) {
    notFound();
  }

  const isPoster = job.posterId === user?.uid;
  const isWorker = job.workerId === user?.uid;
  const hasApplied = user?.uid ? job.applicantIds.includes(user.uid) : false;
  const canChat = (isPoster && worker) || isWorker;

  return (
    <div className="container mx-auto max-w-6xl py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
                {job.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={job.imageUrl}
                      alt={job.title}
                      fill
                      className="object-cover"
                      data-ai-hint={job.title.split(' ').slice(0,2).join(' ').toLowerCase()}
                    />
                    <div className="absolute inset-0 bg-black/50" />
                  </div>
                )}
                <CardHeader className={job.imageUrl ? "relative" : ""}>
                    <div className="flex justify-between items-start">
                        <div>
                            {job.sos && (
                                <Badge variant="destructive" className="mb-2 flex w-fit items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> SOS / URGENT
                                </Badge>
                            )}
                            <CardTitle className="font-headline text-3xl md:text-4xl">{job.title}</CardTitle>
                            <CardDescription className="mt-2 text-base flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                                <span className="flex items-center"><MapPin className="mr-1.5 h-4 w-4" /> {job.location}</span>
                                <span className="flex items-center"><Calendar className="mr-1.5 h-4 w-4" /> Posted on {format(new Date(job.createdAt), "PPP")}</span>
                            </CardDescription>
                        </div>
                        <Badge variant={job.status === 'open' ? 'default' : job.status === 'assigned' ? 'secondary' : 'outline' } className="capitalize text-sm">{job.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <Separator className="my-4" />
                    <h3 className="font-headline text-xl font-semibold mb-2">Job Description</h3>
                    <p className="text-foreground/80 whitespace-pre-wrap">{job.description}</p>
                    <div className="mt-6">
                        <h3 className="font-headline text-xl font-semibold mb-3">Skills Required</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map(skill => <Badge key={skill} variant="secondary" className="text-sm">{skill}</Badge>)}
                        </div>
                    </div>
                    <Separator className="my-6"/>
                    <div className="flex items-center space-x-2">
                        <IndianRupee className="h-8 w-8 text-primary" />
                        <span className="text-3xl font-bold">{job.payment}</span>
                        <span className="text-muted-foreground">Payment</span>
                    </div>
                </CardContent>
            </Card>

            {isPoster && job.status === 'open' && (
                <ApplicantList applicants={applicants} jobId={job.id} />
            )}

            {canChat && (
                <ChatInterface job={job} poster={poster} worker={worker} />
            )}

        </div>
        <div className="lg:col-span-1 space-y-8">
            <div className="sticky top-24 space-y-8">
                <Card>
                    <CardHeader className="flex-row items-center space-x-4 pb-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={poster?.avatarUrl} data-ai-hint="person avatar" />
                            <AvatarFallback>{poster?.name?.[0] ?? 'P'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-muted-foreground">Job Poster</p>
                            <CardTitle className="font-headline text-lg">{poster?.name ?? "Unknown User"}</CardTitle>
                        </div>
                    </CardHeader>
                </Card>
                {worker && (
                     <Card>
                        <CardHeader className="flex-row items-center space-x-4 pb-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={worker?.avatarUrl} data-ai-hint="person avatar" />
                                <AvatarFallback>{worker.name?.[0] ?? 'W'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">Assigned To</p>
                                <CardTitle className="font-headline text-lg">{worker.name}</CardTitle>
                            </div>
                        </CardHeader>
                    </Card>
                )}
                <JobActions job={job} />
            </div>
        </div>
      </div>
    </div>
  );
}
