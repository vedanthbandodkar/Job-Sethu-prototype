
"use client"

import { useEffect, useState, useRef, useTransition } from 'react';
import type { ChatMessage, User } from '@/lib/types';
import { getMessagesForJob, getUserById } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';
import { sendMessageAction } from '@/app/actions';

type EnrichedMessage = ChatMessage & { sender?: User };

export function ChatInterface({ jobId, currentUserId }: { jobId: string, currentUserId: string }) {
    const [messages, setMessages] = useState<EnrichedMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isPending, startTransition] = useTransition();

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    useEffect(() => {
        const fetchInitialData = async () => {
            const rawMessages = await getMessagesForJob(jobId);
            const user = await getUserById(currentUserId);

            const enriched = await Promise.all(
                rawMessages.map(async (msg) => ({
                    ...msg,
                    sender: msg.senderId === currentUserId ? user : await getUserById(msg.senderId),
                }))
            );
            setMessages(enriched);
            setCurrentUser(user);
        };

        fetchInitialData();
    }, [jobId, currentUserId]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedMessage = newMessage.trim();
        if (!trimmedMessage || !currentUser) return;
        
        formRef.current?.reset();
        setNewMessage('');
        
        startTransition(async () => {
            await sendMessageAction(jobId, currentUserId, trimmedMessage);
            // The revalidatePath in the action will trigger a re-render of the page
            // which will re-fetch the messages in the parent component. For this component,
            // we'll just add it to our local state to see it immediately.
            const newMsg: EnrichedMessage = {
              id: `temp-${Date.now()}`,
              jobId,
              senderId: currentUserId,
              content: trimmedMessage,
              timestamp: new Date(),
              sender: currentUser
            };
            setMessages(prev => [...prev, newMsg]);
        });
    }

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
                            <div key={msg.id} className={cn('flex items-end gap-2', msg.senderId === currentUserId ? 'justify-end' : 'justify-start')}>
                                {msg.senderId !== currentUserId && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={msg.sender?.avatarUrl} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{msg.sender?.name?.[0] ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    'max-w-xs md:max-w-md p-3 rounded-lg shadow-sm',
                                    msg.senderId === currentUserId ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none'
                                )}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={cn('text-xs mt-1 text-right', msg.senderId === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground/70' )}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
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
                    <form ref={formRef} onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2 bg-background">
                        <Input 
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type your message..." 
                            autoComplete="off"
                            disabled={isPending}
                        />
                        <Button type="submit" size="icon" disabled={isPending || !newMessage.trim()}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
