
import * as React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateCustomIcebreakers } from '../../constants/icebreakers.ts';
import { BasicProfile } from '../../types/types.ts';
import LoadingSpinner from '../LoadingSpinner.tsx';

// Fix for framer-motion type errors
const MotionDiv: any = motion.div;

interface IcebreakerGeneratorProps {
    otherUser: BasicProfile;
    onSelect: (icebreaker: string) => void;
}

export const IcebreakerGenerator: React.FC<IcebreakerGeneratorProps> = ({ otherUser, onSelect }) => {
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleGenerate = () => {
        // Simulate a brief loading animation for better UX
        setIsAnimating(true);
        
        // If suggestions are already visible, regenerate. Otherwise, fetch them.
        if (!showSuggestions) {
            setShowSuggestions(true);
        }
        
        // Generate new icebreakers using the non-AI function
        setTimeout(() => {
            const result = generateCustomIcebreakers({
                name: otherUser.name,
                college: otherUser.college,
                course: otherUser.course,
                tags: otherUser.tags || [],
                prompts: otherUser.prompts
            });
            setSuggestions(result);
            setIsAnimating(false);
        }, 300); // Small delay for smooth animation
    };

    const handleSelectSuggestion = (suggestion: string) => {
        onSelect(suggestion);
        setShowSuggestions(false);
        setSuggestions([]);
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleGenerate}
                disabled={isAnimating}
                className="p-3 rounded-full text-purple-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                aria-label="Suggest icebreakers"
                title="Get conversation starters"
            >
                {isAnimating ? (
                    <MotionDiv
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5, ease: "linear" }}
                    >
                        <RefreshCw size={20} />
                    </MotionDiv>
                ) : (
                    <Sparkles />
                )}
            </button>

            {showSuggestions && (
                 <MotionDiv
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-14 -right-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg p-2 z-20"
                >
                    {isAnimating ? (
                        <div className="flex justify-center items-center h-24">
                            <MotionDiv
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.5, ease: "linear", repeat: Infinity }}
                            >
                                <RefreshCw size={20} className="text-purple-400" />
                            </MotionDiv>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <div className="px-2 py-1 text-xs text-zinc-500 font-semibold">Conversation Starters</div>
                            {suggestions.map((s, i) => (
                                <MotionDiv
                                    key={`${i}-${s.substring(0, 10)}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <button
                                        onClick={() => handleSelectSuggestion(s)}
                                        className="w-full text-left p-2 rounded-lg hover:bg-zinc-700 text-sm text-zinc-200 transition-colors"
                                    >
                                        "{s}"
                                    </button>
                                </MotionDiv>
                            ))}
                            <div className="flex gap-1 mt-1">
                                <button
                                    onClick={handleGenerate}
                                    className="flex-1 text-center p-1 rounded-lg text-xs text-purple-400 hover:bg-zinc-700 flex items-center justify-center gap-1"
                                >
                                    <RefreshCw size={12} /> Refresh
                                </button>
                                <button
                                    onClick={() => setShowSuggestions(false)}
                                    className="flex-1 text-center p-1 rounded-lg text-xs text-zinc-500 hover:bg-zinc-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </MotionDiv>
            )}
        </div>
    );
};
