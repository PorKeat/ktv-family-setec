"use client";

import React, { useEffect, useState } from "react";
import { TabsContent } from "./ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Plus } from "lucide-react";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

type Product = {
  productId: string;
  name: string;
  price: number;
  category: string;
  description: string;
};

export default function Order() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch products and customers
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/all-data`
        );
        const data = await res.json();

        const productsData = data.data.products || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCustomers(data.data.customers || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
    fetchData();
  }, []);

  // Apply search and category filters
  useEffect(() => {
    let tempProducts = [...products];

    if (selectedCategory !== "all") {
      tempProducts = tempProducts.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchTerm) {
      tempProducts = tempProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(tempProducts);
  }, [searchTerm, selectedCategory, products]);

  const addToOrder = (product: Product) => {
    setCurrentOrder((prev) => {
      const existing = prev.find((p) => p.productId === product.productId);
      if (existing) {
        return prev.map((p) =>
          p.productId === product.productId
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromOrder = (productId: string) => {
    setCurrentOrder((prev) => prev.filter((p) => p.productId !== productId));
  };

  const getTotalAmount = () => {
    return currentOrder.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const handleProcessOrder = () => {
    setIsModalOpen(true);
  };

  const handlePayment = () => {
    // Here you can integrate payment API or processing logic
    alert(`Payment of $${getTotalAmount().toFixed(2)} successful!`);
    setCurrentOrder([]);
    setSelectedCustomer("");
    setIsModalOpen(false);
  };

  return (
    <TabsContent value="orders" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search products..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Drink">Drink</SelectItem>
                    <SelectItem value="Snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                {filteredProducts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No products found
                  </p>
                )}
                {filteredProducts.map((product) => (
                  <Card
                    key={product.productId}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-500">
                            {product.description}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${product.price}</p>
                          <Button size="sm" onClick={() => addToOrder(product)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Order Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Order</CardTitle>
              <div className="grid gap-2">
                <Label htmlFor="orderCustomer">Customer</Label>
                <Select
                  value={selectedCustomer}
                  onValueChange={setSelectedCustomer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem
                        key={customer.customerId}
                        value={customer.customerId}
                      >
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentOrder.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No items in order
                  </p>
                ) : (
                  currentOrder.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          ${item.price} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromOrder(item.productId)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                {currentOrder.length > 0 && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>${getTotalAmount().toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        disabled={!selectedCustomer}
                        onClick={handleProcessOrder}
                      >
                        Process Order
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => setCurrentOrder([])}
                      >
                        Clear Order
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal for Order Details */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {currentOrder.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between items-center border-b pb-1"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center font-bold pt-2">
              <span>Total</span>
              <span>${getTotalAmount().toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment}>Pay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}
