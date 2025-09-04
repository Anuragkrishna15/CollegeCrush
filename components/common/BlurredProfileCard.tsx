

import * as React from 'react';
import { Profile, BasicProfile } from '../../types.ts';
import { getOptimizedUrl } from '../../utils/date.ts';

interface BlurredProfileCardProps {
    profile: Profile | BasicProfile;
}

const BlurredProfileCard: React.FC<BlurredProfileCardProps> = ({ profile }) => {
    return (
        <div className="relative aspect-square rounded-2xl overflow-hidden">
            <img 
                src={getOptimizedUrl(profile.profilePics[0], { width: 250, height: 250, quality: 30 })} 
                alt="A potential match" 
                className="w-full h-full object-cover filter blur-xl grayscale scale-110" 
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
    );
};

export default BlurredProfileCard;