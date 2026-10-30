import { acceptHMRUpdate, defineStore } from 'pinia'

/*
 * Configurateur produit.
 * La template (composants, pièces, options, règles) vient du backend (query `configuratorTemplate`).
 * Les règles sont appliquées ici pour n'afficher que les choix possibles, une question après
 * l'autre, puis la configuration est validée par le backend (query `validateConfiguration`) qui fait foi.
 */

export interface PartModelOption {
  id: string
  name: string // nom de l'option (color, material...)
  value: string // valeur (color_blue, aluminium...)
  price_delta: number
}

export interface PartModel {
  id: string
  name: string
  price: number
  options: PartModelOption[]
}

export interface ProductRef {
  id: string
  name: string
  price: number
}

export type TemplateComponent
  = | { key: string, type: 'custom_piece', part_models: PartModel[] }
    | { key: string, type: 'product_choice', choices: ProductRef[] }
    | { key: string, type: 'product_configurable', products: ProductRef[] }
    | { key: string, type: 'fixed', product: ProductRef }

export interface RuleValue { type: 'option' | 'product', id: string, code?: string, label: string }
export interface RuleCondition { component: string, option: string | null, operator: 'eq' | 'neq' | 'in', values: RuleValue[] }
export interface RuleResult { component: string, option: string | null, values: RuleValue[] }
export interface Rule { id: string, name: string, conditions: RuleCondition[], results: RuleResult[] }

export interface ConfiguratorTemplate {
  // image et modèle 3D : chemins servis par le site (ex: /models/starlight.glb), vides si absents
  product: ProductRef & { type: string, image: string, model3d: string }
  components: TemplateComponent[]
  rules: Rule[]
}

export interface ValidationResult {
  valid: boolean
  total_price: number | null
  snapshot: Record<string, unknown>[]
  errors: string[]
  violations: { rule_id: string, rule_name: string, component: string, message: string }[]
}

export interface ComponentSelection {
  partModelId?: string
  options: Record<string, string> // nom de l'option -> id de la PartModelOption
  productId?: string
}

export async function configuratorQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { public: { apiBase } } = useRuntimeConfig()
  const response = await $fetch<{ data?: T, errors?: { message: string }[] }>(`${apiBase}/graphql/`, {
    method: 'POST',
    body: { query, variables },
  })
  if (response.errors?.length)
    throw new Error(response.errors.map(e => e.message).join(' '))
  return response.data as T
}

// clé utilisée par le rule engine : "<composant>.<option>" ou "<composant>" pour un produit choisi
export function ruleKey(component: string, option?: string | null) {
  return option ? `${component}.${option}` : component
}

export function ruleApplies(rule: Rule, configuration: Record<string, string>) {
  return rule.conditions.every((condition) => {
    const value = configuration[ruleKey(condition.component, condition.option)]
    if (value === undefined)
      return false
    const ids = condition.values.map(v => v.id)
    return condition.operator === 'neq' ? !ids.includes(value) : ids.includes(value)
  })
}

// templates déjà demandés, gardés le temps de la visite (préchargés au survol d'un produit dans la boutique)
const templates = new Map<string, Promise<ConfiguratorTemplate>>()

export function fetchConfiguratorTemplate(id: string) {
  let template = templates.get(id)
  if (!template) {
    template = configuratorQuery<{ configuratorTemplate: ConfiguratorTemplate }>(
      'query ($id: UUID!) { configuratorTemplate(productId: $id) }',
      { id },
    ).then(data => data.configuratorTemplate)
    template.catch(() => templates.delete(id)) // un échec pourra être retenté
    templates.set(id, template)
  }
  return template
}

