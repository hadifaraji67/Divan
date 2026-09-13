export interface ProductStock {
  id: number;
  title: string;
  stock: number;
  minAlertStock: number;
}

export const checkLowStock = (products: ProductStock[]): ProductStock[] => {
  return products.filter(product => product.stock <= product.minAlertStock);
};

export const updateStockAfterSale = (products: ProductStock[], soldItems: { id: number; quantity: number }[]) => {
  return products.map(product => {
    const sold = soldItems.find(item => item.id === product.id);
    if (sold) {
      return { ...product, stock: Math.max(0, product.stock - sold.quantity) };
    }
    return product;
  });
};
