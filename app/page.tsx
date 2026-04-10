"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Heart, CheckCircle2, Wind, Activity, Timer,
  Play, Pause, RotateCcw, Volume2, VolumeX, Music, Headphones,
  Waves, CloudRain, Bell, ChevronRight, Sun, Home, Sparkles
} from "lucide-react"
import { EXERCISE_DATA, type ExerciseOption } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────
   DAILY POSE
───────────────────────────────────────────── */
const DAILY_POSES = [
  {
    name: "La Montagne", sanskrit: "Tadasana",
    description: "Tenez-vous debout, pieds joints, bras le long du corps. Sentez l'ancrage de vos pieds dans le sol. Respirez profondément.",
    duration: "1–2 min", emoji: "🏔️", benefit: "Améliore la posture et l'équilibre",
    color: "from-emerald-500/20 to-teal-500/20", accent: "text-emerald-600", style: "Hatha yoga",
  },
  {
    name: "L'Arbre", sanskrit: "Vrksasana",
    description: "Placez le pied droit sur la cuisse gauche. Joignez les mains devant le cœur. Trouvez un point fixe du regard.",
    duration: "30 sec chaque côté", emoji: "🌳", benefit: "Renforce la concentration et l'équilibre",
    color: "from-green-500/20 to-lime-500/20", accent: "text-green-600", style: "Hatha yoga",
  },
  {
    name: "Le Chat-Vache", sanskrit: "Marjaryasana",
    description: "À quatre pattes, alternez dos rond (chat) et dos creux (vache) en synchronisant avec la respiration.",
    duration: "5–8 cycles", emoji: "🐱", benefit: "Libère les tensions dans le dos",
    color: "from-orange-500/20 to-amber-500/20", accent: "text-orange-600", style: "Vinyasa yoga",
  },
  {
    name: "Le Guerrier I", sanskrit: "Virabhadrasana I",
    description: "Grand pas en avant, genou fléchi à 90°. Bras levés vers le ciel, regard vers l'horizon.",
    duration: "30 sec chaque côté", emoji: "⚔️", benefit: "Renforce les jambes et ouvre le cœur",
    color: "from-red-500/20 to-rose-500/20", accent: "text-red-600", style: "Vinyasa yoga",
  },
  {
    name: "L'Enfant", sanskrit: "Balasana",
    description: "À genoux, asseyez-vous sur les talons. Étendez les bras devant vous et posez le front sur le sol.",
    duration: "1–3 min", emoji: "🧒", benefit: "Restauration et lâcher-prise",
    color: "from-purple-500/20 to-violet-500/20", accent: "text-purple-600", style: "Yin yoga",
  },
  {
    name: "Le Cobra", sanskrit: "Bhujangasana",
    description: "Allongé sur le ventre, mains sous les épaules. Relevez le buste en gardant les hanches au sol.",
    duration: "3–5 respirations", emoji: "🐍", benefit: "Ouvre la poitrine et renforce le dos",
    color: "from-yellow-500/20 to-orange-500/20", accent: "text-yellow-600", style: "Yin yoga",
  },
  {
    name: "Le Cadavre", sanskrit: "Savasana",
    description: "Allongez-vous sur le dos, bras légèrement écartés. Fermez les yeux. Laissez le sol vous porter.",
    duration: "5–10 min", emoji: "🌙", benefit: "Intégration et récupération profonde",
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
   AMBIENT SOUNDS
───────────────────────────────────────────── */
type SoundType = "rain" | "waves" | "bowls" | null

function useAmbientSound() {
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ gain: GainNode; sources: AudioNode[] } | null>(null)
  const [active, setActive] = useState<SoundType>(null)
  const [volume, setVolumeState] = useState(0.5)
  const volRef = useRef(0.5)
  const [audioSupported, setAudioSupported] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) setAudioSupported(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (nodesRef.current) {
      try { nodesRef.current.gain.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.3) } catch {}
      setTimeout(() => {
        nodesRef.current?.sources.forEach(s => { try { (s as AudioBufferSourceNode).stop?.() } catch {} })
        nodesRef.current = null
      }, 400)
    }
    setActive(null)
  }, [])

  const play = useCallback((type: SoundType) => {
    if (!type) { stop(); return }
    if (active === type) { stop(); return }
    if (nodesRef.current) {
      try { nodesRef.current.gain.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.1) } catch {}
      setTimeout(() => {
        nodesRef.current?.sources.forEach(s => { try { (s as AudioBufferSourceNode).stop?.() } catch {} })
        nodesRef.current = null
        startSound(type)
      }, 200)
    } else {
      startSound(type)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const startSound = useCallback((type: SoundType) => {
    if (!type) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new AudioCtx()
      }
      const ctx = ctxRef.current
      if (ctx.state === "suspended") ctx.resume()

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0, ctx.currentTime)
      masterGain.gain.setTargetAtTime(volRef.current, ctx.currentTime, 0.5)
      masterGain.connect(ctx.destination)

      const sources: AudioNode[] = []

      if (type === "rain") {
        const bufSize = ctx.sampleRate * 4
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
        const noise = ctx.createBufferSource()
        noise.buffer = buf
        noise.loop = true
        const filter = ctx.createBiquadFilter()
        filter.type = "bandpass"
        filter.frequency.value = 1000
        filter.Q.value = 0.3
        noise.connect(filter)
        filter.connect(masterGain)
        noise.start()
        sources.push(noise)
        const drip = () => {
          if (!nodesRef.current) return
          const osc = ctx.createOscillator()
          const g = ctx.createGain()
          osc.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1)
          g.gain.setValueAtTime(0.05, ctx.currentTime)
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
          osc.connect(g); g.connect(masterGain)
          osc.start(); osc.stop(ctx.currentTime + 0.1)
          setTimeout(drip, 200 + Math.random() * 800)
        }
        setTimeout(drip, 500)
      }

      if (type === "waves") {
        const bufSize = ctx.sampleRate * 8
        const buf = ctx.createBuffer(2, bufSize, ctx.sampleRate)
        for (let c = 0; c < 2; c++) {
          const data = buf.getChannelData(c)
          for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
        }
        const noise = ctx.createBufferSource()
        noise.buffer = buf
        noise.loop = true
        const lowpass = ctx.createBiquadFilter()
        lowpass.type = "lowpass"
        lowpass.frequency.value = 400
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.value = 0.15
        lfoGain.gain.value = 150
        lfo.connect(lfoGain)
        lfoGain.connect(lowpass.frequency)
        lfo.start()
        noise.connect(lowpass)
        lowpass.connect(masterGain)
        noise.start()
        sources.push(noise, lfo)
      }

      if (type === "bowls") {
        const freqs = [432, 528, 639, 741, 852]
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const oscGain = ctx.createGain()
          osc.type = "sine"
          osc.frequency.value = freq
          oscGain.gain.value = 0.08 / (i + 1)
          const trem = ctx.createOscillator()
          const tremGain = ctx.createGain()
          trem.frequency.value = 0.5 + i * 0.1
          tremGain.gain.value = 0.02
          trem.connect(tremGain)
          tremGain.connect(oscGain.gain)
          trem.start()
          osc.connect(oscGain)
          oscGain.connect(masterGain)
          osc.start()
          sources.push(osc, trem)
        })
      }

      nodesRef.current = { gain: masterGain, sources }
      setActive(type)
    } catch {
      setAudioSupported(false)
    }
  }, [])

  const setVolume = useCallback((v: number) => {
    volRef.current = v
    setVolumeState(v)
    if (nodesRef.current && ctxRef.current) {
      nodesRef.current.gain.gain.setTargetAtTime(v, ctxRef.current.currentTime, 0.1)
    }
  }, [])

  useEffect(() => () => { stop() }, [stop])

  return { active, play, stop, volume, setVolume, audioSupported }
}

