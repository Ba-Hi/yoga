"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, ArrowLeft, Heart, CheckCircle2, Wind, Activity, Timer,
  Play, Pause, RotateCcw, Volume2, VolumeX, Music, Headphones,
  Waves, CloudRain, Bell, ChevronLeft, ChevronRight, Sparkles, Sun
} from "lucide-react"
import { EXERCISE_DATA, type ExerciseOption } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────
   DAILY POSE — deterministic by day-of-year
───────────────────────────────────────────── */
const DAILY_POSES = [
  {
    name: "La Montagne",
    sanskrit: "Tadasana",
    description: "Tenez-vous debout, pieds joints, bras le long du corps. Sentez l'ancrage de vos pieds dans le sol. Respirez profondément.",
    duration: "1–2 min",
    emoji: "🏔️",
    benefit: "Améliore la posture et l'équilibre",
    color: "from-emerald-500/20 to-teal-500/20",
    accent: "text-emerald-600",
  },
  {
    name: "L'Arbre",
    sanskrit: "Vrksasana",
    description: "Placez le pied droit sur la cuisse gauche. Joignez les mains devant le cœur. Trouvez un point fixe du regard.",
    duration: "30 sec chaque côté",
    emoji: "🌳",
    benefit: "Renforce la concentration et l'équilibre",
    color: "from-green-500/20 to-lime-500/20",
    accent: "text-green-600",
  },
  {
    name: "Le Chat-Vache",
    sanskrit: "Marjaryasana",
    description: "À quatre pattes, alternez dos rond (chat) et dos creux (vache) en synchronisant avec la respiration.",
    duration: "5–8 cycles",
    emoji: "🐱",
    benefit: "Libère les tensions dans le dos",
    color: "from-orange-500/20 to-amber-500/20",
    accent: "text-orange-600",
  },
  {
    name: "Le Guerrier I",
    sanskrit: "Virabhadrasana I",
    description: "Grand pas en avant, genou fléchi à 90°. Bras levés vers le ciel, regard vers l'horizon.",
    duration: "30 sec chaque côté",
    emoji: "⚔️",
    benefit: "Renforce les jambes et ouvre le cœur",
    color: "from-red-500/20 to-rose-500/20",
    accent: "text-red-600",
  },
  {
    name: "L'Enfant",
    sanskrit: "Balasana",
    description: "À genoux, asseyez-vous sur les talons. Étendez les bras devant vous et posez le front sur le sol.",
    duration: "1–3 min",
    emoji: "🧒",
    benefit: "Restauration et lâcher-prise",
    color: "from-purple-500/20 to-violet-500/20",
    accent: "text-purple-600",
  },
  {
    name: "Le Cobra",
    sanskrit: "Bhujangasana",
    description: "Allongé sur le ventre, mains sous les épaules. Relevez le buste en gardant les hanches au sol.",
    duration: "3–5 respirations",
    emoji: "🐍",
    benefit: "Ouvre la poitrine et renforce le dos",
    color: "from-yellow-500/20 to-orange-500/20",
    accent: "text-yellow-600",
  },
  {
    name: "Le Cadavre",
    sanskrit: "Savasana",
    description: "Allongez-vous sur le dos, bras légèrement écartés. Fermez les yeux. Laissez le sol vous porter.",
    duration: "5–10 min",
    emoji: "🌙",
    benefit: "Intégration et récupération profonde",
    color: "from-blue-500/20 to-indigo-500/20",
    accent: "text-blue-600",
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
   AMBIENT SOUNDS — generated via Web Audio API
───────────────────────────────────────────── */
type SoundType = "rain" | "waves" | "bowls" | null

function useAmbientSound() {
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ gain: GainNode; sources: AudioNode[] } | null>(null)
  const [active, setActive] = useState<SoundType>(null)
  const [volume, setVolumeState] = useState(0.5)
  const volRef = useRef(0.5)

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
      // White noise buffer
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
      // Occasional drips
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
      // Low-pass for ocean rumble
      const lowpass = ctx.createBiquadFilter()
      lowpass.type = "lowpass"
      lowpass.frequency.value = 400
      // LFO for wave motion
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
      // Singing bowls: layered harmonics at 432Hz
      const freqs = [432, 528, 639, 741, 852]
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const oscGain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = freq
        oscGain.gain.value = 0.08 / (i + 1)
        // Slow tremolo
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
  }, [])

  const setVolume = useCallback((v: number) => {
    volRef.current = v
    setVolumeState(v)
    if (nodesRef.current && ctxRef.current) {
      nodesRef.current.gain.gain.setTargetAtTime(v, ctxRef.current.currentTime, 0.1)
    }
  }, [])

  // Cleanup
  useEffect(() => () => { stop() }, [stop])

  return { active, play, stop, volume, setVolume }
}

