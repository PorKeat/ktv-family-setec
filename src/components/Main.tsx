"use client";

import React, { useState } from "react";
import {
  CalendarIcon,
  Home,
  Mic,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import Booking from "@/components/Booking";
import Order from "@/components/Order";
import Customers from "@/components/Customers";
import Rooms from "@/components/Rooms";
import Products from "@/components/Products";

export default function Main() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { value: "dashboard", label: "Dashboard", icon: Home },
    { value: "bookings", label: "Bookings", icon: CalendarIcon },
    { value: "orders", label: "Orders", icon: ShoppingCart },
    { value: "customers", label: "Customers", icon: Users },
    { value: "rooms", label: "Rooms", icon: Mic },
    { value: "products", label: "Products", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Mic className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Karaoke Family POS
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Today: {format(new Date(), "PPP")}
              </span>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Staff: Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Dashboard */}
          <Dashboard />

          {/* Bookings */}
          <Booking />

          {/* Orders */}
          <Order />

          {/* Customers */}
          <Customers />

          {/* Rooms */}
          <Rooms />

          {/* Products */}
          <Products />
        </Tabs>
      </main>
    </div>
  );
}