/* ─────────────────────────────────────────────
   8D SESSION
───────────────────────────────────────────── */
const GUIDED_SCRIPT = [
  { t: 0,   text: "Installez votre casque. Fermez les yeux. Respirez.",           pan: 0 },
  { t: 5,   text: "Sentez ma voix s'approcher par votre droite...",                pan: 1 },
  { t: 10,  text: "Elle passe derrière vous... dans votre nuque...",               pan: -0.8 },
  { t: 15,  text: "Et revient devant... inspirez avec moi. 1... 2... 3... 4...",  pan: 0 },
  { t: 22,  text: "Bloquez... 1... 2... 3... 4...",                               pan: 0 },
  { t: 28,  text: "Expirez lentement... laissez partir la tension...",            pan: -0.4 },
  { t: 35,  text: "Levez les bras... sentez-les s'élever de chaque côté...",      pan: 0 },
  { t: 42,  text: "La chaleur descend le long de votre colonne.",                 pan: 0.3 },
  { t: 49,  text: "Tournez doucement la tête à droite...",                         pan: 0.9 },
  { t: 55,  text: "Puis à gauche... le son suit votre mouvement...",              pan: -0.9 },
  { t: 62,  text: "Revenez au centre. Vous êtes ancré·e. Présent·e.",            pan: 0 },
  { t: 70,  text: "Une dernière respiration... profonde... complète...",          pan: 0 },
  { t: 78,  text: "Ouvrez les yeux quand vous êtes prêt·e. 🙏",                  pan: 0 },
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

      const master = ctx.createGain()
      master.gain.value = 0.08
      master.connect(ctx.destination)

      const panner = ctx.createStereoPanner()
      panner.connect(master)
      pannerRef.current = panner

      const baseFreq = 200
      const beatFreq = 10

      const createOsc = (freq: number, gainValue: number) => {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = freq
        g.gain.value = gainValue
        osc.connect(g)
        g.connect(pannerRef.current!)
        pannerRef.current!.connect(master)
        osc.start()
        return osc
      }

      oscillatorsRef.current = [
        createOsc(baseFreq, 1),
        createOsc(baseFreq + beatFreq, 1),
        createOsc(432, 0.3),
        createOsc(216, 0.15),
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
          utterance.rate = 0.9
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(utterance)
        }

        if (pannerRef.current && line >= 0) {
          const target = GUIDED_SCRIPT[line].pan
          pannerRef.current.pan.setTargetAtTime(target, ctx.currentTime, 0.5)
        }

        const lastT = GUIDED_SCRIPT[GUIDED_SCRIPT.length - 1].t + 8
        if (el >= lastT) stop()
      }, 500)
    } catch {
      setAudioError(true)
    }
  }, [running, stop])

  useEffect(() => () => stop(), [stop])

  const totalDuration = GUIDED_SCRIPT[GUIDED_SCRIPT.length - 1].t + 8
  const progress = Math.min((elapsed / totalDuration) * 100, 100)

  return { running, start, stop, currentLine, progress, elapsed, totalDuration, audioError }
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
type View = "home" | "exercise" | "8d" | "posture"

