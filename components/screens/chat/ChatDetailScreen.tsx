
import * as React from 'react';
import { Conversation, Message, Profile, MembershipType } from '../../../types.ts';
import { useUser } from '../../../hooks/useUser.ts';
import { useNotification } from '../../../hooks/useNotification.ts';
import { usePresence } from '../../../hooks/usePresence.ts';
import { sendMessage, getConversationDetails, getMessages, getProfile, markMessagesAsRead } from '../../../services/api.ts';
import { rateConversation } from '../../../services/gemini.ts';
import { supabase } from '../../../services/supabase.ts';
import LoadingSpinner from '../../LoadingSpinner.tsx';
import { PREMIUM_GRADIENT } from '../../../constants.tsx';
import { ArrowLeft, Send, Sparkles, X, Check, CheckCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMessageTime, formatDateSeparator, getOptimizedUrl } from '../../../utils/date.ts';
import { IcebreakerGenerator } from '../../chat/IcebreakerGenerator.tsx';

// Fix for framer-motion type errors
const MotionDiv: any = motion.div;
const MotionButton: any = motion.button;

interface ChatDetailScreenProps {
  conversation: Conversation;
  onBack: () => void;
  onProfileClick: (profile: Profile) => void;
}

type UIMessage = Message & { status?: 'sending' };

interface MessageBubbleProps {
    message: UIMessage;
    isCurrentUser: boolean;
}

const RizzDisplay: React.FC<{ result: { score: number, feedback: string }, onClose: () => void }> = ({ result, onClose }) => {
    const scoreColor = result.score > 75 ? 'text-green-400' : result.score > 40 ? 'text-yellow-400' : 'text-red-400';
    const glowColor = result.score > 75 ? 'bg-green-500/30' : result.score > 40 ? 'bg-yellow-500/30' : 'bg-red-500/30';

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-28 inset-x-4 md:inset-x-auto md:bottom-24 md:right-4 z-20 w-full max-w-xs mx-auto md:w-72 md:mx-0"
        >
            <div className={`absolute inset-0 -z-10 blur-2xl rounded-full ${glowColor}`}></div>
            <div className="bg-zinc-900/80 backdrop-blur-lg border border-purple-500/50 rounded-2xl shadow-lg p-4">
                 <button onClick={onClose} className="absolute top-2 right-2 text-zinc-500 hover:text-white"><X size={16}/></button>
                <div className="text-center">
                    <p className="text-sm text-zinc-400">Rizz Meter</p>
                    <p className={`text-6xl font-bold ${scoreColor}`}>{result.score}</p>
                </div>
                <p className="text-sm text-zinc-300 mt-2 text-center">{result.feedback}</p>
            </div>
        </MotionDiv>
    )
};


const DateSeparator: React.FC<{ date: string }> = ({ date }) => (
    <div className="flex justify-center my-4">
        <span className="bg-zinc-800/80 backdrop-blur-sm text-zinc-400 text-xs font-semibold px-3 py-1 rounded-full">
            {formatDateSeparator(date)}
        </span>
    </div>
);

const ReadStatusIcon: React.FC<{ isRead: boolean }> = React.memo(({ isRead }) => {
    if (isRead) {
        return <CheckCheck size={16} className="text-blue-400" />;
    }
    return <Check size={16} className="text-white/70" />;
});


const MessageBubble = React.memo(function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
    const alignment = isCurrentUser ? 'justify-end' : 'justify-start';
    const bubbleStyles = isCurrentUser 
        ? `bg-gradient-to-r ${PREMIUM_GRADIENT} text-white` 
        : 'bg-gradient-to-br from-zinc-800 to-zinc-700 text-zinc-200';
    
    const bubbleShape = isCurrentUser
        ? 'rounded-t-2xl rounded-bl-2xl'
        : 'rounded-t-2xl rounded-br-2xl';

    return (
        <MotionDiv 
            layout
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`flex items-end gap-2 ${alignment} w-full`}
        >
            <div className={`relative max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 shadow-md ${bubbleStyles} ${bubbleShape}`}>
                <p className="break-words whitespace-pre-wrap">{message.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                     <p className={`text-xs ${isCurrentUser ? 'text-white/70' : 'text-zinc-500'}`}>{formatMessageTime(message.created_at)}</p>
                     {isCurrentUser && (message.status === 'sending' ? <Clock size={16} className="text-white/70" /> : <ReadStatusIcon isRead={message.is_read} />)}
                </div>
            </div>
        </MotionDiv>
    );
});

