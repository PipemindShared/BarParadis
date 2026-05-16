"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  QUESTIONS,
  type Answer,
  type Option,
} from "@/lib/questionnaire";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

const slideVariants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? 50 : -50,
    filter: "blur(8px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
    filter: "blur(8px)",
  }),
};

export default function QuestionnairePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [transitioning, setTransitioning] = useState(false);

  const total = QUESTIONS.length;
  const question = QUESTIONS[index];
  const progress = ((index + (transitioning ? 1 : 0)) / total) * 100;

  function handleSelect(option: Option) {
    if (transitioning) return;
    setTransitioning(true);

    const newAnswers = [
      ...answers.filter((a) => a.questionId !== question.id),
      { questionId: question.id, letter: option.letter },
    ];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (index === total - 1) {
        try {
          localStorage.setItem("paradis_answers", JSON.stringify(newAnswers));
        } catch {}
        router.push("/elixir");
      } else {
        setDirection(1);
        setIndex(index + 1);
        setTransitioning(false);
      }
    }, 550);
  }

  function handleBack() {
    if (transitioning || index === 0) return;
    setDirection(-1);
    setIndex(index - 1);
  }

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-[#0a1729] via-[#101d34] to-[#06101e]">
      <DriftingClouds />
      <BackgroundOrbs />
      <div className="pointer-events-none absolute inset-0 z-[6] opacity-[0.08] mix-blend-overlay grain" />

      <div className="relative z-10 flex h-full w-full flex-col px-5 pt-5 pb-6 text-white">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={index === 0 || transitioning}
            className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/55 transition-opacity disabled:opacity-25 enabled:hover:text-white"
          >
            ← retour
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/70">
              <span style={{ color: TEAL_LIGHT }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-white/40"> / {String(total).padStart(2, "0")}</span>
            </span>
          </div>
        </header>

        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${TEAL} 0%, ${TEAL_LIGHT} 100%)`,
              boxShadow: `0 0 16px ${TEAL}99`,
            }}
          />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-1 flex-col"
          >
            <motion.div
              className="mt-6"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
                Question {String(question.id).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-serif text-[clamp(1.65rem,7.5vw,2.5rem)] italic leading-[1.05] tracking-tight text-white">
                <span className="block">{question.intro}</span>
                <span className="block" style={{ color: TEAL_LIGHT }}>
                  {question.text}
                </span>
              </h2>
            </motion.div>

            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {question.options.map((option, i) => (
                <OptionCard
                  key={option.letter}
                  option={option}
                  index={i}
                  onSelect={handleSelect}
                  disabled={transitioning}
                />
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OptionCard({
  option,
  index,
  onSelect,
  disabled,
}: {
  option: Option;
  index: number;
  onSelect: (option: Option) => void;
  disabled: boolean;
}) {
  const [selected, setSelected] = useState(false);

  function handleClick() {
    if (disabled || selected) return;
    setSelected(true);
    onSelect(option);
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.6,
        delay: 0.15 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{
          duration: 5 + index * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.4 + index * 0.2,
        }}
      >
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="group relative flex w-full items-start gap-4 rounded-2xl border border-white/15 bg-white/[0.04] p-4 text-left backdrop-blur-md transition-all duration-200 enabled:hover:border-white/40 enabled:hover:bg-white/[0.08] disabled:cursor-default"
          style={
            selected
              ? {
                  borderColor: TEAL,
                  backgroundColor: `${TEAL}33`,
                  boxShadow: `0 0 0 1px ${TEAL_LIGHT}66 inset, 0 10px 40px -10px ${TEAL}99`,
                }
              : undefined
          }
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-serif text-xl italic transition-colors"
            style={{
              borderColor: selected ? TEAL_LIGHT : "rgba(255,255,255,0.25)",
              backgroundColor: selected ? `${TEAL_LIGHT}33` : "transparent",
              color: selected ? TEAL_LIGHT : "white",
            }}
          >
            {option.letter}
          </div>
          <p className="pt-1 text-[15px] leading-snug text-white/90">
            {option.text}
          </p>

          {selected && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                boxShadow: `0 0 0 2px ${TEAL_LIGHT}`,
              }}
            />
          )}
        </button>
      </motion.div>
    </motion.li>
  );
}

function DriftingClouds() {
  const clouds = [
    {
      size: 360,
      top: "5%",
      left: "-20%",
      xRange: 220,
      yRange: -40,
      duration: 38,
      delay: 0,
      opacity: 0.07,
    },
    {
      size: 280,
      top: "35%",
      left: "65%",
      xRange: -180,
      yRange: 50,
      duration: 44,
      delay: 6,
      opacity: 0.05,
    },
    {
      size: 420,
      top: "60%",
      left: "-25%",
      xRange: 260,
      yRange: -30,
      duration: 52,
      delay: 12,
      opacity: 0.06,
    },
    {
      size: 220,
      top: "15%",
      left: "75%",
      xRange: -140,
      yRange: 40,
      duration: 36,
      delay: 3,
      opacity: 0.08,
    },
    {
      size: 320,
      top: "75%",
      left: "40%",
      xRange: 120,
      yRange: -50,
      duration: 48,
      delay: 9,
      opacity: 0.05,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white blur-3xl"
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            opacity: c.opacity,
          }}
          animate={{
            x: [0, c.xRange, 0],
            y: [0, c.yRange, 0],
          }}
          transition={{
            duration: c.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: c.delay,
          }}
        />
      ))}
    </div>
  );
}

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-20 top-10 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: `radial-gradient(circle, ${TEAL_LIGHT}, transparent 70%)` }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 top-1/3 h-96 w-96 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${TEAL}, transparent 70%)` }}
        animate={{ x: [0, 35, 0], y: [0, -25, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}
