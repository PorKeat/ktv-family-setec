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

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [editRoom, setEditRoom] = useState<any | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<any | null>(null);

  // Fetch rooms data
  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("http://localhost:3000/api/all-data"); // Replace with your API endpoint
        const data = await res.json();
        console.log("Raw room data received:", data);

        setRooms(data.data.rooms || []);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    }
    fetchRooms();
  }, []);

  const handleSaveRoom = (room: any) => {
    console.log("Saving room:", room);
    // Implement API call to save edited room
    setEditRoom(null);
  };

  const handleDeleteRoom = (roomId: string | undefined) => {
    console.log("Deleting room:", roomId);
    // Implement API call to delete room
    setDeleteRoom(null);
    setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
  };

  return (
    <TabsContent value="rooms" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Room Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
              <DialogDescription>Create a new karaoke room</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input id="roomName" placeholder="e.g., Standard Room 4" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="roomType">Room Type</Label>
                <Select>
                  <SelectTrigger>
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
                <Label htmlFor="pricePerHour">Price per Hour ($)</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity (people)</Label>
                <Input id="capacity" type="number" placeholder="e.g., 6" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="roomDescription">Description</Label>
                <Textarea
                  id="roomDescription"
                  placeholder="Enter room description and features"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Room</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card
            key={room.roomId}
            className={`${
              !room.available
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <CardDescription>{room.type} Room</CardDescription>
                </div>
                <Badge variant={room.available ? "secondary" : "destructive"}>
                  {room.available ? "Available" : "Occupied"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{room.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">
                    ${room.pricePerHour}/hour
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Book
                    </Button>

                    {/* Edit Room Dialog */}
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
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Room</DialogTitle>
                          <DialogDescription>
                            Modify room details.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="editRoomName">Room Name</Label>
                            <Input
                              id="editRoomName"
                              defaultValue={editRoom?.name}
                              onChange={(e) =>
                                setEditRoom({
                                  ...editRoom,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="editRoomType">Room Type</Label>
                            <Select
                              defaultValue={editRoom?.type}
                              onValueChange={(value) =>
                                setEditRoom({ ...editRoom, type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select room type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Standard">
                                  Standard
                                </SelectItem>
                                <SelectItem value="VIP">VIP</SelectItem>
                                <SelectItem value="Family">Family</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="editPricePerHour">
                              Price per Hour ($)
                            </Label>
                            <Input
                              id="editPricePerHour"
                              type="number"
                              step="0.01"
                              defaultValue={editRoom?.pricePerHour}
                              onChange={(e) =>
                                setEditRoom({
                                  ...editRoom,
                                  pricePerHour: Number.parseFloat(
                                    e.target.value
                                  ),
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="editCapacity">
                              Capacity (people)
                            </Label>
                            <Input
                              id="editCapacity"
                              type="number"
                              defaultValue={editRoom?.capacity}
                              onChange={(e) =>
                                setEditRoom({
                                  ...editRoom,
                                  capacity: Number.parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="editRoomDescription">
                              Description
                            </Label>
                            <Textarea
                              id="editRoomDescription"
                              defaultValue={editRoom?.description}
                              onChange={(e) =>
                                setEditRoom({
                                  ...editRoom,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={() => handleSaveRoom(editRoom)}
                          >
                            Save changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Room Dialog */}
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
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the room "{deleteRoom?.name}".
                          </DialogDescription>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  );
}
