import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show button when scrolling up or at top of page
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Check if window is defined (browser environment)
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        try {
          window.removeEventListener("scroll", handleScroll);
        } catch (error) {
          console.debug('Error removing scroll listener:', error);
        }
      };
    }
  }, [lastScrollY]);

  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.open("https://wa.me/254795564135", "_blank");
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={buttonRef}
          className="fixed bottom-6 left-6 z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            y: 20,
            scale: 0.8
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300,
            damping: 20
          }}
        >
          <button
            onClick={handleClick}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
            aria-label="Chat with us on WhatsApp"
          >
            <MessageCircle className="h-6 w-6 md:h-8 md:w-8" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppButton;