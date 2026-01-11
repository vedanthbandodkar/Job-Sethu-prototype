
"use client"

import { useEffect, useState, useRef, useTransition, useMemo } from 'react';
import type { ChatMessageWithDate, User, JobWithDate } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Send, Loader2, Trash2, MapPin } from 'lucide-react';
import { sendMessageAction, deleteMessageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, doc, query, orderBy } from 'firebase/firestore';

const LocationPicker = dynamic(() => import('./location-picker').then(mod => mod.LocationPicker), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
});

type ChatInterfaceProps = {
    job: JobWithDate;
    poster?: User;
    worker?: User;
};


export function ChatInterface({ job, poster, worker }: ChatInterfaceProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isSending, startSendingTransition] = useTransition();
    const [isDeleting, startDeletingTransition] = useTransition();
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const { user, loading: userLoading } = useUser();
    const db = useFirestore();

    const messagesQuery = useMemo(() => (db ? query(collection(db, 'jobs', job.id, 'messages'), orderBy('timestamp', 'asc')) : null), [db, job.id]);
    const [messagesSnapshot, messagesLoading] = useCollection(messagesQuery);

    const messages = useMemo(() => messagesSnapshot?.docs.map(doc => {
      const data = doc.data();
      const senderId = data.senderId;
      let sender;
      if (senderId === poster?.id) sender = poster;
      if (senderId === worker?.id) sender = worker;

      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate(),
        sender,
      }
    }) as (ChatMessageWithDate & { sender?: User })[] | undefined, [messagesSnapshot, poster, worker]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        const trimmedMessage = content.trim();
        if (!trimmedMessage || !user) return;
        
        formRef.current?.reset();
        setNewMessage('');
        
        startSendingTransition(async () => {
            const result = await sendMessageAction(job.id, user.uid, trimmedMessage);
            if (!result.success) {
                toast({ variant: 'destructive', title: 'Error sending message', description: result.message });
            }
        });
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(newMessage);
    }

    const handleDeleteMessage = (messageId: string) => {
        if (!user) return;
        startDeletingTransition(async () => {
            await deleteMessageAction(job.id, messageId, user.uid);
        });
    }

    const handleLocationSelect = (lat: number, lng: number) => {
        const locationMessage = `LOCATION::${lat},${lng}`;
        handleSendMessage(locationMessage);
        setShowLocationPicker(false);
    }

    const renderMessageContent = (msg: ChatMessageWithDate & { sender?: User }) => {
        const isSender = msg.senderId === user?.uid;
        if (msg.content.startsWith('LOCATION::')) {
            const [lat, lng] = msg.content.replace('LOCATION::', '').split(',');
            const url = `https://www.google.com/maps?q=${lat},${lng}`;
            return (
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={cn(
                        "flex items-center gap-2 underline",
                        isSender ? "text-primary-foreground/90 hover:text-primary-foreground" : "text-primary"
                    )}
                >
                    <MapPin className="h-4 w-4" />
                    <span>View Location</span>
                </a>
            )
        }
        return <p className="text-sm">{msg.content}</p>;
    }
    
    const isPoster = job.posterId === user?.uid;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Chat</CardTitle>
                <CardDescription>Communicate with the other party about the job.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col h-[400px] border rounded-lg">
                    <div ref={scrollAreaRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-muted/20">
                        {messagesLoading && <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}
                        {messages && messages.map(msg => (
                            <div key={msg.id} className={cn('flex items-end gap-2 group', msg.senderId === user?.uid ? 'justify-end' : 'justify-start')}>
                               {msg.senderId !== user?.uid && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={msg.sender?.avatarUrl} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{msg.sender?.name?.[0] ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    'max-w-xs md:max-w-md p-3 rounded-lg shadow-sm relative',
                                    msg.senderId === user?.uid ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none'
                                )}>
                                    {msg.senderId === user?.uid && (
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="absolute -left-10 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" disabled={isDeleting}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete your message.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteMessage(msg.id)} disabled={isDeleting}>
                                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                   
                                    {renderMessageContent(msg)}

                                </div>
                                {msg.senderId === user?.uid && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.photoURL || undefined} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{user.displayName?.[0] ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>

                    <form ref={formRef} onSubmit={handleFormSubmit} className="p-2 border-t flex items-center gap-2 bg-background">
                         {isPoster && (
                            <Button type="button" size="icon" variant="ghost" onClick={() => setShowLocationPicker(true)}>
                                <MapPin className="h-4 w-4" />
                                <span className="sr-only">Share Location</span>
                            </Button>
                        )}
                        <Input 
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type your message..." 
                            autoComplete="off"
                            disabled={isSending}
                        />
                        <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
                 {showLocationPicker && (
                    <LocationPicker
                        onClose={() => setShowLocationPicker(false)}
                        onLocationSelect={handleLocationSelect}
                    />
                )}
            </CardContent>
        </Card>
    );
}
