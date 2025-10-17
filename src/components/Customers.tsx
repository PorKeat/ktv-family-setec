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
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { Plus, Search } from "lucide-react";
import { Customer, Membership } from "@/types/customerType";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});
  const [newMembershipId, setNewMembershipId] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch customers & memberships
  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (data.success) setCustomers(data.data);

      const membershipRes = await fetch("/api/memberships");
      const membershipsData = await membershipRes.json();
      if (membershipsData.success) setMemberships(membershipsData.data);
    }
    fetchData();
  }, []);

  // Add customer
  const handleAddCustomer = async () => {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newCustomer, membershipId: newMembershipId }),
    });
    const data = await res.json();
    if (data.success) {
      setCustomers((prev) => [...prev, data.data]);
      setNewCustomer({});
      setNewMembershipId("");
    }
  };

  // Update customer
  const handleUpdateCustomer = async (customer: Customer) => {
    setIsUpdating(true);
    try {
      const { _id, ...updateData } = customer;
      const res = await fetch(`/api/customers/${customer.customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      console.log("PUT response:", data, "Status:", res.status);

      if (data.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.customerId === customer.customerId ? data.data : c
          )
        );
        setEditCustomer(null);
      } else {
        console.error("Update failed:", data.message);
        setErrorMessage(data.message); // Assuming you added errorMessage state
      }
    } catch (err) {
      console.error("Update failed:", err);
      setErrorMessage("An error occurred while updating the customer.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    const res = await fetch(`/api/customers/${customerId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      setCustomers((prev) => prev.filter((c) => c.customerId !== customerId));
      setDeleteCustomer(null);
    }
  };

  return (
    <TabsContent value="customers" className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>

        {/* Add Customer Modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[450px] max-h-[80vh] overflow-y-auto rounded-2xl backdrop-blur-md bg-white/80 shadow-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-800">
                Add New Customer
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Fill in the information below to create a new customer.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Input
                placeholder="Full Name"
                value={newCustomer.name || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              <Input
                placeholder="Email"
                type="email"
                value={newCustomer.email || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              <Input
                placeholder="Phone"
                value={newCustomer.phone || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              <Textarea
                placeholder="Address"
                value={newCustomer.address || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
                className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              <Select
                value={newMembershipId}
                onValueChange={setNewMembershipId}
              >
                <SelectTrigger className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400">
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

            <DialogFooter>
              <Button className="rounded-xl" onClick={handleAddCustomer}>
                Add Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex space-x-2">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Customers Table */}
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
              {customers
                .filter((c) =>
                  c.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((customer) => {
                  const membership = memberships.find(
                    (m) => m.membershipId === customer.membershipId
                  );
                  return (
                    <TableRow key={customer.customerId}>
                      <TableCell>{customer.customerId}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.address}</TableCell>
                      <TableCell>
                        {membership && <Badge>{membership.type}</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {/* Edit Modal */}
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
                                className="rounded-xl"
                                onClick={() => setEditCustomer(customer)}
                              >
                                Edit
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[450px] max-h-[80vh] overflow-y-auto rounded-2xl backdrop-blur-md bg-white/80 shadow-lg p-6">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-gray-800">
                                  Edit Customer
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-500">
                                  Make changes to this customer’s information.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid gap-4 py-4">
                                <Input
                                  placeholder="Full Name"
                                  className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
                                  value={editCustomer?.name || ""}
                                  onChange={(e) =>
                                    setEditCustomer({
                                      ...editCustomer!,
                                      name: e.target.value,
                                    })
                                  }
                                />
                                <Input
                                  placeholder="Email"
                                  type="email"
                                  className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
                                  value={editCustomer?.email || ""}
                                  onChange={(e) =>
                                    setEditCustomer({
                                      ...editCustomer!,
                                      email: e.target.value,
                                    })
                                  }
                                />
                                <Input
                                  placeholder="Phone"
                                  className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
                                  value={editCustomer?.phone || ""}
                                  onChange={(e) =>
                                    setEditCustomer({
                                      ...editCustomer!,
                                      phone: e.target.value,
                                    })
                                  }
                                />
                                <Textarea
                                  placeholder="Address"
                                  className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
                                  value={editCustomer?.address || ""}
                                  onChange={(e) =>
                                    setEditCustomer({
                                      ...editCustomer!,
                                      address: e.target.value,
                                    })
                                  }
                                />
                                <Select
                                  value={editCustomer?.membershipId || ""}
                                  onValueChange={(value) =>
                                    setEditCustomer({
                                      ...editCustomer!,
                                      membershipId: value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400">
                                    <SelectValue placeholder="Select membership" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {memberships.map((m) => (
                                      <SelectItem
                                        key={m.membershipId}
                                        value={m.membershipId}
                                      >
                                        {m.type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <DialogFooter>
                                {errorMessage && (
                                  <p className="text-red-500 text-sm mt-2">
                                    {errorMessage}
                                  </p>
                                )}
                                <Button
                                  className="rounded-xl"
                                  onClick={() =>
                                    editCustomer &&
                                    handleUpdateCustomer(editCustomer)
                                  }
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? "Saving..." : "Save Changes"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Delete Modal */}
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
                                variant="destructive"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => setDeleteCustomer(customer)}
                              >
                                Delete
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[400px] rounded-2xl backdrop-blur-md bg-white/80 shadow-lg p-6">
                              <DialogHeader>
                                <DialogTitle className="text-lg font-semibold">
                                  Confirm Delete
                                </DialogTitle>
                                <DialogDescription className="text-gray-600">
                                  Are you sure you want to delete{" "}
                                  <span className="font-medium text-red-500">
                                    {deleteCustomer?.name}
                                  </span>
                                  ? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>

                              <DialogFooter className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setDeleteCustomer(null)}
                                  className="rounded-xl"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="rounded-xl"
                                  onClick={() =>
                                    deleteCustomer &&
                                    handleDeleteCustomer(
                                      deleteCustomer.customerId
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
