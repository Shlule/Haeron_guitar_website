// Libellés affichés dans le configurateur. Les codes viennent du backend,
// tout code absent d'ici est affiché "joliment" (snake_case -> Texte).

const componentLabels: Record<string, string> = {
  body_sup: 'Corps supérieur',
  body_inf: 'Corps inférieur',
  neck: 'Manche',
  fingerboard: 'Touche',
  mic_plate: 'Plaque micro',
}

const optionLabels: Record<string, string> = {
  material: 'Matière',
  finish: 'Finition',
  color: 'Couleur',
  wood_essence: 'Essence de bois',
  post_treatment: 'Traitement de surface',
  radius: 'Radius',
}

// ordre d'affichage des options : on choisit la matière et la finition avant le reste
const optionOrder = ['material', 'finish', 'color', 'wood_essence', 'post_treatment', 'radius']

const valueLabels: Record<string, string> = {
  color_red: 'Rouge',
  color_blue: 'Bleu',
  color_green: 'Vert',
  color_black: 'Noir',
  wood: 'Bois',
  aluminium: 'Aluminium',
  painted: 'Peint',
  raw: 'Brut',
  walnut: 'Noyer',
  maple: 'Érable',
  pine: 'Pin',
  chrome: 'Chromé',
  anodised: 'Anodisé',
  polished: 'Poli',
  radius_10: '10"',
  radius_12: '12"',
}

// pastilles de couleur pour les valeurs de l'option "color"
const swatches: Record<string, string> = {
  color_blue: '#2f4f9e',
  color_red: '#9e2a2b',
  color_green: '#2f6b45',
  color_black: '#111111',
}

export function prettify(code: string) {
  const text = code.replace(/_/g, ' ').trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function componentLabel(key: string) {
  return componentLabels[key] ?? prettify(key)
}

export function optionRank(name: string) {
  const index = optionOrder.indexOf(name)
  return index === -1 ? optionOrder.length : index
}

export function optionLabel(name: string) {
  return optionLabels[name] ?? prettify(name)
}

export function valueLabel(value: string) {
  return valueLabels[value] ?? prettify(value)
}

// "body_sup_starlight" pour le composant "body_sup" -> "Starlight"
export function partModelLabel(componentKey: string, name: string) {
  const stripped = name.startsWith(`${componentKey}_`) ? name.slice(componentKey.length + 1) : name
  return prettify(stripped)
}

export function swatchOf(value: string) {
  return swatches[value]
}

export function formatPrice(price: number | null | undefined) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price ?? 0)
}
