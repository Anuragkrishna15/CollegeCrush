

import * as React from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const toggleVisibility = () => {
            const scrollableElement = document.querySelector('main');
            if (scrollableElement && scrollableElement.scrollTop > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        const scrollableElement = document.querySelector('main');
        scrollableElement?.addEventListener('scroll', toggleVisibility);

        return () => scrollableElement?.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        document.querySelector('main')?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-28 md:bottom-8 right-8 z-50 p-3 rounded-full bg-pink-600/80 backdrop-blur-sm text-white shadow-lg transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Scroll to top"
        >
            <ChevronUp className="h-6 w-6" />
        </button>
    );
};

export default ScrollToTopButton;