"use client";

import React, { useEffect, useState } from "react";
import { TabsContent } from "./ui/tabs";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "./ui/card";
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
import { Plus, Clock } from "lucide-react";

interface Room {
  _id?: string;
  roomId: string;
  name: string;
  type: string;
  pricePerHour: number;
  description: string;
  available: boolean;
  capacity: number;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState<Omit<Room, "roomId" | "available">>({
    name: "",
    type: "",
    pricePerHour: 0,
    description: "",
    capacity: 0,
  });

  // Fetch rooms
  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("/api/rooms");
        const data = await res.json();
        setRooms(data.data || []);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    }
    fetchRooms();
  }, []);

  // Add Room
  const handleAddRoom = async () => {
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoom),
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) => [...prev, data.data]);
        setNewRoom({
          name: "",
          type: "",
          pricePerHour: 0,
          description: "",
          capacity: 0,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Room
  const handleSaveRoom = async (room: Room | null) => {
    if (!room || !room.roomId) return;

    try {
      const body = {
        roomId: room.roomId,
        name: room.name,
        type: room.type,
        pricePerHour: room.pricePerHour,
        description: room.description,
        capacity: room.capacity,
        available: room.available,
      };

      const res = await fetch("/api/rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        setRooms((prev) =>
          prev.map((r) => (r.roomId === room.roomId ? { ...r, ...body } : r))
        );
        setEditRoom(null); // Close modal
      } else {
        console.error("Update failed:", data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId: string | undefined) => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms?roomId=${roomId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
        setDeleteRoom(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Custom classes for inputs
  const inputClass =
    "border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return (
    <TabsContent value="rooms" className="space-y-6">
      {/* Header & Add Room */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Room Management</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
              <DialogDescription>Create a new karaoke room</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Room Name</Label>
                <Input
                  className={inputClass}
                  value={newRoom.name}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Room Type</Label>
                <Select
                  value={newRoom.type}
                  onValueChange={(value) =>
                    setNewRoom({ ...newRoom, type: value })
                  }
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Price per Hour ($)</Label>
                <Input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  value={newRoom.pricePerHour}
                  onChange={(e) =>
                    setNewRoom({
                      ...newRoom,
                      pricePerHour: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Capacity</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={newRoom.capacity}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, capacity: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  className={inputClass}
                  value={newRoom.description}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={async () => {
                  await handleAddRoom();
                  setAddDialogOpen(false);
                }}
              >
                Add Room
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-auto">
        {rooms.map((room) => (
          <Card
            key={room.roomId}
            className={`${
              room.available
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{room.name}</CardTitle>
                  <CardDescription>{room.type} Room</CardDescription>
                </div>
                <Badge variant={room.available ? "secondary" : "destructive"}>
                  {room.available ? "Available" : "Occupied"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{room.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold">
                  ${room.pricePerHour}/hour
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-1" />
                    Book
                  </Button>

                  {/* Edit Dialog */}
                  <Dialog
                    open={editRoom?.roomId === room.roomId}
                    onOpenChange={(open) => !open && setEditRoom(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditRoom(room)}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-lg">
                      <DialogHeader>
                        <DialogTitle>Edit Room</DialogTitle>
                        <DialogDescription>
                          Modify room details.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Room Name</Label>
                          <Input
                            className={inputClass}
                            value={editRoom?.name || ""}
                            onChange={(e) =>
                              setEditRoom(
                                (prev) =>
                                  prev && { ...prev, name: e.target.value }
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Room Type</Label>
                          <Select
                            value={editRoom?.type || ""}
                            onValueChange={(value) =>
                              setEditRoom(
                                (prev) => prev && { ...prev, type: value }
                              )
                            }
                          >
                            <SelectTrigger className={inputClass}>
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard">Standard</SelectItem>
                              <SelectItem value="VIP">VIP</SelectItem>
                              <SelectItem value="Family">Family</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Price per Hour</Label>
                          <Input
                            className={inputClass}
                            type="number"
                            step="0.01"
                            value={editRoom?.pricePerHour || 0}
                            onChange={(e) =>
                              setEditRoom(
                                (prev) =>
                                  prev && {
                                    ...prev,
                                    pricePerHour: Number(e.target.value),
                                  }
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Capacity</Label>
                          <Input
                            className={inputClass}
                            type="number"
                            value={editRoom?.capacity || 0}
                            onChange={(e) =>
                              setEditRoom(
                                (prev) =>
                                  prev && {
                                    ...prev,
                                    capacity: Number(e.target.value),
                                  }
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Description</Label>
                          <Textarea
                            className={inputClass}
                            value={editRoom?.description || ""}
                            onChange={(e) =>
                              setEditRoom(
                                (prev) =>
                                  prev && {
                                    ...prev,
                                    description: e.target.value,
                                  }
                              )
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          onClick={() => handleSaveRoom(editRoom)}
                        >
                          Save changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Dialog */}
                  <Dialog
                    open={deleteRoom?.roomId === room.roomId}
                    onOpenChange={(open) => !open && setDeleteRoom(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteRoom(room)}
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white rounded-lg shadow-lg">
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>{`This will permanently delete "${deleteRoom?.name}".`}</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteRoom(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteRoom(deleteRoom?.roomId)}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  );
}
