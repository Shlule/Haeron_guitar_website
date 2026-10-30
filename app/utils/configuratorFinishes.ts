// Aspect de chaque pièce dans la scène 3D, calculé à partir des choix du configurateur.
// Les finitions aluminium et les peintures sont de simples réglages de matériau : pas de texture à produire.

export interface Finish {
  color: string
  metalness: number
  roughness: number
  clearcoat: number // vernis : 1 pour les peintures, 0 sinon
}

const metal = (color: string, roughness: number, metalness = 1): Finish => ({ color, metalness, roughness, clearcoat: 0 })
const paint = (color: string): Finish => ({ color, metalness: 0.1, roughness: 0.35, clearcoat: 1 })
const wood = (color: string): Finish => ({ color, metalness: 0, roughness: 0.6, clearcoat: 0.3 })

// à ajuster pour coller aux vraies pièces
const finishes: Record<string, Finish> = {
  // traitements de surface de l'aluminium (et de la plaque micro)
  raw: metal('#a9adb3', 0.42),
  polished: metal('#d6d9de', 0.14),
  chrome: metal('#f4f6f8', 0.04),
  anodised: metal('#5f6f86', 0.3, 0.85),
  // essences, si le bois revient un jour
  walnut: wood('#5b3a29'),
  maple: wood('#d9b77e'),
  pine: wood('#e8cf9a'),
}

// aluminium brut tant que rien n'est choisi
const defaultFinish = finishes.raw!

// sous-couche affichée entre « peint » et le choix de la couleur
const primer = paint('#d8d8d8')

// pièces dont l'aspect dépend des choix ; les autres (manche, touche) gardent le matériau du modèle 3D
const tintedComponents = ['body_sup', 'body_inf', 'mic_plate']

/**
 * Finition d'une pièce d'après ses réponses ({ option, value }),
 * ou null pour garder le matériau du modèle 3D.
 */
export function finishOf(componentKey: string, choices: { option: string, value: string }[]): Finish | null {
  const answer = (option: string) => choices.find(choice => choice.option === option)?.value

  if (answer('finish') === 'painted') {
    const color = answer('color')
    const swatch = color ? swatchOf(color) : undefined
    return swatch ? paint(swatch) : primer
  }
  for (const option of ['post_treatment', 'wood_essence', 'finish']) {
    const value = answer(option)
    if (value && finishes[value])
      return finishes[value]
  }
  return tintedComponents.includes(componentKey) ? defaultFinish : null
}
