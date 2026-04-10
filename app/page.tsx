"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Heart, CheckCircle2, Headphones,
  Play, Pause, RotateCcw, ChevronRight, Sun, Home, Sparkles
} from "lucide-react"
import { EXERCISE_DATA, type ExerciseOption } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────
   DAILY POSES DATA
───────────────────────────────────────────── */
const DAILY_POSES = [
  {
    name: "La Montagne", sanskrit: "Tadasana",
    description: "Tenez-vous debout, pieds joints, bras le long du corps. Sentez l'ancrage de vos pieds dans le sol.",
    duration: "1–2 min", emoji: "🏔️", benefit: "Améliore la posture",
    color: "from-emerald-500/20 to-teal-500/20", accent: "text-emerald-600", style: "Hatha yoga",
  },
  {
    name: "L'Arbre", sanskrit: "Vrksasana",
    description: "Placez le pied droit sur la cuisse gauche. Joignez les mains devant le cœur.",
    duration: "30 sec chaque côté", emoji: "🌳", benefit: "Renforce la concentration",
    color: "from-green-500/20 to-lime-500/20", accent: "text-green-600", style: "Hatha yoga",
  },
  {
    name: "Le Chat-Vache", sanskrit: "Marjaryasana",
    description: "À quatre pattes, alternez dos rond (chat) et dos creux (vache) avec la respiration.",
    duration: "5–8 cycles", emoji: "🐱", benefit: "Libère les tensions du dos",
    color: "from-orange-500/20 to-amber-500/20", accent: "text-orange-600", style: "Vinyasa yoga",
  },
  {
    name: "Le Guerrier I", sanskrit: "Virabhadrasana I",
    description: "Grand pas en avant, genou fléchi. Bras levés vers le ciel.",
    duration: "30 sec chaque côté", emoji: "⚔️", benefit: "Renforce les jambes",
    color: "from-red-500/20 to-rose-500/20", accent: "text-red-600", style: "Vinyasa yoga",
  },
  {
    name: "L'Enfant", sanskrit: "Balasana",
    description: "À genoux, asseyez-vous sur les talons. Étendez les bras devant vous.",
    duration: "1–3 min", emoji: "🧒", benefit: "Lâcher-prise total",
    color: "from-purple-500/20 to-violet-500/20", accent: "text-purple-600", style: "Yin yoga",
  },
  {
    name: "Le Cobra", sanskrit: "Bhujangasana",
    description: "Allongé sur le ventre, relevez le buste en gardant les hanches au sol.",
    duration: "3–5 respirations", emoji: "🐍", benefit: "Ouvre la poitrine",
    color: "from-yellow-500/20 to-orange-500/20", accent: "text-yellow-600", style: "Yin yoga",
  },
  {
    name: "Le Cadavre", sanskrit: "Savasana",
    description: "Allongez-vous sur le dos, fermez les yeux. Laissez le sol vous porter.",
    duration: "5–10 min", emoji: "🌙", benefit: "Récupération profonde",
    color: "from-blue-500/20 to-indigo-500/20", accent: "text-blue-600", style: "Yin yoga",
  },
]

function getDailyPose() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return DAILY_POSES[dayOfYear % DAILY_POSES.length]
}

/* ─────────────────────────────────────────────
   8D SESSION LOGIC
───────────────────────────────────────────── */
const GUIDED_SCRIPT = [
  { t: 0,   text: "Installez votre casque. Fermez les yeux. Respirez.", pan: 0 },
  { t: 5,   text: "Sentez ma voix s'approcher par votre droite...", pan: 1 },
  { t: 10,  text: "Elle passe derrière vous... dans votre nuque...", pan: -0.8 },
  { t: 15,  text: "Et revient devant... inspirez avec moi.", pan: 0 },
  { t: 78,  text: "Ouvrez les yeux quand vous êtes prêt·e. 🙏", pan: 0 },
]

