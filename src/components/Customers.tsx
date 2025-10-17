"use client";

import React, { useEffect, useState } from "react";
import { TabsContent } from "./ui/tabs";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
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
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { Plus, Search } from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [editCustomer, setEditCustomer] = useState<any | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<any | null>(null);

  // Fetch customers and memberships
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:3000/api/all-data");
        const data = await res.json();
        console.log("Raw data received:", data);

        setCustomers(data.data.customers || []);
        setMemberships(data.data.memberships || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
    fetchData();
  }, []);

  const handleSaveCustomer = (customer: any) => {
    console.log("Saving customer:", customer);
    // Implement API call to save edited customer
    setEditCustomer(null);
  };

  const handleDeleteCustomer = (customerId: string | undefined) => {
    console.log("Deleting customer:", customerId);
    // Implement API call to delete customer
    setDeleteCustomer(null);
    setCustomers((prev) => prev.filter((c) => c.customerId !== customerId));
  };

  return (
    <TabsContent value="customers" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Create a new customer profile
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter customer name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Enter address" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="membership">Membership Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership" />
                  </SelectTrigger>
                  <SelectContent>
                    {memberships.map((m) => (
                      <SelectItem key={m.membershipId} value={m.membershipId}>
                        {m.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Customer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex space-x-2">
            <Input placeholder="Search customers..." className="max-w-sm" />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const membership = memberships.find(
                  (m) => m.membershipId === customer.membershipId
                );
                return (
                  <TableRow key={customer.customerId}>
                    <TableCell className="font-medium">
                      {customer.customerId}
                    </TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>
                      {membership && (
                        <Badge variant="secondary">{membership.type}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {/* Edit Dialog */}
                        <Dialog
                          open={
                            editCustomer?.customerId === customer.customerId
                          }
                          onOpenChange={(open) =>
                            !open && setEditCustomer(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditCustomer(customer)}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Customer</DialogTitle>
                              <DialogDescription>
                                Make changes to customer profile.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="editName">Full Name</Label>
                                <Input
                                  id="editName"
                                  defaultValue={editCustomer?.name}
                                  onChange={(e) =>
                                    setEditCustomer({
                                      ...editCustomer,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="editEmail">Email</Label>
                                <Input
                                  id="editEmail"
                                  type="email"
                                  defaultValue={editCustomer?.email}
                                  onChange={(e) =>
                                    setEditCustomer({
                                      ...editCustomer,
                                      email: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="editPhone">Phone</Label>
                                <Input
                                  id="editPhone"
                                  defaultValue={editCustomer?.phone}
                                  onChange={(e) =>
                                    setEditCustomer({
                                      ...editCustomer,
                                      phone: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="editAddress">Address</Label>
                                <Textarea
                                  id="editAddress"
                                  defaultValue={editCustomer?.address}
                                  onChange={(e) =>
                                    setEditCustomer({
                                      ...editCustomer,
                                      address: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="editMembership">
                                  Membership Type
                                </Label>
                                <Select
                                  defaultValue={membership?.type}
                                  onValueChange={(value) =>
                                    setEditCustomer({
                                      ...editCustomer,
                                      membershipId: value,
                                    })
                                  }
                                >
                                  {memberships.map((m) => (
                                    <SelectItem
                                      key={m.membershipId}
                                      value={m.membershipId}
                                    >
                                      {m.type}
                                    </SelectItem>
                                  ))}
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                onClick={() => handleSaveCustomer(editCustomer)}
                              >
                                Save changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Delete Dialog */}
                        <Dialog
                          open={
                            deleteCustomer?.customerId === customer.customerId
                          }
                          onOpenChange={(open) =>
                            !open && setDeleteCustomer(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteCustomer(customer)}
                            >
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Are you absolutely sure?
                              </DialogTitle>
                              <DialogDescription>
                                This action cannot be undone. This will
                                permanently delete the customer "
                                {deleteCustomer?.name}".
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setDeleteCustomer(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteCustomer(
                                    deleteCustomer?.customerId
                                  )
                                }
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
