import { createContext, useContext, useState } from "react";

const StockContext = createContext();

export function StockProvider({ children }) {
  const [stock, setStock] = useState({
    "Steel Rods": {
      total: 100,
      warehouses: {
        "Main Warehouse": 100,
        "Production Rack": 0,
      },
    },
  });

  const [operations, setOperations] = useState([]);

  const addReceipt = (product, quantity, warehouse) => {
    setStock((currentStock) => {
      const existingProduct = currentStock[product] || {
        total: 0,
        warehouses: {},
      };

      return {
        ...currentStock,
        [product]: {
          total: existingProduct.total + quantity,
          warehouses: {
            ...existingProduct.warehouses,
            [warehouse]:
              (existingProduct.warehouses[warehouse] || 0) + quantity,
          },
        },
      };
    });

    setOperations((current) => [
      ...current,
      {
        type: "Receipt",
        product,
        quantity: `+${quantity} kg`,
        warehouse,
        status: "Done",
      },
    ]);
  };

  const addTransfer = (product, quantity, from, to) => {
    setStock((currentStock) => {
      const existingProduct = currentStock[product];

      if (!existingProduct) {
        return currentStock;
      }

      return {
        ...currentStock,
        [product]: {
          total: existingProduct.total,
          warehouses: {
            ...existingProduct.warehouses,
            [from]: (existingProduct.warehouses[from] || 0) - quantity,
            [to]: (existingProduct.warehouses[to] || 0) + quantity,
          },
        },
      };
    });

    setOperations((current) => [
      ...current,
      {
        type: "Transfer",
        product,
        quantity: `${quantity} kg`,
        warehouse: `${from} → ${to}`,
        status: "Done",
      },
    ]);
  };

  const addDelivery = (product, quantity, warehouse) => {
    setStock((currentStock) => {
      const existingProduct = currentStock[product];

      if (!existingProduct) {
        return currentStock;
      }

      return {
        ...currentStock,
        [product]: {
          total: existingProduct.total - quantity,
          warehouses: {
            ...existingProduct.warehouses,
            [warehouse]:
              (existingProduct.warehouses[warehouse] || 0) - quantity,
          },
        },
      };
    });

    setOperations((current) => [
      ...current,
      {
        type: "Delivery",
        product,
        quantity: `-${quantity} kg`,
        warehouse,
        status: "Done",
      },
    ]);
  };

  const addAdjustment = (product, quantity, warehouse, reason) => {
    setStock((currentStock) => {
      const existingProduct = currentStock[product];

      if (!existingProduct) {
        return currentStock;
      }

      return {
        ...currentStock,
        [product]: {
          total: existingProduct.total - quantity,
          warehouses: {
            ...existingProduct.warehouses,
            [warehouse]:
              (existingProduct.warehouses[warehouse] || 0) - quantity,
          },
        },
      };
    });

    setOperations((current) => [
      ...current,
      {
        type: "Adjustment",
        product,
        quantity: `-${quantity} kg`,
        warehouse,
        reason,
        status: "Done",
      },
    ]);
  };

  return (
    <StockContext.Provider
      value={{
        stock,
        operations,
        addReceipt,
        addTransfer,
        addDelivery,
        addAdjustment,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  return useContext(StockContext);
}