
import * as React from 'react';
import { proposeBlindDate } from '../../services/api.ts';
import { useNotification } from '../../hooks/useNotification.ts';
import { useUser } from '../../hooks/useUser.ts';
import { PREMIUM_GRADIENT } from '../../constants/constants.ts';
import { DEFAULT_CAFES, MEAL_TYPES, MealType, CafeOption } from '../../constants/defaultCafes.ts';
import LoadingSpinner from '../LoadingSpinner.tsx';
import { X, MapPin, Calendar, Clock, Utensils, ChevronLeft, Sparkles, Plus, Search } from 'lucide-react';
import { BlindDate } from '../../types/types.ts';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for framer-motion type errors
const MotionDiv: any = motion.div;
const MotionButton: any = motion.button;

interface BookBlindDateModalProps {
    onClose: () => void;
    userLocation?: { latitude: number; longitude: number; }
}

const BookBlindDateModal: React.FC<BookBlindDateModalProps> = ({ onClose }) => {
    const [step, setStep] = React.useState(1);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCafe, setSelectedCafe] = React.useState('');
    const [customLocation, setCustomLocation] = React.useState('');
    const [showCustomInput, setShowCustomInput] = React.useState(false);
    const [date, setDate] = React.useState('');
    const [time, setTime] = React.useState('');
    const [selectedMeal, setSelectedMeal] = React.useState<MealType>('Coffee & Snacks');
    const [loading, setLoading] = React.useState(false);
    const { showNotification } = useNotification();
    const { user } = useUser();
    
    // Filter cafes based on search term
    const filteredCafes = React.useMemo(() => {
        if (!searchTerm) return DEFAULT_CAFES;
        return DEFAULT_CAFES.filter(cafe => 
            cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cafe.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleSubmit = async () => {
        if (!user) return;
        
        const finalLocation = showCustomInput ? customLocation : selectedCafe;
        
        if (!finalLocation || !date || !time) {
            showNotification('Please fill out all fields.', 'error');
            return;
        }
        
        const dateTime = new Date(`${date}T${time}`);
        if (isNaN(dateTime.getTime())) {
            showNotification('Invalid date or time provided.', 'error');
            return;
        }
        if (dateTime < new Date()) {
            showNotification('You cannot propose a date in the past.', 'error');
            return;
        }

        setLoading(true);
        try {
            // Convert MealType to BlindDate['meal'] format
            const mealForApi = selectedMeal as BlindDate['meal'];
            await proposeBlindDate(finalLocation, dateTime.toISOString(), mealForApi);
            showNotification('Date proposal posted! We\'ll notify you if someone accepts.', 'success');
            onClose();
        } catch (error: any) {
            showNotification(error.message || 'Failed to propose date.', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const today = new Date().toISOString().split('T')[0];

    const renderStep1 = () => (
         <MotionDiv key="step1" initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}>
            <h2 className="text-2xl font-bold flex items-center gap-2"><MapPin className="text-purple-400"/> Choose a Location</h2>
            <p className="text-zinc-400 mt-1">Select from popular spots or add your own.</p>
            
            {/* Search Bar */}
            <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
                <input
                    type="text"
                    placeholder="Search for a location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
            </div>

            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {/* Custom Location Option */}
                <button 
                    onClick={() => { 
                        setShowCustomInput(true);
                        setSelectedCafe('');
                        setStep(2);
                    }} 
                    className="w-full text-left p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <Plus size={16} className="text-white flex-shrink-0" /> 
                    <span className="text-white font-semibold">Add Custom Location</span>
                </button>

                {/* Predefined Locations */}
                {filteredCafes.map(cafe => (
                    <button 
                        key={cafe.id} 
                        onClick={() => { 
                            setSelectedCafe(cafe.name);
                            setShowCustomInput(false);
                            setStep(2);
                        }} 
                        className="w-full text-left p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-yellow-400 flex-shrink-0" /> 
                            <div>
                                <span className="block font-medium">{cafe.name}</span>
                                {cafe.description && (
                                    <span className="text-xs text-zinc-500">{cafe.description}</span>
                                )}
                            </div>
                        </div>
                        <span className="text-xs text-zinc-600 bg-zinc-700 px-2 py-1 rounded group-hover:bg-zinc-600">
                            {cafe.type}
                        </span>
                    </button>
                ))}
                
                {filteredCafes.length === 0 && (
                    <p className="text-center text-zinc-500 py-4">No locations found. Try adding a custom location!</p>
                )}
            </div>
        </MotionDiv>
    );
    
    const renderStep2 = () => (
         <MotionDiv key="step2" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}>
            <div className="flex items-center gap-2">
                 <button onClick={() => { setStep(1); setShowCustomInput(false); }} className="p-1 text-zinc-400 hover:text-white"><ChevronLeft /></button>
                 <h2 className="text-2xl font-bold">Set the Details</h2>
            </div>
            
            {showCustomInput ? (
                <div className="mt-4">
                    <label className="text-sm text-zinc-400">Enter your custom location:</label>
                    <input
                        type="text"
                        placeholder="e.g., Central Park, Main Street Cafe"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="w-full mt-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                        autoFocus
                    />
                </div>
            ) : (
                <p className="text-zinc-400 mt-1 pl-8">You're proposing a date at <span className="font-semibold text-purple-300">{selectedCafe}</span>.</p>
            )}
            
            <div className="mt-6 space-y-4">
                 <div className="flex items-center gap-2">
                    <Calendar className="text-zinc-400"/>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                        min={today} 
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <Clock className="text-zinc-400"/>
                    <input 
                        type="time" 
                        value={time} 
                        onChange={e => setTime(e.target.value)} 
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <Utensils className="text-zinc-400"/>
                    <select 
                        value={selectedMeal} 
                        onChange={(e) => setSelectedMeal(e.target.value as MealType)} 
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    >
                        {MEAL_TYPES.map(meal => <option key={meal} value={meal}>{meal}</option>)}
                    </select>
                 </div>
             </div>
              <MotionButton
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full mt-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${PREMIUM_GRADIENT} hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center`}
                >
                    {loading ? <LoadingSpinner/> : 'Post Date Proposal'}
                </MotionButton>
        </MotionDiv>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <MotionDiv 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-zinc-950/60 backdrop-blur-xl rounded-3xl w-full max-w-sm p-8 border border-zinc-700 shadow-2xl shadow-purple-500/10"
            >
                <div className="absolute top-4 left-4 text-sm font-semibold text-zinc-500">Step {step} of 2</div>
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                    <X />
                </button>
                <AnimatePresence mode="wait">
                    {step === 1 ? renderStep1() : renderStep2()}
                </AnimatePresence>
            </MotionDiv>
        </div>
    );
};

export default BookBlindDateModal;