function ChatDetailScreen({ conversation, onBack, onProfileClick }: ChatDetailScreenProps) {
  const { user } = useUser();
  const { showNotification } = useNotification();
  const { onlineUsers } = usePresence();
  const [messages, setMessages] = React.useState<UIMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [newMessage, setNewMessage] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [isRizzing, setIsRizzing] = React.useState(false);
  const [rizzResult, setRizzResult] = React.useState<{ score: number, feedback: string } | null>(null);
  const [showRizzButton, setShowRizzButton] = React.useState(false);
  const messagesEndRef = React.useRef<null | HTMLDivElement>(null);
  const textareaRef = React.useRef<null | HTMLTextAreaElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = React.useRef<number | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = React.useState(false);
  const typingTimeoutRef = React.useRef<any>(null);
  // FIX: Infer RealtimeChannel type from the supabase client to avoid import issues.
  const channelRef = React.useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastBroadcastTime = React.useRef(0);
  
  const hasCheckedRizz = React.useRef(false);

  const isOtherUserOnline = onlineUsers.has(conversation.otherUser.id);
  const isPremium = conversation.otherUser.membership === MembershipType.Premium;

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto'; // Reset height
        textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
    }
  }, [newMessage]);
  
  const loadInitialMessages = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
        const fullConvo = await getConversationDetails(conversation.id, user.id);
        if (fullConvo) {
            setMessages(fullConvo.messages);
            setShowRizzButton(fullConvo.messages.length >= 4 && fullConvo.messages.length <= 10 && !hasCheckedRizz.current);
            setHasMore(fullConvo.messages.length > 0);
            setCurrentPage(1);
            // Mark messages as read after loading them
            await markMessagesAsRead(conversation.id, user.id);
        } else {
             setHasMore(false);
        }
    } catch (error) {
        showNotification("Failed to load conversation", "error");
    } finally {
        setLoading(false);
    }
  }, [conversation.id, user, showNotification]);

  React.useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);
  
  // Typing indicator subscription
  React.useEffect(() => {
    if (!user) return;
    
    const typingChannel = supabase.channel(`typing:${conversation.id}`, {
        config: { broadcast: { self: false } }
    });
    
    typingChannel.on('broadcast', { event: 'typing' }, () => {
        setIsOtherUserTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsOtherUserTyping(false), 3000);
    }).subscribe();
    
    channelRef.current = typingChannel;

    return () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [conversation.id, user]);

  React.useEffect(() => {
      if (!loading) {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }
  }, [messages, loading]);
  
  const handleLoadMore = React.useCallback(async () => {
    if (!hasMore || loadingMore) return;

    if (scrollContainerRef.current) {
        prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
    }

    setLoadingMore(true);
    try {
        const olderMessages = await getMessages(conversation.id, currentPage);
        if (olderMessages.length > 0) {
            setMessages(prev => [...olderMessages, ...prev]);
            setCurrentPage(prev => prev + 1);
        } else {
            setHasMore(false);
            setLoadingMore(false);
        }
    } catch (error) {
        showNotification("Failed to load older messages", "error");
        setLoadingMore(false);
    }
  }, [hasMore, loadingMore, conversation.id, currentPage, showNotification]);
  
  // Effect for infinite scroll trigger
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop < 1 && hasMore && !loadingMore) {
        handleLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
        if (container) {
             container.removeEventListener('scroll', handleScroll);
        }
    };
  }, [hasMore, loadingMore, handleLoadMore]);
  
  // Effect to maintain scroll position after loading more messages
  React.useLayoutEffect(() => {
    if (loadingMore && prevScrollHeightRef.current !== null && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollHeightAfter = container.scrollHeight;
        
        container.scrollTop = scrollHeightAfter - prevScrollHeightRef.current;
        
        prevScrollHeightRef.current = null; // Reset for next load
        setLoadingMore(false);
    }
  }, [messages, loadingMore]);

  React.useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`chat:${conversation.id}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `conversation_id=eq.${conversation.id}`
        }, (payload: any) => {
            const newMessageFromDb = payload.new;
            if (newMessageFromDb && 'sender_id' in newMessageFromDb && (newMessageFromDb as any).sender_id !== user.id) {
                const receivedMessage: Message = {
                    id: (newMessageFromDb as any).id,
                    text: (newMessageFromDb as any).text,
                    senderId: (newMessageFromDb as any).sender_id,
                    created_at: (newMessageFromDb as any).created_at,
                    conversation_id: (newMessageFromDb as any).conversation_id,
                    is_read: (newMessageFromDb as any).is_read,
                };
                
                setMessages(prev => {
                    if (prev.some(m => m.id === receivedMessage.id)) return prev;
                    return [...prev, receivedMessage];
                });
                // Mark incoming message as read since user is on the screen
                markMessagesAsRead(conversation.id, user.id);
            }
        })
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversation.id}`
        }, (payload: any) => {
             const updatedMessage = payload.new as Message;
             if (updatedMessage) {
                 setMessages(prev =>
                     prev.map(msg =>
                         msg.id === updatedMessage.id
                             ? { ...msg, is_read: updatedMessage.is_read }
                             : msg
                     )
                 );
             }
        })
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    }
  }, [conversation.id, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    const textToSend = newMessage;
    setNewMessage('');
    setIsSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: UIMessage = {
        id: tempId,
        text: textToSend,
        senderId: user.id,
        created_at: new Date().toISOString(),
        conversation_id: conversation.id,
        is_read: false,
        status: 'sending',
    };
    
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
        const sentMessage = await sendMessage(conversation.id, textToSend, user.id);
        // Replace optimistic message with the real one from the server
        setMessages(prevMessages => 
            prevMessages.map(msg => msg.id === tempId ? sentMessage : msg)
        );
    } catch(err) {
        // Revert optimistic update on failure
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId));
        setNewMessage(textToSend); // Restore text to input
        showNotification("Failed to send message", "error");
    } finally {
        setIsSending(false);
    }
  };
  
  const handleTyping = () => {
    const now = Date.now();
    if (now - lastBroadcastTime.current > 1500) { // 1.5 second throttle
        lastBroadcastTime.current = now;
        if (channelRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'typing'
            });
        }
    }
  };

  const handleSelectIcebreaker = (icebreaker: string) => {
    setNewMessage(icebreaker);
    textareaRef.current?.focus();
  };

  const handleHeaderClick = async () => {
    try {
      const fullProfile = await getProfile(conversation.otherUser.id);
      if (fullProfile) {
          onProfileClick(fullProfile);
      } else {
          showNotification("Could not load profile.", "error");
      }
    } catch (error) {
        showNotification("Could not load profile.", "error");
    }
  };
  
  const handleRizzCheck = async () => {
    if (!user) return;
    setIsRizzing(true);
    setShowRizzButton(false);
    hasCheckedRizz.current = true;
    try {
        const result = await rateConversation(messages.map(({ status, ...rest }) => rest), user.id);
        setRizzResult(result);
    } catch (error: any) {
        showNotification(error.message, "error");
    } finally {
        setIsRizzing(false);
    }
  };

   const renderMessagesWithSeparators = () => {
        const messageElements: React.ReactNode[] = [];
        let lastDate: string | null = null;

        messages.forEach((msg, index) => {
            const currentDate = new Date(msg.created_at).toDateString();
            if (currentDate !== lastDate) {
                messageElements.push(<DateSeparator key={`sep-${currentDate}`} date={msg.created_at} />);
                lastDate = currentDate;
            }
            messageElements.push(
                <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.senderId === user?.id} />
            );
        });
        return messageElements;
    };


  if (!user || loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center p-4 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-lg sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-zinc-800 mr-2">
            <ArrowLeft />
        </button>
        <button onClick={handleHeaderClick} className="flex items-center text-left hover:bg-zinc-800 p-1 rounded-lg transition-colors">
            <div className={`relative w-10 h-10 rounded-full p-0.5 flex-shrink-0 ${isPremium ? `bg-gradient-to-br ${PREMIUM_GRADIENT}` : ''}`}>
                <img src={getOptimizedUrl(conversation.otherUser.profilePics[0], { width: 40, height: 40 })} alt={conversation.otherUser.name} loading="lazy" className="w-full h-full rounded-full object-cover border-2 border-zinc-900"/>
            </div>
            <div className="ml-3">
                <h2 className="font-bold text-lg">{conversation.otherUser.name}</h2>
                <div className="relative h-4"> {/* Reserve space for the typing indicator */}
                    <AnimatePresence>
                        {isOtherUserOnline ? (
                             <motion.p
                                key="online-indicator"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="text-xs text-green-400 font-semibold absolute bottom-0 left-0"
                            >
                                Online
                            </motion.p>
                        ) : isOtherUserTyping && (
                            <motion.p
                                key="typing-indicator"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3 }}
                                className="text-xs text-purple-400 absolute bottom-0 left-0"
                            >
                                typing...
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="relative flex-1 overflow-y-auto p-4 space-y-2 bg-zinc-950">
        {loadingMore && (
            <div className="flex justify-center py-4">
                <LoadingSpinner />
            </div>
        )}
        <AnimatePresence initial={false}>
            {renderMessagesWithSeparators()}
        </AnimatePresence>
        <div ref={messagesEndRef} />
        
        <AnimatePresence>
            {showRizzButton && (
                 <MotionDiv
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-4 right-4 z-20"
                 >
                    <button 
                        onClick={handleRizzCheck}
                        disabled={isRizzing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-full shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-70 animate-pulse-subtle"
                    >
                         {isRizzing ? <LoadingSpinner /> : <Sparkles size={16}/>}
                        Check your Rizz
                    </button>
                </MotionDiv>
            )}
            {rizzResult && <RizzDisplay result={rizzResult} onClose={() => setRizzResult(null)} />}
        </AnimatePresence>

      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-zinc-800 bg-zinc-950/70 backdrop-blur-lg">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            {!newMessage.trim() && <IcebreakerGenerator otherUser={conversation.otherUser} onSelect={handleSelectIcebreaker} />}
            <textarea
                ref={textareaRef} 
                value={newMessage}
                onChange={e => {
                    setNewMessage(e.target.value);
                    handleTyping();
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 w-full p-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none max-h-32"
            />
            <MotionButton 
              aria-label="Send message"
              whileTap={{ scale: 0.9 }}
              type="submit" disabled={isSending || !newMessage.trim()} className={`p-3 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${PREMIUM_GRADIENT}`}>
                 <Send />
            </MotionButton>
        </form>
      </div>
    </div>
  );
};
export default ChatDetailScreen;
