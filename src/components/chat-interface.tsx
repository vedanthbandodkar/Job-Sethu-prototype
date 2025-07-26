
"use client"

import { useEffect, useState, useRef, useTransition } from 'react';
import type { ChatMessage, User, Job } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Send, Loader2, Sparkles, Trash2, Bot, Phone } from 'lucide-react';
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
import { getUserById } from '@/lib/data';

type EnrichedMessage = ChatMessage & { sender?: User };

type ChatInterfaceProps = {
    job: Job;
    currentUserId: string;
    messages: EnrichedMessage[];
};

// A small component to safely render timestamps on the client
function ClientTimestamp({ timestamp }: { timestamp: Date }) {
    const [formattedTime, setFormattedTime] = useState('');
    useEffect(() => {
        setFormattedTime(new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, [timestamp]);

    return <>{formattedTime}</>;
}


export function ChatInterface({ job, currentUserId, messages }: ChatInterfaceProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isSending, startSendingTransition] = useTransition();
    const [isDeleting, startDeletingTransition] = useTransition();
    const [isSuggesting, startSuggestingTransition] = useTransition();

    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
      let isMounted = true;
      const fetchOtherUser = async () => {
        const otherUserId = job.posterId === currentUserId ? job.workerId : job.posterId;
        if (otherUserId) {
            const user = await getUserById(otherUserId);
            if(isMounted && user) {
                setOtherUser(user);
            }
        }
      };

      fetchOtherUser();
      return () => { isMounted = false };
    }, [job.posterId, job.workerId, currentUserId]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedMessage = newMessage.trim();
        if (!trimmedMessage) return;
        
        formRef.current?.reset();
        setNewMessage('');
        setSuggestions([]);
        
        startSendingTransition(async () => {
            await sendMessageAction(job.id, currentUserId, trimmedMessage);
        });
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

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Chat</CardTitle>
                    <CardDescription>Communicate with the other party about the job.</CardDescription>
                </div>
                {otherUser && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Phone className="h-4 w-4" />
                                <span className="sr-only">Call {otherUser.name}</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Call {otherUser.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                You can call {otherUser.name} at the following phone number to discuss the job details.
                                <div className="font-bold text-lg text-foreground my-4 text-center bg-muted p-3 rounded-md">
                                    {otherUser.phoneNumber}
                                </div>
                                Standard call charges may apply.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <a href={`tel:${otherUser.phoneNumber}`}>Call Now</a>
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
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

                                {msg.senderId === currentUserId && (
                                    <div className="flex items-center self-center">
                                        <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" disabled={isDeleting}>
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
                                    </div>
                                )}

                                <div className={cn(
                                    'max-w-xs md:max-w-md p-3 rounded-lg shadow-sm',
                                    msg.senderId === currentUserId ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none'
                                )}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={cn('text-xs mt-1 text-right', msg.senderId === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground/70' )}>
                                        <ClientTimestamp timestamp={msg.timestamp} />
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

                    <form ref={formRef} onSubmit={handleSendMessage} className="p-2 border-t flex items-center gap-2 bg-background">
                        <Button type="button" size="icon" variant="ghost" onClick={handleGetSuggestions} disabled={isSuggesting || isSending}>
                            {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            <span className="sr-only">Get Suggestions</span>
                        </Button>
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
            </CardContent>
        </Card>
    );
}