/* ─────────────────────────────────────────────
   8D AUDIO SESSION — binaural beats + spatial panning
   (user needs headphones)
───────────────────────────────────────────── */
const GUIDED_SCRIPT = [
  { t: 0,   text: "Installez votre casque. Fermez les yeux. Respirez.",            pan: 0 },
  { t: 5,   text: "Sentez ma voix s'approcher par votre droite...",                 pan: 1 },
  { t: 10,  text: "Elle passe derrière vous... dans votre nuque...",                pan: -0.8 },
  { t: 15,  text: "Et revient devant... inspirez avec moi. 1... 2... 3... 4...",   pan: 0 },
  { t: 22,  text: "Bloquez... 1... 2... 3... 4...",                                pan: 0 },
  { t: 28,  text: "Expirez lentement... laissez partir la tension...",             pan: -0.4 },
  { t: 35,  text: "Levez les bras... sentez-les s'élever de chaque côté...",       pan: 0 },
  { t: 42,  text: "La chaleur descend le long de votre colonne.",                  pan: 0.3 },
  { t: 49,  text: "Tournez doucement la tête à droite...",                          pan: 0.9 },
  { t: 55,  text: "Puis à gauche... le son suit votre mouvement...",               pan: -0.9 },
  { t: 62,  text: "Revenez au centre. Vous êtes ancré·e. Présent·e.",             pan: 0 },
  { t: 70,  text: "Une dernière respiration... profonde... complète...",           pan: 0 },
  { t: 78,  text: "Ouvrez les yeux quand vous êtes prêt·e. 🙏",                   pan: 0 },
]

function speak(text: string) {
  // On annule les voix en cours pour éviter les chevauchements
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = 0.9; // Un peu plus lent pour le côté zen
  utterance.pitch = 1.1; // Une voix légèrement plus douce
  window.speechSynthesis.speak(utterance);
}

