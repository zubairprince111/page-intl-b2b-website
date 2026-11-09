import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { products, getShopProducts, type Product } from "./data";

export type CartLine = { slug: string; qty: number };
export type GarageVehicle = {
  platform?: string;
  make: string;
  model: string;
  year: string;
  engine: string;
} | null;

export type CartContextType = {
  lines: (CartLine & { product: Product })[];
  count: number;
  subtotal: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  vehicle: GarageVehicle;
  setVehicle: (v: GarageVehicle) => void;
  toast: string | null;
  isLoaded: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEYS = {
  cart: "page-cart",
  vehicle: "page-vehicle",
} as const;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [vehicle, setVehicleState] = useState<GarageVehicle>(null);
  const [toast, setToast] = useState<string | null>(null);
  const isLoadedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial Load: Read persisted cart from localStorage ONCE on mount
  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(STORAGE_KEYS.cart);
      if (rawCart) {
        const parsed = JSON.parse(rawCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLines(parsed);
        }
      }

      const rawVehicle = localStorage.getItem(STORAGE_KEYS.vehicle);
      if (rawVehicle) {
        const parsedV = JSON.parse(rawVehicle);
        if (parsedV) {
          setVehicleState(parsedV);
        }
      }
    } catch (err) {
      console.warn("Could not restore cart from storage:", err);
    } finally {
      isLoadedRef.current = true;
      setIsLoaded(true);
    }
  }, []);

  // 2. Persist to localStorage whenever lines change, but ONLY AFTER initial load has completed!
  // This prevents an initial empty [] state from wiping out existing localStorage data on refresh.
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(lines));
      window.dispatchEvent(new CustomEvent("page_cart_updated", { detail: lines }));
    } catch (err) {
      console.warn("Could not persist cart to storage:", err);
    }
  }, [lines]);

  // 3. Multi-Tab & Storage Synchronization
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.cart) {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          if (Array.isArray(next)) {
            setLines(next);
          }
        } catch {
          // ignore
        }
      }
      if (e.key === STORAGE_KEYS.vehicle) {
        try {
          const nextV = e.newValue ? JSON.parse(e.newValue) : null;
          setVehicleState(nextV);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const add = (slug: string, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((item) => item.slug === slug);
      if (existing) {
        return prev.map((item) => (item.slug === slug ? { ...item, qty: item.qty + qty } : item));
      }
      return [...prev, { slug, qty }];
    });

    const catalog = getShopProducts();
    const product = catalog.find((p) => p.slug === slug) || products.find((p) => p.slug === slug);
    flash(product ? `Added ${product.name} to quotation cart` : "Added item to cart");
  };

  const setQty = (slug: string, qty: number) => {
    const safeQty = Math.max(1, Math.floor(qty));
    setLines((prev) => prev.map((item) => (item.slug === slug ? { ...item, qty: safeQty } : item)));
  };

  const remove = (slug: string) => {
    setLines((prev) => prev.filter((item) => item.slug !== slug));
  };

  const clear = () => {
    setLines([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.cart);
    } catch {
      // ignore
    }
  };

  const setVehicle = (v: GarageVehicle) => {
    setVehicleState(v);
    try {
      if (v) {
        localStorage.setItem(STORAGE_KEYS.vehicle, JSON.stringify(v));
        flash(`Saved ${v.make} ${v.model} to garage`);
      } else {
        localStorage.removeItem(STORAGE_KEYS.vehicle);
      }
    } catch {
      // ignore
    }
  };

  // Map slugs to product entities
  const catalog = getShopProducts();
  const fullLines: (CartLine & { product: Product })[] = lines
    .map((l) => {
      const product =
        catalog.find((p) => p.slug === l.slug) || products.find((p) => p.slug === l.slug);
      return product ? { ...l, product } : null;
    })
    .filter((l): l is CartLine & { product: Product } => Boolean(l));

  const count = fullLines.reduce((acc, l) => acc + l.qty, 0);
  const subtotal = fullLines.reduce((acc, l) => acc + l.qty * (l.product.price || 0), 0);

  return (
    <CartContext.Provider
      value={{
        lines: fullLines,
        count,
        subtotal,
        add,
        setQty,
        remove,
        clear,
        vehicle,
        setVehicle,
        toast,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

const defaultCartCtx: CartContextType = {
  lines: [],
  count: 0,
  subtotal: 0,
  add: () => {},
  setQty: () => {},
  remove: () => {},
  clear: () => {},
  vehicle: null,
  setVehicle: () => {},
  toast: null,
  isLoaded: false,
};

export function useCart() {
  const ctx = useContext(CartContext);
  return ctx ?? defaultCartCtx;
}
