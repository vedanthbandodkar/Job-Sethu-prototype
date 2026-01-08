
"use client"

import { useEffect, useState, useRef, useTransition } from 'react';
import type { ChatMessage, User, Job } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Send, Loader2, Sparkles, Trash2, Bot, MapPin } from 'lucide-react';
import { sendMessageAction, suggestRepliesAction, deleteMessageAction } from '@/app/actions';
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

const LocationPicker = dynamic(() => import('./location-picker').then(mod => mod.LocationPicker), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
});

type EnrichedMessage = ChatMessage & { sender?: User };

type ChatInterfaceProps = {
    job: Job;
    currentUserId: string;
    messages: EnrichedMessage[];
};

function ClientTime({ timestamp }: { timestamp: Date }) {
    const [time, setTime] = useState('');
  
    useEffect(() => {
      setTime(new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}));
    }, [timestamp]);
  
    if (!time) {
        // You can return a placeholder or null
        return <span className="text-xs opacity-70">...</span>;
    }

    return <>{time}</>;
}


export function ChatInterface({ job, currentUserId, messages }: ChatInterfaceProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isSending, startSendingTransition] = useTransition();
    const [isDeleting, startDeletingTransition] = useTransition();
    const [isSuggesting, startSuggestingTransition] = useTransition();
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        const trimmedMessage = content.trim();
        if (!trimmedMessage) return;
        
        formRef.current?.reset();
        setNewMessage('');
        setSuggestions([]);
        
        startSendingTransition(async () => {
            await sendMessageAction(job.id, currentUserId, trimmedMessage);
        });
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(newMessage);
    }

    const handleGetSuggestions = () => {
        startSuggestingTransition(async () => {
            const chatHistory = messages.map(m => ({ senderId: m.senderId, content: m.content }));
            const result = await suggestRepliesAction({ 
                jobTitle: job.title, 
                jobDescription: job.description, 
                chatHistory, 
                currentUserId 
            });

            if (result.success && result.suggestions) {
                setSuggestions(result.suggestions);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Could not get suggestions',
                    description: result.message
                })
            }
        });
    }

    const handleDeleteMessage = (messageId: string) => {
        startDeletingTransition(async () => {
            await deleteMessageAction(messageId);
        });
    }

    const handleLocationSelect = (lat: number, lng: number) => {
        const locationMessage = `LOCATION::${lat},${lng}`;
        handleSendMessage(locationMessage);
        setShowLocationPicker(false);
    }

    const renderMessageContent = (msg: EnrichedMessage) => {
        const isSender = msg.senderId === currentUserId;
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
    
    const isPoster = job.posterId === currentUserId;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Chat</CardTitle>
                <CardDescription>Communicate with the other party about the job.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col h-[400px] border rounded-lg">
                    <div ref={scrollAreaRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-muted/20">
                        {messages.map(msg => (
                            <div key={msg.id} className={cn('flex items-end gap-2 group', msg.senderId === currentUserId ? 'justify-end' : 'justify-start')}>
                               {msg.senderId !== currentUserId && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={msg.sender?.avatarUrl} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{msg.sender?.name?.[0] ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    'max-w-xs md:max-w-md p-3 rounded-lg shadow-sm relative',
                                    msg.senderId === currentUserId ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none'
                                )}>
                                    {msg.senderId === currentUserId && (
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

                                    <p className={cn('text-xs mt-1 text-right', msg.senderId === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground/70' )}>
                                        <ClientTime timestamp={msg.timestamp} />
                                    </p>
                                </div>
                                {msg.senderId === currentUserId && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={msg.sender?.avatarUrl} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{msg.sender?.name?.[0] ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>

                    {suggestions.length > 0 && (
                        <div className="p-2 border-t bg-background space-y-2">
                             <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                                <Bot className="h-4 w-4" />
                                <span>AI Suggestions</span>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {suggestions.map((s, i) => (
                                    <Button key={i} size="sm" variant="outline" onClick={() => setNewMessage(s)}>
                                        {s}
                                    </Button>
                                ))}
                             </div>
                        </div>
                    )}

                    <form ref={formRef} onSubmit={handleFormSubmit} className="p-2 border-t flex items-center gap-2 bg-background">
                        <Button type="button" size="icon" variant="ghost" onClick={handleGetSuggestions} disabled={isSuggesting || isSending}>
                            {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            <span className="sr-only">Get Suggestions</span>
                        </Button>
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
