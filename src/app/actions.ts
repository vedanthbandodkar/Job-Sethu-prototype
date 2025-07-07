'use server'

import { revalidatePath } from 'next/cache'
import { createJobInDb, applyToJobInDb, markJobCompleteInDb } from '@/lib/data'

type JobFormValues = {
  title: string;
  description: string;
  skills: string;
  payment: number;
  location: string;
  sos: boolean;
}

export async function createJobAction(data: JobFormValues) {
  try {
    await createJobInDb(data);
    
    // Revalidate the pages where the new job should appear
    revalidatePath('/');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to create job:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function applyForJobAction(jobId: string, userId: string) {
    await applyToJobInDb(jobId, userId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
}

export async function markJobCompleteAction(jobId: string) {
    await markJobCompleteInDb(jobId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
}
