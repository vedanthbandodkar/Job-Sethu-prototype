
"use client";

import { notFound, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, IndianRupee, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { JobActions } from '@/components/job-actions';
import { ChatInterface } from '@/components/chat-interface';
import type { User, JobWithDate } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';
import { doc, collection } from 'firebase/firestore';
import { ApplicantList } from '@/components/applicant-list';
import { useMemo } from 'react';

export default function JobDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const jobRef = useMemo(() => (db && id ? doc(db, 'jobs', id) : null), [db, id]);
  const [jobSnapshot, jobLoading] = useDocument(jobRef);
  
  const job: JobWithDate | undefined = useMemo(() => {
    if (!jobSnapshot?.exists()) return undefined;
    const data = jobSnapshot.data();
    return {
      id: jobSnapshot.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    } as JobWithDate;
  }, [jobSnapshot]);

  const posterRef = useMemo(() => (db && job?.posterId ? doc(db, 'users', job.posterId) : null), [db, job?.posterId]);
  const [posterSnapshot, posterLoading] = useDocument(posterRef);
  const poster = useMemo(() => (posterSnapshot?.exists() ? { id: posterSnapshot.id, ...posterSnapshot.data() } as User : undefined), [posterSnapshot]);

  const workerRef = useMemo(() => (db && job?.workerId ? doc(db, 'users', job.workerId) : null), [db, job?.workerId]);
  const [workerSnapshot, workerLoading] = useDocument(workerRef);
  const worker = useMemo(() => (workerSnapshot?.exists() ? { id: workerSnapshot.id, ...workerSnapshot.data() } as User : undefined), [workerSnapshot]);

  const [applicantsSnapshots, applicantsLoading] = useCollection(db && job?.applicantIds?.length ? collection(db, 'users') : null);
  const applicants = useMemo(() => 
    applicantsSnapshots?.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as User)
      .filter(u => job?.applicantIds?.includes(u.id)) || []
  , [applicantsSnapshots, job?.applicantIds]);

  const loading = userLoading || jobLoading || posterLoading || workerLoading || applicantsLoading;

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (!job) {
    notFound();
  }

  const isPoster = job.posterId === user?.uid;
  const isWorker = job.workerId === user?.uid;
  const hasApplied = user?.uid && job.applicantIds ? job.applicantIds.includes(user.uid) : false;
  
  // Create serializable plain objects to pass as props
  const serializableJob = {
      ...job,
      createdAt: job.createdAt.toISOString(),
  };

  const serializablePoster = poster ? { ...poster } : undefined;
  const serializableWorker = worker ? { ...worker } : undefined;

  const canChat = (isPoster && serializableWorker) || isWorker;
  
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
                <ChatInterface job={serializableJob} poster={serializablePoster} worker={serializableWorker} />
            )}

        </div>
        <div className="lg:col-span-1 space-y-8">
            <div className="sticky top-24 space-y-8">
                <Card>
                    <CardHeader className="flex-row items-center space-x-4 pb-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={serializablePoster?.avatarUrl} data-ai-hint="person avatar" />
                            <AvatarFallback>{serializablePoster?.name?.[0] ?? 'P'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-muted-foreground">Job Poster</p>
                            <CardTitle className="font-headline text-lg">{serializablePoster?.name ?? "Unknown User"}</CardTitle>
                        </div>
                    </CardHeader>
                </Card>
                {serializableWorker && (
                     <Card>
                        <CardHeader className="flex-row items-center space-x-4 pb-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={serializableWorker?.avatarUrl} data-ai-hint="person avatar" />
                                <AvatarFallback>{serializableWorker.name?.[0] ?? 'W'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">Assigned To</p>
                                <CardTitle className="font-headline text-lg">{serializableWorker.name}</CardTitle>
                            </div>
                        </CardHeader>
                    </Card>
                )}
                <JobActions job={serializableJob} />
            </div>
        </div>
      </div>
    </div>
  );
}
