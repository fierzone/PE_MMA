import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Product } from '../types';

interface ProductContextType {
    products: Product[];
    isLoading: boolean;
    fetchProducts: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
    updateProduct: (product: Product) => Promise<boolean>;
    deleteProduct: (id: number) => Promise<boolean>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
    const db = useSQLiteContext();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const allRows = await db.getAllAsync<Product>('SELECT * FROM Products');
            setProducts(allRows);
        } catch (e) {
            console.error('Fetch products error:', e);
        } finally {
            setIsLoading(false);
        }
    }, [db]);

    const addProduct = async (data: Omit<Product, 'id'>) => {
        try {
            const result = await db.runAsync(
                'INSERT INTO Products (name, description, price, image, tier) VALUES (?, ?, ?, ?, ?)',
                [data.name, data.description, data.price, data.image, data.tier]
            );
            if (result.changes > 0) {
                await fetchProducts();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Add product error:', e);
            return false;
        }
    };

    const updateProduct = async (p: Product) => {
        try {
            const result = await db.runAsync(
                'UPDATE Products SET name = ?, description = ?, price = ?, image = ?, tier = ? WHERE id = ?',
                [p.name, p.description, p.price, p.image, p.tier, p.id]
            );
            if (result.changes > 0) {
                await fetchProducts();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Update product error:', e);
            return false;
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            const result = await db.runAsync('DELETE FROM Products WHERE id = ?', [id]);
            if (result.changes > 0) {
                await fetchProducts();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Delete product error:', e);
            return false;
        }
    };

    return (
        <ProductContext.Provider
            value={{ products, isLoading, fetchProducts, addProduct, updateProduct, deleteProduct }}
        >
            {children}
        </ProductContext.Provider>
    );
}

export function useProduct() {
    const ctx = useContext(ProductContext);
    if (!ctx) throw new Error('useProduct must be used within ProductProvider');
    return ctx;
}