function use8DSession() {
  const lastSpokenLineRef = useRef<number>(-1)
  const ctxRef = useRef<AudioContext | null>(null)
  const pannerRef = useRef<StereoPannerNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const [running, setRunning] = useState(false)
  const [currentLine, setCurrentLine] = useState(-1)
  const [elapsed, setElapsed] = useState(0)
  const [audioError, setAudioError] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef(0)

  const stop = useCallback(() => {
    setRunning(false)
    setCurrentLine(-1)
    setElapsed(0)
    lastSpokenLineRef.current = -1
    if (intervalRef.current) clearInterval(intervalRef.current)
    oscillatorsRef.current.forEach(o => { try { o.stop() } catch {} })
    oscillatorsRef.current = []
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null }
    window.speechSynthesis?.cancel()
  }, [])

  const start = useCallback(() => {
    if (running) { stop(); return }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) { setAudioError(true); return }
      const ctx = new AudioCtx()
      ctxRef.current = ctx
      
      // Réactivation forcée pour les navigateurs (Interaction utilisateur requise)
      if (ctx.state === "suspended") ctx.resume()

      const master = ctx.createGain()
      master.gain.value = 0.08
      master.connect(ctx.destination)

      const panner = ctx.createStereoPanner()
      panner.connect(master)
      pannerRef.current = panner

      const createOsc = (freq: number, gainValue: number) => {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = freq
        g.gain.value = gainValue
        osc.connect(g)
        g.connect(pannerRef.current!)
        osc.start()
        return osc
      }

      oscillatorsRef.current = [
        createOsc(200, 1),
        createOsc(210, 1),
      ]

      startTimeRef.current = Date.now()
      setRunning(true)

      intervalRef.current = setInterval(() => {
        const el = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsed(el)

        let line = -1
        for (let i = GUIDED_SCRIPT.length - 1; i >= 0; i--) {
          if (el >= GUIDED_SCRIPT[i].t) { line = i; break }
        }

        if (line !== -1 && line !== lastSpokenLineRef.current) {
          lastSpokenLineRef.current = line
          setCurrentLine(line)
          const utterance = new SpeechSynthesisUtterance(GUIDED_SCRIPT[line].text)
          utterance.lang = "fr-FR"
          window.speechSynthesis.speak(utterance)
        }

        if (pannerRef.current && line >= 0) {
          pannerRef.current.pan.setTargetAtTime(GUIDED_SCRIPT[line].pan, ctx.currentTime, 0.5)
        }

        if (el >= GUIDED_SCRIPT[GUIDED_SCRIPT.length - 1].t + 5) stop()
      }, 500)
    } catch {
      setAudioError(true)
    }
  }, [running, stop])

  useEffect(() => () => stop(), [stop])

  const totalDuration = GUIDED_SCRIPT[GUIDED_SCRIPT.length - 1].t + 5
  return { running, start, stop, currentLine, progress: (elapsed / totalDuration) * 100, elapsed, totalDuration, audioError }
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
type View = "home" | "exercise" | "8d" | "posture"

export default function Home() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null)
  const [view, setView] = useState<View>("home")

  const goHome = () => setView("home")

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[80px]" />
      </div>

      {/* Header épuré (sans bouton de son) */}
      <header className="relative z-10 w-full px-5 pt-6 pb-3 flex justify-between items-center max-w-2xl mx-auto">
        <div className="flex items-center gap-2.5">
          {view !== "home" ? (
            <button onClick={goHome} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors min-h-[44px]">
              <div className="bg-secondary p-2 rounded-full"><ArrowLeft className="w-4 h-4" /></div>
              <span>Retour</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-xl text-primary"><Heart className="w-5 h-5" /></div>
              <span className="font-bold text-lg">Pause QVT</span>
            </div>
          )}
        </div>
      </header>

      {/* View Container */}
      <div className="flex-1 relative z-10 w-full max-w-2xl mx-auto px-5 pb-28">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <HomeView key="home" 
              onSelect={(ex) => { setSelectedExercise(ex); setView("exercise") }}
              onOpen8D={() => setView("8d")}
              onOpenPosture={() => setView("posture")}
            />
          )}
          {view === "exercise" && selectedExercise && <ExerciseView key="exercise" data={selectedExercise} onBack={goHome} />}
          {view === "8d" && <Session8DView key="8d" onBack={goHome} />}
          {view === "posture" && <PostureView key="posture" onBack={goHome} />}
        </AnimatePresence>
      </div>

      <BottomNav view={view} setView={setView} />
    </main>
  )
}

