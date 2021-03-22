import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });
  
  const addProduct = async (productId: number) => {
    try {
      const findCartProducts = cart.find(product => product.id === productId)

      if (findCartProducts) {
        const productToUpdateAmount = {
          productId: findCartProducts.id,
          amount: findCartProducts.amount += 1
        }

        console.log("ADD PRODUCT")

        updateProductAmount(productToUpdateAmount)
      } else {
        let product = await api.get(`/products/${productId}`).then(response => response.data);

        product = {
          ...product,
          amount: 1
        }

        setCart([...cart, product])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, product]))
      }
    } catch {
      toast.error('Quantidade solicitada fora de estoque');
    }
  };
 
  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const findProductToUpdate = await api.get(`/stock/${productId}`).then(response => response.data)

      if (findProductToUpdate.amount < amount) {
        toast.error("Produto fora de estoque");
      } else {
        findProductToUpdate.amount = amount
        setCart([...cart])
  
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart]))
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