export default function Home() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null)
  const [view, setView] = useState<View>("home")
  const ambient = useAmbientSound()

  const goHome = () => setView("home")

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-5 pt-5 pb-3 flex justify-between items-center max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          {view !== "home" ? (
            <button
              onClick={goHome}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Retour à l'accueil"
            >
              <div className="bg-secondary p-2 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">Retour</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Pause QVT</span>
            </div>
          )}
        </div>
        <AmbientPlayer ambient={ambient} />
      </header>

      {/* Audio non supporté — feedback erreur (Scapin & Bastien : gestion des erreurs) */}
      {!ambient.audioSupported && (
        <div className="relative z-10 mx-5 mb-2 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <span>⚠️</span>
            <span>Les sons d'ambiance ne sont pas disponibles sur ce navigateur.</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 relative z-10 w-full max-w-2xl mx-auto px-5 pb-28 flex flex-col">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <HomeView
              key="home"
              onSelect={(ex) => { setSelectedExercise(ex); setView("exercise") }}
              onOpen8D={() => setView("8d")}
              onOpenPosture={() => setView("posture")}
            />
          )}
          {view === "exercise" && selectedExercise && (
            <ExerciseView key="exercise" data={selectedExercise} onBack={goHome} />
          )}
          {view === "8d" && (
            <Session8DView key="8d" onBack={goHome} />
          )}
          {view === "posture" && (
            <PostureView key="posture" onBack={goHome} />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar — Guidage (Scapin & Bastien critère 1) */}
      <BottomNav view={view} setView={setView} />
    </main>
  )
}

