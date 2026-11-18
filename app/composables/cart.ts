import { acceptHMRUpdate, defineStore } from 'pinia'

/*
 * Panier du visiteur, tenu par le backend (query `shopCart`, mutations `addToCart`, `updateCartItem`,
 * `removeFromCart`, puis `placeOrder` qui le transforme en commande).
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
  configurable: boolean
  configuration: Record<string, unknown> | null // envoyée par le configurateur, pour rouvrir l'article
}

export interface Customer {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  postalCode: string
  city: string
  country: string
}

export interface Order {
  id: string
  reference: string
  status: string
  createdAt: string
  email: string
  firstName: string
  lastName: string
  address: string
  postalCode: string
  city: string
  country: string
  total: number
  items: { name: string, quantity: number, unitPrice: number, total: number, details: CartDetail[] }[]
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

  // un seul appel à la fois : une page qui attend le panier réutilise celui en cours
  let pending: Promise<void> | null = null
  function load() {
    pending ??= fetchCart().finally(() => {
      pending = null
    })
    return pending
  }

  async function fetchCart() {
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

  // nouvelle quantité et / ou nouvelle configuration (revérifiée et recalculée par le backend)
  async function update(itemId: string, changes: { quantity?: number, configuration?: Record<string, unknown> }) {
    const { updateCartItem } = await configuratorQuery<{ updateCartItem: Cart }>(
      'mutation ($input: UpdateCartItemInput!) { updateCartItem(input: $input) }',
      { input: { itemId, ...changes, cartKey: cartKey.value } },
    )
    apply(updateCartItem)
  }

  // attend le panier quand une page en a besoin tout de suite (ex: rouvrir un article)
  async function ensureLoaded() {
    if (!cart.value || pending)
      await load()
    return cart.value
  }

  // le panier devient une commande ; la même clé d'idempotence renvoie la même commande (double clic, réseau)
  async function checkout(customer: Customer, idempotencyKey: string) {
    const { placeOrder } = await configuratorQuery<{ placeOrder: Order }>(
      'mutation ($input: PlaceOrderInput!) { placeOrder(input: $input) }',
      { input: { ...customer, idempotencyKey, cartKey: cartKey.value } },
    )
    // panier fermé côté backend : on repart d'un panier vide
    cartKey.value = null
    cart.value = { cartKey: null, count: 0, total: 0, items: [] }
    return placeOrder
  }

  async function remove(itemId: string) {
    const { removeFromCart } = await configuratorQuery<{ removeFromCart: Cart }>(
      'mutation ($id: UUID!, $key: String) { removeFromCart(itemId: $id, cartKey: $key) }',
      { id: itemId, key: cartKey.value },
    )
    apply(removeFromCart)
  }

  return { cartKey, cart, loading, error, count, load, ensureLoaded, add, update, remove, checkout }
})

// paiement d'une commande : le backend crée la page de paiement Stripe et renvoie son adresse
export async function startOrderPayment(orderId: string) {
  const { payOrder } = await configuratorQuery<{ payOrder: string }>(
    'mutation ($id: UUID!) { payOrder(orderId: $id) }',
    { id: orderId },
  )
  return payOrder
}

// retour de Stripe : le backend vérifie le paiement auprès de Stripe et renvoie la commande à jour
export async function confirmOrderPayment(orderId: string, sessionId: string) {
  const { confirmOrderPayment } = await configuratorQuery<{ confirmOrderPayment: Order }>(
    'mutation ($id: UUID!, $session: String!) { confirmOrderPayment(orderId: $id, sessionId: $session) }',
    { id: orderId, session: sessionId },
  )
  return confirmOrderPayment
}

// mémorise la dernière réponse au chargement : un seul appel pour tout le site
export function useCart() {
  const store = useCartStore()
  if (import.meta.client && !store.cart && !store.loading)
    store.load()
  return store
}

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot))
