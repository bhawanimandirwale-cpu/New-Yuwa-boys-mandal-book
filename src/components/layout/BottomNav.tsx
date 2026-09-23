'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Receipt, 
  Wallet,
  Users, 
  FileText
} from 'lucide-react';

type Coords = {
  x: number;
  y: number;
};

export function BottomNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [eyeCoords, setEyeCoords] = useState<Coords>({ x: 0, y: 0 });

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch (e) {
        // Ignore haptic error if unsupported
      }
    }
  };

  // Creepy-button eye tracking relative to touch / cursor
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const userEvent =
      'touches' in e ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent);

    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const navCenter = {
      x: navRect.left + navRect.width / 2,
      y: navRect.top + navRect.height / 2,
    };

    const dx = userEvent.clientX - navCenter.x;
    const dy = userEvent.clientY - navCenter.y;
    const angle = Math.atan2(-dy, dx) + Math.PI / 2;

    const visionRangeX = 160;
    const visionRangeY = 70;
    const distance = Math.hypot(dx, dy);

    const x = (Math.sin(angle) * Math.min(distance, visionRangeX)) / visionRangeX;
    const y = (Math.cos(angle) * Math.min(distance, visionRangeY)) / visionRangeY;

    setEyeCoords({ x, y });
  };

  const resetEyes = () => {
    setEyeCoords({ x: 0, y: 0 });
  };

  const pupilStyle = {
    transform: `translate(calc(-50% + ${eyeCoords.x * 50}%), calc(-50% + ${eyeCoords.y * 50}%))`,
  };

  const navItems = [
    { label: 'होम', href: '/', icon: Home, color: 'text-saffron-600' },
    { label: 'पावत्या', href: '/donations', icon: Receipt, color: 'text-saffron-600' },
    { label: 'खर्च', href: '/expenses', icon: Wallet, color: 'text-rose-600' },
    { label: 'कार्यकर्ते', href: '/members', icon: Users, color: 'text-amber-600' },
    { label: 'कागदपत्रे', href: '/documents', icon: FileText, color: 'text-blue-600' },
  ];

  return (
    <nav 
      ref={navRef}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      onMouseLeave={resetEyes}
      className="fixed bottom-0 left-0 right-0 z-40 bg-transparent sm:hidden notranslate"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <div className="flex items-center justify-between px-2 h-16 max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={triggerHaptic}
              className="flex-1 py-1 relative flex flex-col items-center justify-center select-none"
            >
              {/* Creepy-Button Motion Wrapper (Zero background) */}
              <motion.div
                className="relative flex flex-col items-center justify-center px-2 py-1 w-full bg-transparent"
                whileHover={{ scale: 1.15, rotate: -7 }}
                whileTap={{ scale: 0.88, rotate: 7 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 18,
                  mass: 0.7,
                }}
              >
                {/* Active Peek-a-boo Blinking Eyes from CreepyButton */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.4, y: 3 }}
                      animate={{ opacity: 1, scale: 1, y: -4 }}
                      exit={{ opacity: 0, scale: 0.4, y: 3 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -top-1.5 flex items-center gap-[2.5px] z-20 pointer-events-none"
                    >
                      {/* Left Eye */}
                      <motion.span
                        className="relative w-2.5 h-2.5 bg-white rounded-full overflow-hidden shadow-xs border border-gray-400"
                        animate={{ height: ['9px', '9px', '0px', '9px'] }}
                        transition={{
                          duration: 2.8,
                          times: [0, 0.92, 0.96, 1],
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <span
                          className="absolute top-1/2 left-1/2 w-1 h-1 bg-gray-900 rounded-full transition-transform duration-75 ease-out"
                          style={pupilStyle}
                        />
                      </motion.span>

                      {/* Right Eye */}
                      <motion.span
                        className="relative w-2.5 h-2.5 bg-white rounded-full overflow-hidden shadow-xs border border-gray-400"
                        animate={{ height: ['9px', '9px', '0px', '9px'] }}
                        transition={{
                          duration: 2.8,
                          times: [0, 0.92, 0.96, 1],
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <span
                          className="absolute top-1/2 left-1/2 w-1 h-1 bg-gray-900 rounded-full transition-transform duration-75 ease-out"
                          style={pupilStyle}
                        />
                      </motion.span>
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Icon with Creepy tilt dynamics */}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? `${item.color} stroke-[2.8]` : 'text-gray-600 hover:text-gray-900 stroke-2'
                  }`}
                />

                {/* Label */}
                <span
                  className={`text-[11px] tracking-tight font-heading mt-0.5 transition-colors ${
                    isActive ? `${item.color} font-black` : 'text-gray-600 font-semibold'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
