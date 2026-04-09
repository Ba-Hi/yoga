export type ExerciseOption = {
  id: "1min" | "3min" | "5min"
  durationLabel: string
  durationValue: string
  theme: "Urgence Stress" | "Douleurs Nuque/Dos" | "Recharge complète"
  title: string
  description: string
  exercises: {
    title: string
    what: string
    instructions: string[]
  }[]
  colorClass: string
  placeholderQuery: string
}

export const EXERCISE_DATA: ExerciseOption[] = [
  {
    id: "1min",
    durationLabel: "1 minute",
    durationValue: "1 min",
    theme: "Urgence Stress",
    title: 'La Respiration "Carrée"',
    description: "Calme le système nerveux et réduit le cortisol instantanément. Idéal avant une prise de parole.",
    exercises: [
      {
        title: 'La Respiration "Carrée"',
        what: "Anti-Stress immédiat",
        instructions: [
          "Asseyez-vous le dos droit, pieds à plat.",
          "Inspirez par le nez sur 4 secondes.",
          "Bloquez votre souffle poumons pleins sur 4 secondes.",
          "Expirez par le nez sur 4 secondes.",
          "Bloquez poumons vides sur 4 secondes.",
          "Répétez 3 fois.",
        ],
      },
    ],
    colorClass: "bg-orange-100 text-orange-900",
    placeholderQuery: "calm person breathing meditation close up minimalistic",
  },
  {
    id: "3min",
    durationLabel: "3 minutes",
    durationValue: "3 min",
    theme: "Douleurs Nuque/Dos",
    title: "Le Déverrouillage Cervical",
    description: "Contre les douleurs liées aux écrans et à la posture statique.",
    exercises: [
      {
        title: 'Le "Oui-Non"',
        what: "Mobilité du cou",
        instructions: [
          "Tournez lentement la tête de droite à gauche.",
          "Puis de haut en bas.",
          "Répétez 5 fois lentement.",
        ],
      },
      {
        title: "L'aigle assis",
        what: "Étirement du haut du dos",
        instructions: [
          "Croisez vos bras devant vous, mains sur les épaules opposées (comme un câlin).",
          "Levez les coudes à hauteur du menton.",
          "Respirez profondément dans le haut du dos.",
        ],
      },
      {
        title: "L'ouverture",
        what: 'Contre l\'effet "dos voûté"',
        instructions: [
          "Entrelacez les mains dans le dos.",
          "Tendez les bras pour ouvrir la poitrine.",
          "Regardez légèrement vers le haut.",
        ],
      },
    ],
    colorClass: "bg-blue-100 text-blue-900",
    placeholderQuery: "person stretching neck office chair minimalistic",
  },
  {
    id: "5min",
    durationLabel: "5 minutes",
    durationValue: "5 min",
    theme: "Recharge complète",
    title: 'La "Chaise du Roi"',
    description: "La position assise bloque le bassin et crée des douleurs lombaires.",
    exercises: [
      {
        title: "Le Chiffre 4",
        what: "Soulagement Lombaire",
        instructions: [
          "Assis, posez votre cheville droite sur votre genou gauche (formant un 4).",
          "Gardez le dos droit et penchez-vous légèrement en avant jusqu'à sentir un étirement dans la fesse droite.",
          "Restez 5 respirations, puis changez de côté.",
        ],
      },
      {
        title: "La Torsion",
        what: "Essorez la colonne",
        instructions: [
          "Main droite sur le genou gauche.",
          "Main gauche attrape le dossier de la chaise derrière vous.",
          "Tournez le buste pour regarder derrière.",
          "Changez de côté.",
        ],
      },
    ],
    colorClass: "bg-green-100 text-green-900",
    placeholderQuery: "person stretching back chair office yoga minimalistic",
  },
]