/* ─────────────────────────────────────────────
   BOTTOM NAV — Guidage + touch targets 44px min
───────────────────────────────────────────── */
function BottomNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const tabs = [
    { id: "home" as View, label: "Accueil", icon: Home },
    { id: "posture" as View, label: "Posture", icon: Sun },
    { id: "8d" as View, label: "Séance 8D", icon: Headphones },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-pb">
      <div className="flex max-w-2xl mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cn(
              // Touch target minimum 44px (Scapin & Bastien : compatibilité mobile)
              "flex-1 flex flex-col items-center justify-center gap-1 min-h-[64px] py-3 transition-all duration-200",
              view === id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={label}
            aria-current={view === id ? "page" : undefined}
          >
            <div className={cn(
              "p-1.5 rounded-xl transition-all duration-200",
              view === id && "bg-primary/10"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">{label}</span>
            {/* Indicateur actif */}
            {view === id && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute top-0 h-0.5 w-12 bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────
   AMBIENT PLAYER
───────────────────────────────────────────── */
function AmbientPlayer({ ambient }: { ambient: ReturnType<typeof useAmbientSound> }) {
  const [open, setOpen] = useState(false)
  const sounds: { id: SoundType; label: string; icon: React.ReactNode }[] = [
    { id: "rain", label: "Pluie", icon: <CloudRain className="w-4 h-4" /> },
    { id: "waves", label: "Vagues", icon: <Waves className="w-4 h-4" /> },
    { id: "bowls", label: "Bols", icon: <Bell className="w-4 h-4" /> },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Sons d'ambiance"
        aria-expanded={open}
        className={cn(
          // Touch target 44px min
          "flex items-center gap-2 px-3 min-h-[44px] rounded-full border text-sm font-medium transition-all duration-200",
          ambient.active
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background/80 backdrop-blur border-border hover:border-primary/50"
        )}
      >
        <Music className="w-4 h-4" />
        <span className="hidden sm:inline">{ambient.active ? sounds.find(s => s.id === ambient.active)?.label ?? "Ambiance" : "Ambiance"}</span>
        {ambient.active && (
          <span className="flex gap-0.5 items-end h-3">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1 bg-current rounded-full animate-bounce" style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }} />
            ))}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-56 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl p-3 z-50"
          >
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Sons d'ambiance</p>
            <div className="space-y-1">
              {sounds.map(s => (
                <button
                  key={s.id}
                  onClick={() => { ambient.play(s.id); setOpen(false) }}
                  className={cn(
                    // Touch target 44px min
                    "w-full flex items-center gap-2.5 px-3 min-h-[44px] rounded-xl text-sm transition-all",
                    ambient.active === s.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {s.icon}
                  {s.label}
                  {ambient.active === s.id && (
                    <span className="ml-auto text-xs text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 px-1">
              <div className="flex items-center gap-2">
                <VolumeX className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={ambient.volume}
                  onChange={e => ambient.setVolume(Number(e.target.value))}
                  className="flex-1 h-1.5 accent-primary rounded-full"
                  aria-label="Volume"
                />
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────
   HOME VIEW
───────────────────────────────────────────── */
function HomeView({
  onSelect, onOpen8D, onOpenPosture
}: {
  onSelect: (o: ExerciseOption) => void
  onOpen8D: () => void
  onOpenPosture: () => void
}) {
  const dailyPose = getDailyPose()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 py-4"
    >
      {/* Hero — charge allégée (Scapin & Bastien : charge de travail) */}
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
        >
          <Sparkles className="w-3 h-3 text-primary" />
          Santé au travail
        </motion.div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Votre pause<br />
          <span className="text-primary">bien-être.</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Sans changer de tenue. Intégré à votre journée.
        </p>
      </div>

      {/* Posture du jour — cliquable avec feedback visuel */}
      <DailyPoseCard pose={dailyPose} onClick={onOpenPosture} />

      {/* Séance 8D */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={onOpen8D}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden flex items-center gap-4 p-5 rounded-2xl border border-border bg-white dark:bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left min-h-[72px]"
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Headphones className="w-6 h-6" />
        </div>
        <div className="text-left flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground text-sm">Séance Audio 8D</p>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">🎧 Casque requis</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Son binaural · 5 min · Voix guidée 3D</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </motion.button>

      {/* Cartes exercices — titre simplifié */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Choisissez votre pause</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EXERCISE_DATA.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 + 0.3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(option)}
              // Touch target min 44px + feedback visuel au tap (Scapin & Bastien)
              className="group relative flex flex-col p-5 min-h-[140px] bg-white dark:bg-card border border-border rounded-2xl hover:shadow-md transition-all duration-200 hover:border-primary/50 text-left active:scale-[0.98]"
            >
              {option.id === "5min" && (
                <span className="absolute top-3 right-3 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Yin
                </span>
              )}
              <div className={cn(
                "w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-xl",
                option.id === "1min" ? "bg-orange-50" :
                option.id === "3min" ? "bg-blue-50" : "bg-green-50"
              )}>
                {option.id === "1min" ? "🌬️" : option.id === "3min" ? "🧘" : "🌿"}
              </div>
              <span className="font-bold text-xl">{option.durationLabel}</span>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{option.theme}</p>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{option.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   DAILY POSE CARD
───────────────────────────────────────────── */
function DailyPoseCard({ pose, onClick }: { pose: typeof DAILY_POSES[0]; onClick?: () => void }) {
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-5 text-left w-full min-h-[100px] transition-all duration-200 hover:shadow-md",
        pose.color
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{pose.emoji}</div>
        <div className="flex-1 min-w-0">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
            <Sun className="w-3 h-3" />
            Posture du jour · {today}
          </span>
          <h3 className="font-bold text-lg leading-tight">{pose.name}</h3>
          <p className={cn("text-sm font-medium italic", pose.accent)}>{pose.sanskrit}</p>
          {pose.style && (
            <span className="inline-block mt-1.5 text-xs bg-background/70 rounded-full px-2.5 py-0.5 font-medium text-muted-foreground">
              {pose.style}
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </motion.button>
  )
}

/* ─────────────────────────────────────────────
   POSTURE VIEW (nouvelle vue dédiée)
───────────────────────────────────────────── */
function PostureView({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24)) % DAILY_POSES.length
  })

  const pose = DAILY_POSES[current]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-6 py-4"
    >
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Postures</p>
        <h2 className="text-2xl font-bold">Posture du jour</h2>
      </div>

      {/* Carte principale */}
      <div className={cn("rounded-2xl p-6 bg-gradient-to-br", pose.color)}>
        <div className="text-5xl mb-4">{pose.emoji}</div>
        <h3 className="text-2xl font-bold mb-1">{pose.name}</h3>
        <p className={cn("text-base font-medium italic mb-4", pose.accent)}>{pose.sanskrit}</p>
        {pose.style && (
          <span className="inline-block text-xs bg-background/70 rounded-full px-3 py-1 font-medium text-muted-foreground mb-4">
            {pose.style}
          </span>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed">{pose.description}</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="text-xs bg-background/70 rounded-full px-3 py-1">⏱ {pose.duration}</span>
          <span className="text-xs bg-background/70 rounded-full px-3 py-1">✨ {pose.benefit}</span>
        </div>
      </div>

      {/* Navigation entre postures — touch targets 44px */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-3">Toutes les postures</p>
        <div className="grid grid-cols-2 gap-3">
          {DAILY_POSES.map((p, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "flex items-center gap-3 p-3 min-h-[56px] rounded-xl border transition-all duration-200 text-left",
                i === current
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-white dark:bg-card hover:border-primary/30"
              )}
            >
              <span className="text-xl">{p.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.sanskrit}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   EXERCISE VIEW
───────────────────────────────────────────── */
function ExerciseView({ data, onBack }: { data: ExerciseOption; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full py-4 gap-6"
    >
      <div className="space-y-2">
        <span className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
          data.id === "1min" ? "bg-orange-100 text-orange-700" :
          data.id === "3min" ? "bg-blue-100 text-blue-700" :
          "bg-green-100 text-green-700"
        )}>
          {data.durationLabel} · {data.theme}
        </span>
        <h2 className="text-2xl font-bold">{data.title}</h2>
        <p className="text-muted-foreground">{data.description}</p>
      </div>

      {/* Timer visible en haut sur mobile */}
      <ExerciseTimer durationId={data.id} />

      <div className="space-y-3">
        {data.exercises.map((ex, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-card p-5 rounded-2xl border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-primary/10 text-primary w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                {i + 1}
              </div>
              <div className="space-y-2 flex-1">
                <div>
                  <h3 className="font-semibold">{ex.title}</h3>
                  <p className="text-xs text-primary/80 font-medium mt-0.5">{ex.what}</p>
                </div>
                <ul className="space-y-1.5">
                  {ex.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-muted-foreground/40 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bouton fin de séance — touch target 44px */}
      <Button
        onClick={onBack}
        size="lg"
        className="w-full rounded-full min-h-[52px] text-base"
      >
        Terminer la pause ✓
      </Button>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   EXERCISE TIMER
───────────────────────────────────────────── */
function ExerciseTimer({ durationId }: { durationId: string }) {
  const durationMap: Record<string, number> = { "1min": 60, "3min": 180, "5min": 300 }
  const totalTime = durationMap[durationId] || 60
  const [timeLeft, setTimeLeft] = useState(totalTime)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0) {
      setIsActive(false); setIsCompleted(true)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const toggle = () => {
    if (isCompleted) { setTimeLeft(totalTime); setIsCompleted(false); setIsActive(true) }
    else setIsActive(a => !a)
  }
  const reset = () => { setIsActive(false); setIsCompleted(false); setTimeLeft(totalTime) }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const circumference = 2 * Math.PI * 40

  return (
    <div className="bg-white dark:bg-card border border-border rounded-2xl p-5">
      {/* Feedback état — Scapin & Bastien : feedback immédiat */}
      <p className="text-xs text-muted-foreground font-medium mb-4 text-center">
        {isCompleted ? "✅ Bravo ! Séance terminée" : isActive ? "⏳ Séance en cours..." : "Démarrez le minuteur"}
      </p>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90">
            <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
            <circle
              cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4"
              className={cn("transition-all duration-1000", isCompleted ? "text-green-500" : "text-primary")}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono font-bold text-lg tabular-nums">
              {mins}:{String(secs).padStart(2, "0")}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          {/* Touch targets 44px min */}
          <button
            onClick={toggle}
            aria-label={isActive ? "Pause" : "Démarrer"}
            className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95"
          >
            {isCompleted ? <RotateCcw className="w-5 h-5" /> : isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          {(isActive || isCompleted || timeLeft !== totalTime) && (
            <button
              onClick={reset}
              aria-label="Réinitialiser"
              className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   8D SESSION VIEW
───────────────────────────────────────────── */
function Session8DView({ onBack }: { onBack: () => void }) {
  const session = use8DSession()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col w-full py-4 gap-6"
    >
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Audio immersif</p>
        <h2 className="text-2xl font-bold">Séance 8D Binaural</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Le son binaural crée une rotation spatiale autour de votre tête.
        </p>
      </div>

      {/* Message erreur audio — Scapin & Bastien : gestion des erreurs */}
      {session.audioError && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <span className="mt-0.5">⚠️</span>
          <div>
            <p className="font-medium">Audio non disponible</p>
            <p className="text-xs mt-0.5">Votre navigateur ne supporte pas l'API Audio nécessaire pour cette séance. Essayez sur Chrome ou Safari.</p>
          </div>
        </div>
      )}

      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm w-fit">
        🎧 Casque stéréo requis pour l'effet 8D
      </div>

      {/* Visualizer */}
      <div className={cn(
        "relative rounded-3xl overflow-hidden transition-all duration-1000",
        session.running
          ? "bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900"
          : "bg-muted"
      )}>
        <div className="p-8">
          <div className="relative flex items-center justify-center h-32">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={cn(
                  "absolute rounded-full border transition-all duration-500",
                  session.running ? "border-white/20 animate-ping" : "border-muted-foreground/20"
                )}
                style={{ width: `${50 + i * 25}px`, height: `${50 + i * 25}px`, animationDelay: `${i * 0.4}s`, animationDuration: "2s" }}
              />
            ))}
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500",
              session.running ? "bg-white/20 text-white" : "bg-background text-muted-foreground"
            )}>
              <Headphones className="w-6 h-6" />
            </div>
          </div>

          <div className="min-h-14 flex items-center justify-center text-center mt-2">
            <AnimatePresence mode="wait">
              {session.currentLine >= 0 ? (
                <motion.p
                  key={session.currentLine}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={cn("text-sm font-medium leading-relaxed", session.running ? "text-white" : "text-foreground")}
                >
                  {GUIDED_SCRIPT[session.currentLine].text}
                </motion.p>
              ) : session.running ? (
                <p className="text-white/60 text-sm">Préparation...</p>
              ) : null}
            </AnimatePresence>
          </div>

          {session.running && (
            <div className="mt-4">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div className="h-full bg-white rounded-full" animate={{ width: `${session.progress}%` }} transition={{ duration: 0.5 }} />
              </div>
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>{Math.floor(session.elapsed / 60)}:{String(session.elapsed % 60).padStart(2, "0")}</span>
                <span>{Math.floor(session.totalDuration / 60)}:{String(session.totalDuration % 60).padStart(2, "0")}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton principal — touch target 52px */}
      <button
        onClick={session.start}
        disabled={session.audioError}
        className={cn(
          "flex items-center justify-center gap-2 w-full min-h-[52px] rounded-full text-base font-medium transition-all active:scale-[0.98]",
          session.running
            ? "bg-destructive text-white hover:bg-destructive/90"
            : session.audioError
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {session.running ? (
          <><Pause className="w-5 h-5" /> Arrêter la séance</>
        ) : (
          <><Play className="w-5 h-5" /> Démarrer la séance 8D</>
        )}
      </button>

      {/* Script */}
      <div className="bg-muted/50 rounded-2xl p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Programme</p>
        <div className="space-y-2">
          {GUIDED_SCRIPT.map((line, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 text-sm transition-all duration-300",
                session.currentLine === i ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              <span className="flex-shrink-0 w-8 text-xs text-muted-foreground/60 pt-0.5 font-mono">
                {Math.floor(line.t / 60)}:{String(line.t % 60).padStart(2, "0")}
              </span>
              <span className={cn(session.currentLine === i && "text-primary")}>{line.text}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}