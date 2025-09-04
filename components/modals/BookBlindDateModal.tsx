
import * as React from 'react';
import { proposeBlindDate } from '../../services/api.ts';
import { findNearbyCafes } from '../../services/gemini.ts';
import { useNotification } from '../../hooks/useNotification.ts';
import { useUser } from '../../hooks/useUser.ts';
import { PREMIUM_GRADIENT } from '../../constants.tsx';
import LoadingSpinner from '../LoadingSpinner.tsx';
import { X, MapPin, Calendar, Clock, Utensils, ChevronLeft, Sparkles } from 'lucide-react';
import { BlindDate } from '../../types.ts';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for framer-motion type errors
const MotionDiv: any = motion.div;
const MotionButton: any = motion.button;

interface BookBlindDateModalProps {
    onClose: () => void;
    userLocation: { latitude: number; longitude: number; }
}

const mealTypes: BlindDate['meal'][] = ['Coffee & Snacks', 'Breakfast', 'Lunch', 'Dinner'];

const BookBlindDateModal: React.FC<BookBlindDateModalProps> = ({ onClose, userLocation }) => {
    const [step, setStep] = React.useState(1);
    const [cafes, setCafes] = React.useState<string[]>([]);
    const [loadingCafes, setLoadingCafes] = React.useState(true);
    const [selectedCafe, setSelectedCafe] = React.useState('');
    const [date, setDate] = React.useState('');
    const [time, setTime] = React.useState('');
    const [selectedMeal, setSelectedMeal] = React.useState<BlindDate['meal']>('Coffee & Snacks');
    const [loading, setLoading] = React.useState(false);
    const { showNotification } = useNotification();
    const { user } = useUser();
    
    React.useEffect(() => {
        if (userLocation) {
            setLoadingCafes(true);
            findNearbyCafes(userLocation.latitude, userLocation.longitude)
                .then(setCafes)
                .catch(err => {
                    showNotification(err.message, 'error');
                    onClose();
                })
                .finally(() => setLoadingCafes(false));
        }
    }, [userLocation, showNotification, onClose]);

    const handleSubmit = async () => {
        if (!user) return;
        if (!selectedCafe || !date || !time) {
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
            await proposeBlindDate(selectedCafe, dateTime.toISOString(), selectedMeal);
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
            <h2 className="text-2xl font-bold flex items-center gap-2"><MapPin className="text-purple-400"/> Choose a Café</h2>
            <p className="text-zinc-400 mt-1">Here are some popular spots near you.</p>
            {loadingCafes ? (
                <div className="h-48 flex items-center justify-center"><LoadingSpinner /></div>
            ) : (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                    {cafes.map(cafe => (
                        <button key={cafe} onClick={() => { setSelectedCafe(cafe); setStep(2); }} className="w-full text-left p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2">
                            <Sparkles size={14} className="text-yellow-400 flex-shrink-0" /> <span>{cafe}</span>
                        </button>
                    ))}
                </div>
            )}
        </MotionDiv>
    );
    
    const renderStep2 = () => (
         <MotionDiv key="step2" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}>
            <div className="flex items-center gap-2">
                 <button onClick={() => setStep(1)} className="p-1 text-zinc-400 hover:text-white"><ChevronLeft /></button>
                 <h2 className="text-2xl font-bold">Set the Details</h2>
            </div>
            <p className="text-zinc-400 mt-1 pl-8">You're proposing a date at <span className="font-semibold text-purple-300">{selectedCafe}</span>.</p>
            <div className="mt-6 space-y-4">
                 <div className="flex items-center gap-2">
                    <Calendar className="text-zinc-400"/>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} min={today} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg"/>
                 </div>
                 <div className="flex items-center gap-2">
                    <Clock className="text-zinc-400"/>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg"/>
                 </div>
                 <div className="flex items-center gap-2">
                    <Utensils className="text-zinc-400"/>
                    <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value as BlindDate['meal'])} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                        {mealTypes.map(meal => <option key={meal} value={meal}>{meal}</option>)}
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