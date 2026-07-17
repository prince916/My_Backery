import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/index';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart,    setCart]    = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await cartService.getCart();
      setCart(data.cart);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (item) => {
    try {
      const { data } = await cartService.addToCart(item);
      setCart(data.cart);
      toast.success(`${item.name || 'Item'} added to cart! 🛒`);
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    }
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    try {
      const { data } = await cartService.updateItem(itemId, quantity);
      setCart(data.cart);
    } catch (err) {
      toast.error(err.message || 'Failed to update cart');
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      const { data } = await cartService.removeItem(itemId);
      setCart(data.cart);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      setCart({ items: [], subtotal: 0, totalItems: 0 });
    } catch { /* ignore */ }
  }, []);

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal  = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      subtotal,
      loading,
      addToCart,
      updateItem,
      removeItem,
      clearCart,
      refetchCart: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
