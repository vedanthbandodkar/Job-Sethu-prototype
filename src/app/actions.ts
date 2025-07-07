'use server'

import { createJobInDb, applyToJobInDb, markJobCompleteInDb, selectApplicantForJobInDb } from '@/lib/data'
import { revalidatePath } from 'next/cache';

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
    revalidatePath('/');
}

export async function markJobCompleteAction(jobId: string) {
    await markJobCompleteInDb(jobId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
    revalidatePath('/');
}

export async function selectApplicantAction(jobId: string, applicantId: string) {
    await selectApplicantForJobInDb(jobId, applicantId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
    revalidatePath('/');
}
