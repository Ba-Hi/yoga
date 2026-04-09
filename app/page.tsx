"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, Heart, CheckCircle2, Wind, Activity, Timer, Play, Pause, RotateCcw } from "lucide-react"
import { EXERCISE_DATA, type ExerciseOption } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Home() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null)

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <header className="relative z-10 w-full p-6 md:p-8 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Heart className="w-6 h-6" />
          </div>
          <span className="font-semibold text-xl tracking-tight">Pause QVT</span>
        </div>
      </header>

      <div className="flex-1 relative z-10 w-full max-w-6xl mx-auto p-6 md:p-8 flex flex-col">
        <AnimatePresence mode="wait">
          {!selectedExercise ? (
            <LandingView key="landing" onSelect={setSelectedExercise} />
          ) : (
            <ExerciseView key="exercise" data={selectedExercise} onBack={() => setSelectedExercise(null)} />
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  )
}

function LandingView({ onSelect }: { onSelect: (option: ExerciseOption) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full"
    >
      <div className="space-y-6 text-center mb-12 md:mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
          Prévention TMS & Gestion du Stress
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground text-balance">
          Votre assistant santé au bureau.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
          La sédentarité est le mal du siècle en entreprise. Ce module s'intègre à votre journée, sans changer de tenue,
          pour une démarche durable de santé au travail.
        </p>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-center mb-8">
          De combien de temps disposez-vous avant votre prochaine réunion ?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXERCISE_DATA.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              onClick={() => onSelect(option)}
              className="group relative flex flex-col p-6 h-full bg-white dark:bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 text-left"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                  option.id === "1min"
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    : option.id === "3min"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                )}
              >
                {option.id === "1min" ? (
                  <Wind className="w-6 h-6" />
                ) : option.id === "3min" ? (
                  <Activity className="w-6 h-6" />
                ) : (
                  <Timer className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-2xl">{option.durationLabel}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                </div>
                <h3 className="font-medium text-muted-foreground">{option.theme}</h3>
              </div>

              <p className="text-sm text-muted-foreground mt-auto pt-4 border-t border-dashed">{option.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function ExerciseView({ data, onBack }: { data: ExerciseOption; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full w-full"
    >
      <button
        onClick={onBack}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group w-fit"
      >
        <div className="bg-secondary p-2 rounded-full mr-2 group-hover:bg-secondary/80 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Retour à l'accueil
      </button>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="space-y-6">
          <div className="space-y-2">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                data.id === "1min"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  : data.id === "3min"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
              )}
            >
              {data.durationLabel} • {data.theme}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">{data.title}</h2>
            <p className="text-lg text-muted-foreground">{data.description}</p>
          </div>

          <div className="space-y-6">
            {data.exercises.map((ex, i) => (
              <div key={i} className="bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{ex.title}</h3>
                      <p className="text-sm text-primary/80 font-medium mb-2">{ex.what}</p>
                    </div>
                    <ul className="space-y-2">
                      {ex.instructions.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground text-sm leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-muted-foreground/50 flex-shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button onClick={onBack} size="lg" className="w-full md:w-auto rounded-full">
              Terminer la pause
            </Button>
          </div>
        </div>

        <div className="relative aspect-[4/5] md:aspect-square w-full rounded-3xl overflow-hidden bg-muted shadow-xl sticky top-8 group">
          <img
            src={`/.jpg?key=gusd9&height=800&width=800&query=${encodeURIComponent(data.placeholderQuery)}`}
            alt={data.theme}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
            {/* Exercise Timer Component overlaid on the image */}
            <ExerciseTimer durationId={data.id} />

            <div className="text-white mt-6">
              <p className="font-medium text-white/80 uppercase tracking-wider text-xs mb-2">Focus</p>
              <p className="text-2xl font-bold">{data.theme}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Exercise Timer component
function ExerciseTimer({ durationId }: { durationId: string }) {
  const durationMap: Record<string, number> = {
    "1min": 60,
    "3min": 180,
    "5min": 300,
  }

  const totalTime = durationMap[durationId] || 60
  const [timeLeft, setTimeLeft] = useState(totalTime)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      setIsCompleted(true)
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const toggleTimer = () => {
    if (isCompleted) {
      setTimeLeft(totalTime)
      setIsCompleted(false)
      setIsActive(true)
    } else {
      setIsActive(!isActive)
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsCompleted(false)
    setTimeLeft(totalTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  return (
  <div className="relative w-full rounded-2xl overflow-hidden">

    {/* 🌄 Background image */}
    <div
      className="absolute inset-0 bg-cover bg-center opacity-40"
      style={{
        backgroundImage: `url('/bg-timer-${durationId}.jpg')`,
      }}
    ></div>

    {/* Overlay sombre + blur */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

    {/* Timer content */}
    <div className="relative z-10 w-full rounded-2xl p-4 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-xs text-white/70 font-medium uppercase tracking-wider">Minuteur</span>
          <span className="text-3xl font-mono font-bold text-white tabular-nums tracking-wider">
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
            onClick={toggleTimer}
          >
            {isCompleted ? (
              <RotateCcw className="w-4 h-4" />
            ) : isActive ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>

          {(isActive || isCompleted || timeLeft !== totalTime) && (
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full text-white hover:bg-white/20"
              onClick={resetTimer}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  </div>
  )
}

function Footer() {
  return (
    <footer className="relative z-10 w-full p-6 md:p-8 mt-12 border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div className="max-w-xl space-y-2">
          <p className="font-medium text-foreground"> Prenez soin de vous 🧘‍♂️ </p>
          <p>
            Ce projet vise à sensibiliser aux enjeux de la santé au travail. En rendant la pratique du yoga accessible,
            nous levons les freins à la pratique et favorisons le bien-être durable des collaborateurs.
          </p>
        </div>
        <div className="text-xs opacity-50">© {new Date().getFullYear()} Pause QVT</div>
      </div>
    </footer>
  )
}
