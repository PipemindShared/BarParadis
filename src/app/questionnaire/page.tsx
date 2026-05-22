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
const TEAL_DEEP = "#0f7a70";
const INK = "#1d2a3a";
const INK_SOFT = "#475569";
const INK_MUTED = "#7a8a9a";

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
    <div
      className="relative flex h-[100dvh] w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #f3f7fb 0%, #e5edf5 50%, #d6e2ec 100%)",
        color: INK,
      }}
    >
      {/* Divine rays from above */}
      <div className="divine-rays pointer-events-none absolute inset-0" />

      {/* Sun glow at top center */}
      <div
        className="sun-pulse pointer-events-none absolute left-1/2 top-[-160px] h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,210,130,0.75) 0%, rgba(255,200,110,0.55) 20%, rgba(255,220,160,0.32) 45%, rgba(255,235,190,0.16) 65%, transparent 80%)",
          filter: "blur(18px)",
        }}
      />

      <DriftingClouds />

      <div className="pointer-events-none absolute inset-0 z-[6] opacity-[0.06] mix-blend-multiply grain" />

      <div className="relative z-10 flex h-full w-full flex-col px-5 pt-5 pb-6">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={index === 0 || transitioning}
            className="font-mono text-[12px] uppercase tracking-[0.18em] transition-opacity disabled:opacity-25"
            style={{ color: INK_MUTED }}
          >
            ← retour
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em]" style={{ color: INK_SOFT }}>
              <span style={{ color: TEAL }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span style={{ color: INK_MUTED }}> / {String(total).padStart(2, "0")}</span>
            </span>
          </div>
        </header>

        <div
          className="mt-3 h-[3px] w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "rgba(29, 42, 58, 0.1)" }}
        >
          <motion.div
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${TEAL_DEEP} 0%, ${TEAL} 100%)`,
              boxShadow: `0 0 12px ${TEAL}66`,
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
            <div
              className="mt-6 celestial-float"
              style={{ animationDuration: "8s", animationDelay: "0.8s" }}
            >
              <p
                className="font-mono text-[11px] uppercase tracking-[0.3em]"
                style={{ color: INK_MUTED }}
              >
                Question {String(question.id).padStart(2, "0")}
              </p>
              <h2
                className="mt-3 font-serif text-[clamp(1.65rem,7.5vw,2.5rem)] italic leading-[1.05] tracking-tight"
                style={{ color: INK }}
              >
                <span className="block">{question.intro}</span>
                <span className="block" style={{ color: TEAL }}>
                  {question.text}
                </span>
              </h2>
            </div>

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
      <div
        className="celestial-float"
        style={{
          animationDuration: `${6 + index * 0.6}s`,
          animationDelay: `${1.4 + index * 0.3}s`,
        }}
      >
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200 disabled:cursor-default"
          style={{
            borderColor: selected ? TEAL : "rgba(29, 42, 58, 0.12)",
            backgroundColor: selected
              ? "rgba(25, 151, 138, 0.10)"
              : "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: selected
              ? `0 8px 30px -8px ${TEAL}66, 0 0 0 1px ${TEAL}33 inset`
              : "0 4px 24px -8px rgba(29, 42, 58, 0.12)",
          }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-serif text-xl italic transition-colors"
            style={{
              borderColor: selected ? TEAL : "rgba(29, 42, 58, 0.2)",
              backgroundColor: selected ? `${TEAL}22` : "rgba(255,255,255,0.6)",
              color: selected ? TEAL_DEEP : INK,
            }}
          >
            {option.letter}
          </div>
          {option.subtitle || option.description ? (
            <div className="flex-1 pt-0.5">
              <p
                className="font-serif text-[22px] italic leading-none"
                style={{ color: INK }}
              >
                {option.text}
              </p>
              {option.subtitle && (
                <p
                  className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: TEAL }}
                >
                  {option.subtitle}
                </p>
              )}
              {option.description && (
                <p
                  className="mt-2 text-[13px] leading-snug"
                  style={{ color: INK_SOFT }}
                >
                  {option.description}
                </p>
              )}
            </div>
          ) : (
            <p className="pt-1 text-[15px] leading-snug" style={{ color: INK }}>
              {option.text}
            </p>
          )}

          {selected && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                boxShadow: `0 0 0 2px ${TEAL}`,
              }}
            />
          )}
        </button>
      </div>
    </motion.li>
  );
}

function DriftingClouds() {
  const clouds = [
    { size: 360, top: "8%", left: "-15%", anim: "drift-a", duration: 48, delay: 0, opacity: 0.6 },
    { size: 280, top: "32%", left: "65%", anim: "drift-b", duration: 56, delay: 4, opacity: 0.5 },
    { size: 400, top: "58%", left: "-22%", anim: "drift-c", duration: 64, delay: 9, opacity: 0.55 },
    { size: 240, top: "20%", left: "72%", anim: "drift-d", duration: 52, delay: 2, opacity: 0.7 },
    { size: 320, top: "78%", left: "45%", anim: "drift-e", duration: 60, delay: 6, opacity: 0.5 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {clouds.map((c, i) => (
        <div
          key={i}
          className="cloud-light"
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            opacity: c.opacity,
            animationName: c.anim,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
