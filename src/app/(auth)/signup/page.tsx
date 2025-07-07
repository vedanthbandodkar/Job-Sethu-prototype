"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signupAction } from '@/app/actions';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,36.14,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
      </svg>
    )
}

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignupFormValues = z.infer<typeof signupSchema>;


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const handleGoogleSignUp = () => {
    toast({
      title: 'Sign Up Successful!',
      description: 'Redirecting you to set up your profile.',
    });
    router.push('/onboarding');
  };

  const onSubmit = (data: SignupFormValues) => {
    startTransition(async () => {
      const result = await signupAction({ name: data.fullName, email: data.email });
      if (result.success) {
        toast({
          title: 'Account Created!',
          description: 'Redirecting you to set up your profile.',
        });
        router.push('/onboarding');
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: result.message || "There was a problem with your request.",
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Sign Up</CardTitle>
        <CardDescription>Create an account to start posting and applying for jobs.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                            <Input placeholder="Alice Johnson" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create account
                </Button>
            </form>
        </Form>

        <Separator className="my-2" />
        <Button variant="outline" className="w-full" onClick={handleGoogleSignUp}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign up with Google
        </Button>
      </CardContent>
      <div className="p-6 pt-0 text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="underline font-medium text-primary">
          Login
        </Link>
      </div>
    </Card>
  );
}
