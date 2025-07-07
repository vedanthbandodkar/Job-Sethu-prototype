'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="mt-4 font-headline text-2xl">Oops, something went wrong!</CardTitle>
          <CardDescription>
            We encountered an unexpected issue while loading this page. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => reset()} size="lg">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
