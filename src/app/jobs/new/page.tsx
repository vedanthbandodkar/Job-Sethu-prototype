import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JobForm } from '@/components/job-form';

export default function NewJobPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create a New Job</CardTitle>
          <CardDescription>Fill out the details below to post a job listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm />
        </CardContent>
      </Card>
    </div>
  );
}
