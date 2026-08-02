export {
  addCartQuantities,
  calculateCartTotalMinor,
  calculateLineTotalMinor,
  canDecrementCartQuantity,
  canIncrementCartQuantity,
  createCartQuantityRules,
  decrementCartQuantity,
  formatCartMoney,
  incrementCartQuantity,
  isPositiveDecimal,
  normalizeCartQuantity,
} from './model/decimal';
export type { CartQuantityRules } from './model/decimal';
export { cartItemSchema, cartPersistedStateSchema } from './model/cart';
export type { CartItem, CartPersistedState } from './model/cart';
export {
  CART_STORAGE_KEY,
  CART_STORAGE_VERSION,
  migrateCartState,
  selectCartLineCount,
  useCartStore,
} from './model/cartStore';
export type { AddCartItemInput } from './model/cartStore';
export { useCartHydration } from './model/useCartHydration';
