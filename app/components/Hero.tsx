'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700/10 via-slate-950 to-slate-950" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Left Section - Text Content */}
          <div className="flex-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            >
              <p className="text-lg md:text-xl text-slate-400 mb-2">I am</p>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-100 leading-tight">
                Jonas
              </h1>
            </motion.div>

            <motion.p 
              className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              Contemporary data generalist. Inspired by the creative challenge.
            </motion.p>

            {/* CTA Button */}
            <motion.div 
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <a href="#projects">
                <Button variant="primary" className="text-lg px-8 py-4">
                  MY PROJECTS
                </Button>
              </a>
            </motion.div>
          </div>

          {/* Right Section - Profile Image */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative w-80 h-96 md:w-96 md:h-[32rem] lg:w-[28rem] lg:h-[36rem] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/profile.jpg"
                alt="Jonas Haahr"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 320px, (max-width: 1024px) 384px, 448px"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="pt-16 text-center animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <svg
            className="w-6 h-6 mx-auto text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
