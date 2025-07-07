import { getJobById, getUserById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, IndianRupee, AlertTriangle, User, Calendar, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { JobActions } from '@/components/job-actions';
import { ChatInterface } from '@/components/chat-interface';
import { ApplicantList } from '@/components/applicant-list';
import type { User as UserType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id);
  if (!job) {
    notFound();
  }

  const poster = await getUserById(job.posterId);
  const worker = job.workerId ? await getUserById(job.workerId) : null;
  
  const applicants = await Promise.all(
    job.applicants.map(id => getUserById(id))
  ).then(users => users.filter((u): u is UserType => u !== undefined));


  // Mock current user
  const currentUserId = 'user-2'; // Change this to test different views ('user-1', 'user-2', 'user-3', etc.)
  const isPoster = job.posterId === currentUserId;
  const isWorker = job.workerId === currentUserId;
  const hasApplied = job.applicants.includes(currentUserId);
  const canChat = (isPoster && worker) || isWorker;

  return (
    <div className="container mx-auto max-w-6xl py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
                <CardHeader>
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
                <ChatInterface jobId={job.id} currentUserId={currentUserId} />
            )}

        </div>
        <div className="lg:col-span-1 space-y-8">
            <div className="sticky top-24 space-y-8">
                <Card>
                    <CardHeader className="flex-row items-center space-x-4 pb-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={poster?.avatarUrl} data-ai-hint="person avatar" />
                            <AvatarFallback>{poster?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-muted-foreground">Job Poster</p>
                            <CardTitle className="font-headline text-lg">{poster?.name}</CardTitle>
                        </div>
                    </CardHeader>
                </Card>
                {worker && (
                     <Card>
                        <CardHeader className="flex-row items-center space-x-4 pb-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={worker?.avatarUrl} data-ai-hint="person avatar" />
                                <AvatarFallback>{worker?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">Assigned To</p>
                                <CardTitle className="font-headline text-lg">{worker.name}</CardTitle>
                            </div>
                        </CardHeader>
                    </Card>
                )}
                <JobActions job={job} isPoster={isPoster} isWorker={isWorker} hasApplied={hasApplied} currentUserId={currentUserId} />
            </div>
        </div>
      </div>
    </div>
  );
}
