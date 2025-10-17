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

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<any | null>(null);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:3000/api/all-data"); // Replace with your API endpoint
        const data = await res.json();
        console.log("Fetched products:", data);
        setProducts(data.data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }
    fetchProducts();
  }, []);

  const handleSaveProduct = (product: any) => {
    console.log("Saving product:", product);
    // Add API call here to save edited product
    setEditProduct(null);
  };

  const handleDeleteProduct = (productId: string | undefined) => {
    console.log("Deleting product:", productId);
    // Add API call here to delete product
    setDeleteProduct(null);
    setProducts((prev) => prev.filter((p) => p.productId !== productId));
  };

  return (
    <TabsContent value="products" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Dialog>
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
                <Input id="productName" placeholder="Enter product name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="drink">Drink</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse">
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
                                defaultValue={editProduct?.name}
                                onChange={(e) =>
                                  setEditProduct({
                                    ...editProduct,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="editPrice">Price ($)</Label>
                              <Input
                                id="editPrice"
                                type="number"
                                step="0.01"
                                defaultValue={editProduct?.price}
                                onChange={(e) =>
                                  setEditProduct({
                                    ...editProduct,
                                    price: Number.parseFloat(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="editCategory">Category</Label>
                              <Select
                                defaultValue={editProduct?.category}
                                onValueChange={(value) =>
                                  setEditProduct({
                                    ...editProduct,
                                    category: value,
                                  })
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
                                defaultValue={editProduct?.description}
                                onChange={(e) =>
                                  setEditProduct({
                                    ...editProduct,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
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
                              This action cannot be undone. This will
                              permanently delete "{deleteProduct?.name}".
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