function use8DSession() {
  const lastSpokenLineRef = useRef<number>(-1);
  const ctxRef = useRef<AudioContext | null>(null)
  const pannerRef = useRef<StereoPannerNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const [running, setRunning] = useState(false)
  const [currentLine, setCurrentLine] = useState(-1)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef(0)

  const stop = useCallback(() => {
    setRunning(false)
    setCurrentLine(-1)
    setElapsed(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
    oscillatorsRef.current.forEach(o => { try { o.stop() } catch {} })
    oscillatorsRef.current = []
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null }
  }, [])

  const start = useCallback(() => {
    if (running) { stop(); return }
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioCtx()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.value = 0.08
    master.connect(ctx.destination)

    const panner = ctx.createStereoPanner()
    panner.connect(master)
    pannerRef.current = panner

    // Binaural beat: 40Hz gamma base + 10Hz alpha difference
    const baseFreq = 200
    const beatFreq = 10

    const createOsc = (freq: number, pan: number, gainValue: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.value = gainValue;


      osc.connect(g);
      g.connect(pannerRef.current!); // On passe par le panner ici
      pannerRef.current!.connect(master);
      
      osc.start();
      return osc;
    };

    // Left ear: base | Right ear: base + beat diff (binaural beat)
    oscillatorsRef.current = [
      createOsc(baseFreq, -1, 1),
      createOsc(baseFreq + beatFreq, 1, 1),
      // Ambient drone
      createOsc(432, 0, 0.3),
      createOsc(216, 0, 0.15),
    ]

    // Rotating pan for 8D effect
    startTimeRef.current = Date.now()
    setRunning(true)

    intervalRef.current = setInterval(() => {
      const el = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsed(el)

      // Find current script line
      let line = -1
      for (let i = GUIDED_SCRIPT.length - 1; i >= 0; i--) {
        if (el >= GUIDED_SCRIPT[i].t) { line = i; break }
      }

      if (line !== -1 && line !== lastSpokenLineRef.current) {
        lastSpokenLineRef.current = line; // On marque la ligne comme lue immédiatement
        setCurrentLine(line);
        
        // Utilise la fonction speak que nous avons créée
        const utterance = new SpeechSynthesisUtterance(GUIDED_SCRIPT[line].text);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        
        // On annule les voix précédentes proprement
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }

      // Update pan
      if (pannerRef.current && line >= 0) {
        const target = GUIDED_SCRIPT[line].pan
        pannerRef.current.pan.setTargetAtTime(target, ctx.currentTime, 0.5)
      }

      // Auto stop
      const lastT = GUIDED_SCRIPT[GUIDED_SCRIPT.length - 1].t + 8
      if (el >= lastT) {
        stop()
      }
    }, 500)
  }, [running, stop])

  useEffect(() => () => stop(), [stop])

  const totalDuration = GUIDED_SCRIPT[GUIDED_SCRIPT.length - 1].t + 8
  const progress = Math.min((elapsed / totalDuration) * 100, 100)

  return { running, start, stop, currentLine, progress, elapsed, totalDuration }
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Home() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null)
  const [view, setView] = useState<"home" | "exercise" | "8d">("home")
  const ambient = useAmbientSound()

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Organic background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[80px]" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[80px]" />
        {/* Subtle grain */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-5 md:p-7 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Heart className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Pause QVT</span>
        </div>

        {/* Ambient Player — always visible */}
        <AmbientPlayer ambient={ambient} />
      </header>

      <div className="flex-1 relative z-10 w-full max-w-6xl mx-auto px-5 md:px-7 pb-8 flex flex-col">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <HomeView
              key="home"
              onSelect={(ex) => { setSelectedExercise(ex); setView("exercise") }}
              onOpen8D={() => setView("8d")}
            />
          )}
          {view === "exercise" && selectedExercise && (
            <ExerciseView
              key="exercise"
              data={selectedExercise}
              onBack={() => setView("home")}
            />
          )}
          {view === "8d" && (
            <Session8DView key="8d" onBack={() => setView("home")} />
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
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
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all duration-200",
          ambient.active
            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
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
                  onClick={() => ambient.play(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all",
                    ambient.active === s.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {s.icon}
                  {s.label}
                  {ambient.active === s.id && (
                    <span className="ml-auto flex gap-0.5 items-end">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-0.5 bg-primary rounded-full animate-bounce" style={{ height: `${4+i*2}px`, animationDelay: `${i*0.15}s` }} />
                      ))}
                    </span>
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
function HomeView({ onSelect, onOpen8D }: { onSelect: (o: ExerciseOption) => void; onOpen8D: () => void }) {
  const dailyPose = getDailyPose()

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col max-w-4xl mx-auto w-full gap-12 py-4"
    >
      {/* Hero */}
      <div className="space-y-5 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Prévention TMS & Gestion du Stress
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground text-balance leading-tight">
          Votre pause<br />
          <span className="text-primary">bien-être.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
          La sédentarité est le mal du siècle en entreprise. Ce module s'intègre à votre journée, sans changer de tenue, pour une démarche durable de santé au travail.
        </p>
      </div>

      {/* Daily Pose Card */}
      <DailyPoseCard pose={dailyPose} />

      {/* 8D Session CTA */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        onClick={onOpen8D}
        className="group relative flex flex-col p-6 bg-white dark:bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 text-left"      >
          
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Headphones className="w-6 h-6" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">Séance Audio 8D — Immersion totale</p>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">🎧 Casque requis</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Son binaural spatial · 5 minutes · Guidage voix 3D · Battements alpha</p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-auto flex-shrink-0" />
      </motion.button>

      {/* Exercise cards */}
      <div>
        <h2 className="text-2xl font-semibold text-center mb-7">
          De combien de temps disposez-vous ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EXERCISE_DATA.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              onClick={() => onSelect(option)}
              className="group relative flex flex-col p-6 bg-white dark:bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 text-left"
            >
              {/* Photo area */}
              <div className={cn(
                "relative w-full h-36 rounded-xl mb-4 overflow-hidden flex items-center justify-center text-5xl",
                option.id === "1min" ? "bg-orange-50 dark:bg-orange-900/20" :
                option.id === "3min" ? "bg-blue-50 dark:bg-blue-900/20" :
                "bg-green-50 dark:bg-green-900/20"
              )}>
                <span>{option.id === "1min" ? "🌬️" : option.id === "3min" ? "🧘" : "🌿"}</span>
                <div className={cn(
                  "absolute bottom-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center",
                  option.id === "1min" ? "bg-orange-100 text-orange-600" :
                  option.id === "3min" ? "bg-blue-100 text-blue-600" :
                  "bg-green-100 text-green-600"
                )}>
                  {option.id === "1min" ? <Wind className="w-4 h-4" /> :
                   option.id === "3min" ? <Activity className="w-4 h-4" /> :
                   <Timer className="w-4 h-4" />}
                </div>
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-2xl">{option.durationLabel}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-3">{option.theme}</p>
              <p className="text-xs text-muted-foreground border-t border-dashed pt-3 mt-auto">{option.description}</p>
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
function DailyPoseCard({ pose }: { pose: typeof DAILY_POSES[0] }) {
  const [expanded, setExpanded] = useState(false)
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-6 cursor-pointer",
        pose.color
      )}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{pose.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-background/60 rounded-full px-2.5 py-0.5">
              <Sun className="w-3 h-3" />
              Posture du jour · {today}
            </span>
          </div>
          <h3 className="font-bold text-xl">{pose.name}</h3>
          <p className={cn("text-sm font-medium italic mt-0.5", pose.accent)}>{pose.sanskrit}</p>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{pose.description}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="text-xs bg-background/70 rounded-full px-3 py-1">⏱ {pose.duration}</span>
                  <span className="text-xs bg-background/70 rounded-full px-3 py-1">✨ {pose.benefit}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground flex-shrink-0"
        >
          <ChevronRight className="w-5 h-5 rotate-90" />
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   EXERCISE VIEW (unchanged logic, upgraded visuals)
───────────────────────────────────────────── */
function ExerciseView({ data, onBack }: { data: ExerciseOption; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="flex flex-col w-full py-4"
    >
      <button
        onClick={onBack}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-7 group w-fit"
      >
        <div className="bg-secondary p-1.5 rounded-full mr-2 group-hover:bg-secondary/70 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Retour à l'accueil
      </button>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
              data.id === "1min" ? "bg-orange-100 text-orange-700" :
              data.id === "3min" ? "bg-blue-100 text-blue-700" :
              "bg-green-100 text-green-700"
            )}>
              {data.durationLabel} · {data.theme}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">{data.title}</h2>
            <p className="text-lg text-muted-foreground">{data.description}</p>
          </div>

          <div className="space-y-4">
            {data.exercises.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 bg-primary/10 text-primary w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div>
                      <h3 className="font-semibold text-base">{ex.title}</h3>
                      <p className="text-xs text-primary/80 font-medium mt-0.5">{ex.what}</p>
                    </div>
                    <ul className="space-y-1.5">
                      {ex.instructions.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground text-sm leading-relaxed">
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

          <Button onClick={onBack} size="lg" className="w-full md:w-auto rounded-full">
            Terminer la pause
          </Button>
        </div>

        {/* Right panel: visual + timer */}
        <div className="sticky top-8 space-y-4">
          {/* Illustration area */}
          <div className={cn(
            "relative aspect-square w-full rounded-3xl overflow-hidden flex items-center justify-center text-8xl",
            data.id === "1min" ? "bg-gradient-to-br from-orange-100 to-amber-50" :
            data.id === "3min" ? "bg-gradient-to-br from-blue-100 to-sky-50" :
            "bg-gradient-to-br from-green-100 to-emerald-50"
          )}>
            <span>{data.id === "1min" ? "🌬️" : data.id === "3min" ? "🧘‍♀️" : "🌿"}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Focus</p>
              <p className="text-white text-xl font-bold">{data.theme}</p>
            </div>
          </div>

          <ExerciseTimer durationId={data.id} />
        </div>
      </div>
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
    <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-5">
        {/* Circular progress */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90">
            <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
            <circle
              cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4"
              className={cn("text-primary transition-all duration-1000", isCompleted && "text-green-500")}
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

        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium mb-2">
            {isCompleted ? "✅ Bravo ! Séance terminée" : isActive ? "⏳ En cours..." : "Minuteur de séance"}
          </p>
          <div className="flex gap-2">
            <Button size="icon" onClick={toggle}
              className="h-9 w-9 rounded-full">
              {isCompleted ? <RotateCcw className="w-4 h-4" /> : isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>
            {(isActive || isCompleted || timeLeft !== totalTime) && (
              <Button size="icon" variant="outline" onClick={reset} className="h-9 w-9 rounded-full">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="flex flex-col w-full max-w-2xl mx-auto py-4"
    >
      <button
        onClick={() => { session.stop(); onBack() }}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 group w-fit"
      >
        <div className="bg-secondary p-1.5 rounded-full mr-2 group-hover:bg-secondary/70 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Retour
      </button>

      {/* Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Headphones className="w-4 h-4" />
          Séance Audio 8D Binaural
        </div>
        <h2 className="text-3xl font-bold">Immersion Sonore 3D</h2>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
          Le son binaural crée une sensation de rotation spatiale autour de votre tête.
          Fermez les yeux et laissez le son vous guider.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm">
          🎧 Mettez un casque stéréo pour l'effet 8D complet
        </div>
      </div>

      {/* Visualizer */}
      <div className={cn(
        "relative rounded-3xl overflow-hidden mb-6 transition-all duration-1000",
        session.running
          ? "bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900"
          : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
      )}>
        <div className="p-8">
          {/* Animated rings */}
          <div className="relative flex items-center justify-center h-40">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={cn(
                  "absolute rounded-full border transition-all duration-500",
                  session.running ? "border-white/20 animate-ping" : "border-muted/30"
                )}
                style={{
                  width: `${60 + i * 30}px`,
                  height: `${60 + i * 30}px`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: "2s",
                }}
              />
            ))}
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
              session.running ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}>
              <Headphones className="w-7 h-7" />
            </div>
          </div>

          {/* Current transcript line */}
          <div className="min-h-16 flex items-center justify-center text-center mt-2">
            <AnimatePresence mode="wait">
              {session.currentLine >= 0 ? (
                <motion.p
                  key={session.currentLine}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "text-base font-medium leading-relaxed",
                    session.running ? "text-white" : "text-foreground"
                  )}
                >
                  {GUIDED_SCRIPT[session.currentLine].text}
                </motion.p>
              ) : session.running ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/60 text-sm"
                >
                  Préparation...
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          {session.running && (
            <div className="mt-4">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  animate={{ width: `${session.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>{Math.floor(session.elapsed / 60)}:{String(session.elapsed % 60).padStart(2, "0")}</span>
                <span>{Math.floor(session.totalDuration / 60)}:{String(session.totalDuration % 60).padStart(2, "0")}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={session.start}
          className={cn(
            "rounded-full gap-2 px-8 transition-all",
            session.running && "bg-destructive hover:bg-destructive/90"
          )}
        >
          {session.running ? (
            <><Pause className="w-5 h-5" /> Arrêter la séance</>
          ) : (
            <><Play className="w-5 h-5" /> Démarrer la séance 8D</>
          )}
        </Button>
      </div>

      {/* Script preview */}
      <div className="mt-8 bg-muted/50 rounded-2xl p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Programme de la séance</p>
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

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="relative z-10 w-full p-6 mt-12 border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div className="max-w-lg space-y-1 text-center md:text-left">
          <p className="font-medium text-foreground">Prenez soin de vous 🧘‍♂️</p>
          <p>Ce projet vise à sensibiliser aux enjeux de la santé au travail. En rendant la pratique accessible, nous favorisons le bien-être durable des collaborateurs.</p>
        </div>
        <div className="text-xs opacity-50">© {new Date().getFullYear()} Pause QVT</div>
      </div>
    </footer>
  )
}