export const useConfiguratorStore = defineStore('configurator', () => {
  const template = ref<ConfiguratorTemplate | null>(null)
  const selections = ref<Record<string, ComponentSelection>>({})
  const loading = ref(false)
  const loadError = ref<string | null>(null)

  const validation = ref<ValidationResult | null>(null)
  const validating = ref(false)
  const validationError = ref<string | null>(null)

  const components = computed(() => template.value?.components ?? [])

  function partModelOf(key: string): PartModel | undefined {
    const component = components.value.find(c => c.key === key)
    if (component?.type !== 'custom_piece')
      return undefined
    return component.part_models.find(pm => pm.id === selections.value[key]?.partModelId)
  }

  // options d'une pièce regroupées par nom d'option : { material: [...], finish: [...] }, dans l'ordre d'affichage
  function optionGroups(partModel: PartModel) {
    const groups: Record<string, PartModelOption[]> = {}
    const sorted = [...partModel.options].sort((a, b) => optionRank(a.name) - optionRank(b.name))
    for (const option of sorted)
      (groups[option.name] ??= []).push(option)
    return groups
  }

  // configuration "à plat", même format que le ConfigurationNormalizer du backend
  const normalized = computed(() => {
    const result: Record<string, string> = {}
    for (const [key, selection] of Object.entries(selections.value)) {
      for (const [option, id] of Object.entries(selection.options))
        result[ruleKey(key, option)] = id
      if (selection.productId)
        result[key] = selection.productId
    }
    return result
  })

  // valeurs autorisées par les règles actives : { "body_inf.color": Set(ids) }
  const restrictions = computed(() => {
    const result: Record<string, Set<string>> = {}
    for (const rule of template.value?.rules ?? []) {
      if (!ruleApplies(rule, normalized.value))
        continue
      for (const ruleResult of rule.results) {
        const key = ruleKey(ruleResult.component, ruleResult.option)
        const allowed = new Set(ruleResult.values.map(v => v.id))
        result[key] = result[key] ? new Set([...result[key]].filter(id => allowed.has(id))) : allowed
      }
    }
    return result
  })

  function isAllowed(component: string, option: string | null, id: string) {
    const allowed = restrictions.value[ruleKey(component, option)]
    return !allowed || allowed.has(id)
  }

  // options dont dépend chaque option : { "body_sup.color": ["body_sup.finish"] }
  const dependencies = computed(() => {
    const result: Record<string, Set<string>> = {}
    for (const rule of template.value?.rules ?? []) {
      for (const ruleResult of rule.results) {
        const key = ruleKey(ruleResult.component, ruleResult.option)
        for (const condition of rule.conditions)
          (result[key] ??= new Set()).add(ruleKey(condition.component, condition.option))
      }
    }
    return result
  })

  // une option est affichée quand les choix dont elle dépend sont faits
  // et qu'au moins une de ses valeurs reste possible (ex: pas de couleur sur un corps brut)
  function isOptionVisible(key: string, option: string, values: PartModelOption[]) {
    const sources = dependencies.value[ruleKey(key, option)] ?? new Set()
    if ([...sources].some(source => normalized.value[source] === undefined))
      return false
    return values.some(value => isAllowed(key, option, value.id))
  }

  // options affichées d'une pièce, avec uniquement leurs valeurs possibles
  function visibleOptionGroups(key: string) {
    const partModel = partModelOf(key)
    if (!partModel)
      return {}
    const result: Record<string, PartModelOption[]> = {}
    for (const [option, values] of Object.entries(optionGroups(partModel))) {
      if (isOptionVisible(key, option, values))
        result[option] = values.filter(value => isAllowed(key, option, value.id))
    }
    return result
  }

  // options déjà répondues, dans l'ordre des questions
  function answeredOptions(key: string) {
    const selection = selections.value[key]
    return Object.entries(visibleOptionGroups(key)).flatMap(([option, values]) => {
      const value = values.find(v => v.id === selection?.options[option])
      return value ? [{ option, value, editable: values.length > 1 }] : []
    })
  }

  // prochaine question à poser pour une pièce
  function nextOption(key: string) {
    const selection = selections.value[key]
    const entry = Object.entries(visibleOptionGroups(key)).find(([option]) => !selection?.options[option])
    return entry ? { option: entry[0], values: entry[1] } : null
  }

  // une pièce est complète quand chaque option a une valeur
  function isComponentComplete(component: TemplateComponent) {
    const selection = selections.value[component.key]
    if (component.type === 'fixed')
      return true
    if (component.type !== 'custom_piece')
      return !!selection?.productId
    const partModel = partModelOf(component.key)
    if (!partModel)
      return false
    return Object.keys(visibleOptionGroups(component.key)).every(option => !!selection?.options[option])
  }

  const isComplete = computed(() => components.value.length > 0 && components.value.every(isComponentComplete))

  // payload attendu par le BundleConfigHandler
  const payload = computed(() => {
    const result: Record<string, unknown> = {}
    for (const component of components.value) {
      const selection = selections.value[component.key]
      if (component.type === 'custom_piece') {
        result[component.key] = {
          part_model_id: selection?.partModelId,
          part_model_option_ids: Object.values(selection?.options ?? {}),
        }
      }
      else if (component.type === 'product_choice') {
        result[component.key] = { product_id: selection?.productId }
      }
      else if (component.type === 'product_configurable') {
        result[component.key] = { product_id: selection?.productId, configuration: {} }
      }
      else {
        result[component.key] = {}
      }
    }
    return result
  })

  // estimation locale, le prix du backend fait foi
  const estimatedPrice = computed(() => {
    let total = template.value?.product.price ?? 0
    for (const component of components.value) {
      const selection = selections.value[component.key]
      if (component.type === 'custom_piece') {
        const partModel = partModelOf(component.key)
        if (!partModel)
          continue
        total += partModel.price
        for (const id of Object.values(selection?.options ?? {}))
          total += partModel.options.find(o => o.id === id)?.price_delta ?? 0
      }
      else if (component.type === 'fixed') {
        total += component.product.price
      }
      else {
        const list = component.type === 'product_choice' ? component.choices : component.products
        total += list.find(p => p.id === selection?.productId)?.price ?? 0
      }
    }
    return total
  })

  // pièce affichée dans la carte : on ne passe à la suivante que quand les précédentes sont finies
  const activeIndex = ref(0)
  const active = computed(() => components.value[activeIndex.value])
  const activeComplete = computed(() => !!active.value && isComponentComplete(active.value))

  function isUnlocked(index: number) {
    return components.value.slice(0, index).every(isComponentComplete)
  }

  function goTo(index: number) {
    if (index >= 0 && index < components.value.length && isUnlocked(index))
      activeIndex.value = index
  }

  // retire les choix devenus interdits ou masqués après un changement (ex: passage du bois à l'aluminium)
  const adjusted = ref<string[]>([])
  function dropForbiddenSelections() {
    for (const [key, selection] of Object.entries(selections.value)) {
      for (const [option, id] of Object.entries(selection.options)) {
        if (!(option in visibleOptionGroups(key)) || !isAllowed(key, option, id)) {
          delete selection.options[option]
          // on ne prévient que si l'option est toujours à choisir
          if (option in visibleOptionGroups(key))
            adjusted.value = [...new Set([...adjusted.value, key])]
        }
      }
      if (selection.productId && !isAllowed(key, null, selection.productId)) {
        selection.productId = undefined
        adjusted.value = [...new Set([...adjusted.value, key])]
      }
    }
  }

  function ensureSelection(key: string) {
    return (selections.value[key] ??= { options: {} })
  }

  function selectPartModel(key: string, partModelId: string) {
    const selection = ensureSelection(key)
    if (selection.partModelId === partModelId)
      return
    selection.partModelId = partModelId
    selection.options = {}
    autoSelectSingleValues()
  }

  // revient sur un choix : il est effacé, ainsi que les questions qui viennent après
  function resetOption(key: string, option: string) {
    const selection = selections.value[key]
    const partModel = partModelOf(key)
    if (!selection || !partModel)
      return
    const order = Object.keys(optionGroups(partModel))
    const rank = order.indexOf(option)
    for (const name of Object.keys(selection.options)) {
      if (order.indexOf(name) >= rank)
        delete selection.options[name]
    }
    adjusted.value = adjusted.value.filter(k => k !== key)
    dropForbiddenSelections()
    autoSelectSingleValues()
  }

  function resetPartModel(key: string) {
    const selection = selections.value[key]
    if (!selection)
      return
    selection.partModelId = undefined
    selection.options = {}
    adjusted.value = adjusted.value.filter(k => k !== key)
    dropForbiddenSelections()
  }

  function selectOption(key: string, option: string, id: string) {
    if (!isAllowed(key, option, id))
      return
    ensureSelection(key).options[option] = id
    adjusted.value = adjusted.value.filter(k => k !== key)
    dropForbiddenSelections()
    autoSelectSingleValues()
  }

  function selectProduct(key: string, productId: string) {
    if (!isAllowed(key, null, productId))
      return
    ensureSelection(key).productId = productId
    dropForbiddenSelections()
  }

  // présélectionne ce qui n'a qu'une seule possibilité
  function autoSelectSingleValues() {
    for (const component of components.value) {
      if (component.type === 'custom_piece') {
        if (component.part_models.length === 1 && !selections.value[component.key]?.partModelId)
          ensureSelection(component.key).partModelId = component.part_models[0]!.id
        const partModel = partModelOf(component.key)
        if (!partModel)
          continue
        for (const [option, values] of Object.entries(visibleOptionGroups(component.key))) {
          if (values.length === 1 && !selections.value[component.key]?.options[option])
            ensureSelection(component.key).options[option] = values[0]!.id
        }
      }
      else if (component.type !== 'fixed') {
        const list = component.type === 'product_choice' ? component.choices : component.products
        if (list.length === 1 && !selections.value[component.key]?.productId)
          ensureSelection(component.key).productId = list[0]!.id
      }
    }
  }

  let loadId = 0
  async function load(productId?: string) {
    const current = ++loadId
    loading.value = true
    loadError.value = null
    try {
      let id = productId
      if (!id) {
        const { configuratorProducts } = await configuratorQuery<{ configuratorProducts: ProductRef[] }>(
          '{ configuratorProducts }',
        )
        id = configuratorProducts[0]?.id
        if (!id)
          throw new Error('Aucun produit configurable n\'est disponible pour le moment.')
      }
      // pas d'ancien produit affiché pendant le chargement d'un autre
      if (template.value?.product.id !== id)
        template.value = null
      const loaded = await fetchConfiguratorTemplate(id)
      if (current !== loadId)
        return // un autre produit a été demandé entre-temps
      template.value = loaded
      selections.value = {}
      validation.value = null
      autoSelectSingleValues()
      const firstIncomplete = components.value.findIndex(c => !isComponentComplete(c))
      activeIndex.value = Math.max(firstIncomplete, 0)
    }
    catch (error) {
      if (current === loadId)
        loadError.value = error instanceof Error ? error.message : String(error)
    }
    finally {
      if (current === loadId)
        loading.value = false
    }
  }

  let validationId = 0
  async function validate() {
    if (!template.value || !isComplete.value)
      return null
    const current = ++validationId
    validating.value = true
    validationError.value = null
    try {
      const { validateConfiguration } = await configuratorQuery<{ validateConfiguration: ValidationResult }>(
        'query ($id: UUID!, $configuration: JSON!) { validateConfiguration(productId: $id, configuration: $configuration) }',
        { id: template.value.product.id, configuration: payload.value },
      )
      // ignore les réponses d'une configuration déjà modifiée
      if (current === validationId)
        validation.value = validateConfiguration
      return validateConfiguration
    }
    catch (error) {
      if (current === validationId)
        validationError.value = error instanceof Error ? error.message : String(error)
      return null
    }
    finally {
      if (current === validationId)
        validating.value = false
    }
  }

  // chaque changement invalide la dernière réponse du backend
  watch(payload, () => {
    validation.value = null
  }, { deep: true })

  return {
    template,
    selections,
    loading,
    loadError,
    validation,
    validating,
    validationError,
    components,
    restrictions,
    isComplete,
    estimatedPrice,
    adjusted,
    payload,
    partModelOf,
    optionGroups,
    visibleOptionGroups,
    answeredOptions,
    nextOption,
    isAllowed,
    isComponentComplete,
    activeIndex,
    active,
    activeComplete,
    isUnlocked,
    goTo,
    selectPartModel,
    selectOption,
    resetOption,
    resetPartModel,
    selectProduct,
    load,
    validate,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useConfiguratorStore, import.meta.hot))