/* ─────────────────────────────────────────────
   SUB-VIEWS & COMPONENTS
───────────────────────────────────────────── */
function HomeView({ onSelect, onOpen8D, onOpenPosture }: any) {
  const dailyPose = getDailyPose()
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 py-4">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
          <Sparkles className="w-3 h-3 text-primary" /> Santé au travail
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Votre pause <span className="text-primary">bien-être.</span></h1>
        <p className="text-muted-foreground">Des exercices simples pour rester en forme au bureau.</p>
      </div>

      <DailyPoseCard pose={dailyPose} onClick={onOpenPosture} />

      <button onClick={onOpen8D} className="group relative flex items-center gap-4 p-5 rounded-2xl border bg-card hover:border-primary/50 transition-all text-left">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Headphones className="w-6 h-6" /></div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Séance Audio 8D</p>
          <p className="text-xs text-muted-foreground">Casque requis · 5 min · Immersion sonore</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      <div>
        <h2 className="text-lg font-bold mb-4">Choisissez votre pause</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EXERCISE_DATA.map((option) => (
            <button key={option.id} onClick={() => onSelect(option)} className="flex flex-col p-5 bg-card border rounded-2xl hover:border-primary/50 text-left transition-all">
              <span className="text-2xl mb-3">{option.id === "1min" ? "🌬️" : option.id === "3min" ? "🧘" : "🌿"}</span>
              <span className="font-bold text-xl">{option.durationLabel}</span>
              <p className="text-xs text-muted-foreground mt-1">{option.theme}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function DailyPoseCard({ pose, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("rounded-2xl border p-5 text-left w-full transition-all bg-gradient-to-br", pose.color)}>
      <div className="flex items-start gap-4">
        <span className="text-3xl">{pose.emoji}</span>
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Posture du jour</span>
          <h3 className="font-bold text-lg">{pose.name}</h3>
          <p className={cn("text-sm italic", pose.accent)}>{pose.sanskrit}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
      </div>
    </button>
  )
}

function BottomNav({ view, setView }: any) {
  const tabs = [
    { id: "home", label: "Accueil", icon: Home },
    { id: "posture", label: "Posture", icon: Sun },
    { id: "8d", label: "Audio 8D", icon: Headphones },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t safe-area-pb">
      <div className="flex max-w-2xl mx-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setView(tab.id)} className={cn("flex-1 flex flex-col items-center py-3 gap-1", view === tab.id ? "text-primary" : "text-muted-foreground")}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

/* Vues Posture, Exercice et 8D simplifiées pour l'espace */
function PostureView({ onBack }: any) {
  const pose = getDailyPose()
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 space-y-6">
      <h2 className="text-2xl font-bold">Posture du jour</h2>
      <div className={cn("rounded-3xl p-8 bg-gradient-to-br", pose.color)}>
        <span className="text-6xl block mb-4">{pose.emoji}</span>
        <h3 className="text-3xl font-bold">{pose.name}</h3>
        <p className="text-muted-foreground mt-4 leading-relaxed">{pose.description}</p>
        <div className="flex gap-3 mt-6">
          <span className="px-3 py-1 bg-white/50 rounded-full text-xs font-bold">⏱ {pose.duration}</span>
        </div>
      </div>
    </motion.div>
  )
}

function ExerciseView({ data, onBack }: any) {
  return (
    <motion.div initial={{ x: 20 }} animate={{ x: 0 }} className="py-4 space-y-6">
      <h2 className="text-2xl font-bold">{data.title}</h2>
      <div className="space-y-4">
        {data.exercises.map((ex: any, i: number) => (
          <div key={i} className="p-5 border rounded-2xl bg-card">
            <h3 className="font-bold text-primary mb-2">{i + 1}. {ex.title}</h3>
            <p className="text-sm text-muted-foreground">{ex.instructions[0]}</p>
          </div>
        ))}
      </div>
      <Button onClick={onBack} className="w-full h-12 rounded-full">Terminer</Button>
    </motion.div>
  )
}

function Session8DView({ onBack }: any) {
  const s = use8DSession()
  return (
    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="py-4 space-y-6">
      <div className="text-center p-10 bg-indigo-950 rounded-3xl text-white">
        <Headphones className={cn("w-16 h-16 mx-auto mb-6 transition-all", s.running && "animate-pulse")} />
        <p className="text-sm opacity-70 mb-2">{s.running ? "Séance en cours..." : "Prêt pour l'immersion ?"}</p>
        <h3 className="text-xl font-bold min-h-[3rem]">{s.currentLine >= 0 ? GUIDED_SCRIPT[s.currentLine].text : "---"}</h3>
      </div>
      <Button onClick={s.start} className="w-full h-14 rounded-full text-lg" variant={s.running ? "destructive" : "default"}>
        {s.running ? "Arrêter" : "Démarrer la séance 8D"}
      </Button>
    </motion.div>
  )
}