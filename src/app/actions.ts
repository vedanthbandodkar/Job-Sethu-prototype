'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createJobInDb } from '@/lib/data'

type JobFormValues = {
  title: string;
  description: string;
  skills: string;
  payment: number;
  location: string;
  sos: boolean;
}

export async function createJobAction(data: JobFormValues) {
  // Server-side validation can be added here if needed, but the client-side validation is sufficient for this demo app.
  const newJob = await createJobInDb(data);
  
  // Revalidate the pages where the new job should appear
  revalidatePath('/');
  revalidatePath('/dashboard');

  // Redirect to the home page
  redirect(`/`);
}
