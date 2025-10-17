"use client";

import React, { useEffect, useState } from "react";
import { TabsContent } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { Plus } from "lucide-react";

interface Product {
  productId: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    category: "",
    description: "",
  });

  // Fetch products from /api/products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product
  const handleAddProduct = async () => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => [...prev, data.data]);
        setNewProduct({ name: "", price: 0, category: "", description: "" });
        setAddDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  // Save/Edit product
  const handleSaveProduct = async (product: Product | null) => {
    if (!product) return;
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.productId === product.productId ? product : p))
        );
        setEditProduct(null);
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string | undefined) => {
    if (!productId) return;
    try {
      const res = await fetch(`/api/products?productId=${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.productId !== productId));
        setDeleteProduct(null);
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <TabsContent value="products" className="space-y-6">
      {/* Header + Add Product */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your menu
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(value) =>
                    setNewProduct((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Drink">Drink</SelectItem>
                    <SelectItem value="Snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter product description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleAddProduct}>
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Table */}
      <Card>
        <CardContent className="px-6 overflow-x-auto max-h-140">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b">
                <th className="p-2">Product ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Price</th>
                <th className="p-2">Description</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId} className="border-b">
                  <td className="p-2 font-medium">{product.productId}</td>
                  <td className="p-2">{product.name}</td>
                  <td className="p-2">
                    <Badge variant="outline">{product.category}</Badge>
                  </td>
                  <td className="p-2 font-bold">${product.price}</td>
                  <td className="p-2 max-w-xs truncate">
                    {product.description}
                  </td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      {/* Edit Product */}
                      <Dialog
                        open={editProduct?.productId === product.productId}
                        onOpenChange={(open) => !open && setEditProduct(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditProduct(product)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>
                              Modify product details.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="editProductName">
                                Product Name
                              </Label>
                              <Input
                                id="editProductName"
                                value={editProduct?.name || ""}
                                onChange={(e) =>
                                  setEditProduct((prev) =>
                                    prev
                                      ? { ...prev, name: e.target.value }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="editPrice">Price ($)</Label>
                              <Input
                                id="editPrice"
                                type="number"
                                step="0.01"
                                value={editProduct?.price || 0}
                                onChange={(e) =>
                                  setEditProduct((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          price: Number(e.target.value),
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="editCategory">Category</Label>
                              <Select
                                value={editProduct?.category || ""}
                                onValueChange={(value) =>
                                  setEditProduct((prev) =>
                                    prev ? { ...prev, category: value } : prev
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Food">Food</SelectItem>
                                  <SelectItem value="Drink">Drink</SelectItem>
                                  <SelectItem value="Snack">Snack</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="editDescription">
                                Description
                              </Label>
                              <Textarea
                                id="editDescription"
                                value={editProduct?.description || ""}
                                onChange={(e) =>
                                  setEditProduct((prev) =>
                                    prev
                                      ? { ...prev, description: e.target.value }
                                      : prev
                                  )
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              onClick={() => handleSaveProduct(editProduct)}
                            >
                              Save changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Delete Product */}
                      <Dialog
                        open={deleteProduct?.productId === product.productId}
                        onOpenChange={(open) => !open && setDeleteProduct(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteProduct(product)}
                          >
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                              {`This action cannot be undone. This will permanently delete "${deleteProduct?.name}".`}
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteProduct(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleDeleteProduct(deleteProduct?.productId)
                              }
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
