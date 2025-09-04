
import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateIcebreakers } from '../../services/gemini.ts';
import { BasicProfile } from '../../types.ts';
import LoadingSpinner from '../LoadingSpinner.tsx';
import { useNotification } from '../../hooks/useNotification.ts';

// Fix for framer-motion type errors
const MotionDiv: any = motion.div;

interface IcebreakerGeneratorProps {
    otherUser: BasicProfile;
    onSelect: (icebreaker: string) => void;
}

export const IcebreakerGenerator: React.FC<IcebreakerGeneratorProps> = ({ otherUser, onSelect }) => {
    const [loading, setLoading] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const { showNotification } = useNotification();

    const handleGenerate = async () => {
        setLoading(true);
        // If suggestions are already visible, regenerate. Otherwise, fetch them.
        if (!showSuggestions) {
            setShowSuggestions(true);
        }
        try {
            const result = await generateIcebreakers(otherUser);
            setSuggestions(result);
        } catch (error: any) {
            showNotification(error.message, 'error');
            setShowSuggestions(false); // Hide on error
        } finally {
            setLoading(false);
        }
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
                disabled={loading}
                className="p-3 rounded-full text-purple-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                aria-label="Suggest icebreakers"
            >
                {loading && !showSuggestions ? <LoadingSpinner /> : <Sparkles />}
            </button>

            {showSuggestions && (
                 <MotionDiv
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-14 -right-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg p-2 z-20"
                >
                    {loading ? (
                        <div className="flex justify-center items-center h-24">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectSuggestion(s)}
                                    className="w-full text-left p-2 rounded-lg hover:bg-zinc-700 text-sm text-zinc-200"
                                >
                                    "{s}"
                                </button>
                            ))}
                             <button
                                onClick={() => setShowSuggestions(false)}
                                className="w-full text-center p-1 mt-1 rounded-lg text-xs text-zinc-500 hover:bg-zinc-700"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </MotionDiv>
            )}
        </div>
    );
};
