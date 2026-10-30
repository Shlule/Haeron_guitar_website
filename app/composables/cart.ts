import { acceptHMRUpdate, defineStore } from 'pinia'

/*
 * Panier du visiteur, tenu par le backend (queries `shopCart`, mutations `addToCart` / `removeFromCart`).
 * Sans compte, le panier est retrouvé grâce à une clé que le backend donne au premier ajout,
 * gardée dans un cookie.
 */

export interface CartDetail {
  component: string
  product: string | null // PartModel ou produit choisi
  values: { option: string, value: string }[]
}

export interface CartItem {
  id: string
  productId: string
  name: string
  quantity: number
  unitPrice: number
  total: number
  details: CartDetail[]
}

export interface Cart {
  cartKey: string | null
  count: number
  total: number
  items: CartItem[]
}

export const useCartStore = defineStore('cart', () => {
  const cartKey = useCookie<string | null>('haeron-cart', { maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', default: () => null })
  const cart = ref<Cart | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const count = computed(() => cart.value?.count ?? 0)

  function apply(next: Cart) {
    cart.value = next
    if (next.cartKey)
      cartKey.value = next.cartKey
  }

  async function load() {
    // pas de clé : panier vide, inutile d'interroger le backend
    if (!cartKey.value) {
      cart.value = { cartKey: null, count: 0, total: 0, items: [] }
      return
    }
    loading.value = true
    error.value = null
    try {
      const { shopCart } = await configuratorQuery<{ shopCart: Cart }>(
        'query ($key: String) { shopCart(cartKey: $key) }',
        { key: cartKey.value },
      )
      apply(shopCart)
      // panier introuvable (commandé, expiré) : on oublie la clé
      if (!shopCart.cartKey)
        cartKey.value = null
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    }
    finally {
      loading.value = false
    }
  }

  // lève une erreur lisible si le backend refuse (configuration invalide...)
  async function add(productId: string, configuration: Record<string, unknown> | null = null, quantity = 1) {
    const { addToCart } = await configuratorQuery<{ addToCart: Cart }>(
      'mutation ($input: AddToCartInput!) { addToCart(input: $input) }',
      { input: { productId, configuration, quantity, cartKey: cartKey.value } },
    )
    apply(addToCart)
    return addToCart
  }

  async function remove(itemId: string) {
    const { removeFromCart } = await configuratorQuery<{ removeFromCart: Cart }>(
      'mutation ($id: UUID!, $key: String) { removeFromCart(itemId: $id, cartKey: $key) }',
      { id: itemId, key: cartKey.value },
    )
    apply(removeFromCart)
  }

  return { cartKey, cart, loading, error, count, load, add, remove }
})

// mémorise la dernière réponse au chargement : un seul appel pour tout le site
export function useCart() {
  const store = useCartStore()
  if (import.meta.client && !store.cart && !store.loading)
    store.load()
  return store
}

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot))
