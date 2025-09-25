
import * as React from 'react';

const BlurredPlaceholder: React.FC = () => {
    // Generate a random gradient for variety
    const fromColor = ['from-pink-900', 'from-purple-900', 'from-indigo-900'][Math.floor(Math.random() * 3)];
    const toColor = ['to-neutral-900', 'to-black'][Math.floor(Math.random() * 2)];

    return (
        <div className="relative aspect-square rounded-2xl overflow-hidden">
            <div className={`w-full h-full bg-gradient-to-br ${fromColor} ${toColor} opacity-50 blur-lg`}></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
    );
};

export default BlurredPlaceholder;
