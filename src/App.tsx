/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, RefreshCcw } from 'lucide-react';

// --- Types ---
interface Question {
  num1: number;
  num2: number;
  operator: '+' | '-';
  answer: number;
  options: number[];
}

export default function App() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [score, setScore] = useState(0);

  // --- Logic ---
  const generateQuestion = useCallback(() => {
    const operator = Math.random() > 0.5 ? '+' : '-';
    let n1 = Math.floor(Math.random() * 9000) + 100; // 100 to 9100
    let n2 = Math.floor(Math.random() * 9000) + 100;
    
    if (operator === '-') {
      // Ensure no negative results
      const max = Math.max(n1, n2);
      const min = Math.min(n1, n2);
      n1 = max;
      n2 = min;
    } else {
      // Ensure sum doesn't exceed 10000 for "within 10000"
      if (n1 + n2 > 10000) {
        n1 = Math.floor(n1 / 2);
        n2 = Math.floor(n2 / 2);
      }
    }

    const answer = operator === '+' ? n1 + n2 : n1 - n2;
    
    // Generate 3 unique wrong options
    const optionsSet = new Set<number>([answer]);
    while (optionsSet.size < 4) {
      const offset = Math.floor(Math.random() * 20) - 10; // offset by -10 to 10
      const multiplier = Math.random() > 0.5 ? 1 : 10; // sometimes off by tens
      const wrong = Math.max(0, answer + offset * multiplier);
      if (wrong !== answer) optionsSet.add(wrong);
    }
    
    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    setQuestion({ num1: n1, num2: n2, operator, answer, options });
    setFeedback(null);
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleChoice = (choice: number) => {
    if (question && choice === question.answer) {
      setFeedback('太棒了！✨');
      setScore(s => s + 1);
      setTimeout(() => {
        generateQuestion();
      }, 1000);
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  if (!question) return null;

  return (
    <div className="min-h-screen bg-[#FFF5F5] flex flex-col items-center justify-center p-6 font-sans select-none overflow-hidden">
      {/* Score Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-8 flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-[#FF85A1] font-bold"
      >
        <Trophy size={20} />
        <span>得分: {score}</span>
      </motion.div>

      {/* Main Game Card */}
      <motion.div
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Question Box */}
        <div className="bg-white rounded-[40px] shadow-2xl p-12 md:p-20 text-center relative mb-12 border-8 border-[#FFDEE9]">
          <motion.div
            key={`${question.num1}${question.operator}${question.num2}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl md:text-8xl font-black tracking-tight text-[#4A5568] flex items-center justify-center gap-4"
          >
            <span>{question.num1}</span>
            <span className="text-[#FF85A1]">{question.operator}</span>
            <span>{question.num2}</span>
          </motion.div>
          
          <div className="mt-8 text-4xl text-[#FF85A1] font-bold h-10">
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                >
                  {feedback}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Decorative Stars */}
          <div className="absolute top-4 left-4 text-[#FFD700] opacity-30 rotate-12"><Star size={24} fill="currentColor" /></div>
          <div className="absolute bottom-4 right-4 text-[#FFD700] opacity-30 -rotate-12"><Star size={32} fill="currentColor" /></div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {question.options.map((option, idx) => {
            const colors = [
              'bg-[#E6FFFA] hover:bg-[#B2F5EA] text-[#2C7A7B]', // Mint
              'bg-[#FEFCBF] hover:bg-[#FAF089] text-[#744210]', // Lemon
              'bg-[#FFFAF0] hover:bg-[#FEEBC8] text-[#9C4221]', // Peach
              'bg-[#EBF8FF] hover:bg-[#BEE3F8] text-[#2B6CB0]', // Sky
            ];
            return (
              <motion.button
                key={option}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChoice(option)}
                className={`${colors[idx]} py-6 md:py-8 rounded-[30px] shadow-lg text-3xl md:text-4xl font-bold transition-colors border-4 border-white active:shadow-inner`}
              >
                {option}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Footer Branding/Restart */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <button 
          onClick={generateQuestion}
          className="flex items-center gap-2 text-[#718096] hover:text-[#4A5568] transition-colors"
        >
          <RefreshCcw size={18} />
          <span className="font-medium">换一题</span>
        </button>
        <p className="text-[#A0AEC0] text-sm font-medium tracking-wide">
          让数学变得简单又有趣 ✨
        </p>
      </div>

      {/* Background Shapes */}
      <div className="fixed -z-10 top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-[#B2F5EA] rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-[#FED7E2] rounded-full blur-3xl" />
        <div className="absolute top-[60%] left-[5%] w-48 h-48 bg-[#FAF089] rounded-full blur-3xl" />
      </div>
    </div>
  );
}
