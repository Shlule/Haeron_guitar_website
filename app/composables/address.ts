/*
 * Autocomplétion des adresses françaises avec les API publiques de l'État, gratuites et sans clé :
 * - Base Adresse Nationale (Géoplateforme de l'IGN) pour la rue et le numéro ;
 * - API Géo pour les communes d'un code postal.
 * Hors de France, les champs restent libres (et le remplissage automatique du navigateur marche toujours).
 */

export interface AddressSuggestion {
  label: string // 8 Boulevard du Port 80000 Amiens
  street: string // 8 Boulevard du Port
  postalCode: string
  city: string
  context: string // 80, Somme, Hauts-de-France
}

const ADDRESS_API = 'https://data.geopf.fr/geocodage/search'
const COMMUNES_API = 'https://geo.api.gouv.fr/communes'

interface AddressFeature {
  properties: { label: string, name: string, postcode?: string, city?: string, context?: string }
}

export async function searchAddresses(text: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const q = text.trim()
  if (q.length < 3)
    return []
  const params = new URLSearchParams({ q, limit: '5', autocomplete: '1', index: 'address' })
  const response = await fetch(`${ADDRESS_API}?${params}`, { signal })
  if (!response.ok)
    return []
  const data = await response.json() as { features?: AddressFeature[] }
  return (data.features ?? []).map(({ properties: p }) => ({
    label: p.label,
    street: p.name,
    postalCode: p.postcode ?? '',
    city: p.city ?? '',
    context: p.context ?? '',
  }))
}

// communes d'un code postal français (un code postal peut couvrir plusieurs communes)
export async function citiesOfPostalCode(postalCode: string, signal?: AbortSignal): Promise<string[]> {
  if (!/^\d{5}$/.test(postalCode.trim()))
    return []
  const params = new URLSearchParams({ codePostal: postalCode.trim(), fields: 'nom' })
  const response = await fetch(`${COMMUNES_API}?${params}`, { signal })
  if (!response.ok)
    return []
  const communes = await response.json() as { nom: string }[]
  return [...new Set(communes.map(c => c.nom))].sort((a, b) => a.localeCompare(b, 'fr'))
}
