import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  fullWidth?: boolean;
}

export const ScrollReveal = ({ 
  children, 
  delay = 0,
  direction = "up",
  fullWidth = false 
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isMobile = useIsMobile();
  // Use a smaller margin to trigger animations earlier - shows content when 50px from viewport
  const isInView = useInView(ref, { once: true, margin: "50px" });

  // Disable animations on mobile for better performance
  if (isMobile) {
    return <div ref={ref} className={fullWidth ? "w-full" : ""}>{children}</div>;
  }

  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0,
        ...directionOffset[direction]
      }}
      animate={isInView ? {
        opacity: 1,
        x: 0,
        y: 0
      } : {}}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      className={fullWidth ? "w-full" : ""}
    >
      {children}
    </motion.div>
  );
};

// Staggered children animation for lists
interface ScrollRevealListProps {
  children: ReactNode;
  staggerDelay?: number;
}

export const ScrollRevealList = ({ children, staggerDelay = 0.1 }: ScrollRevealListProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

export const ScrollRevealItem = ({ children }: { children: ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.4, 0.25, 1]
        }
      }
    }}
  >
    {children}
  </motion.div>
);
