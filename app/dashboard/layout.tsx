// app/dashboard/layout.tsx
"use client";
import React from "react";
import PrivateRoute from "@/components/editor/PrivateRoute";
import FamosaFooter from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateRoute>
      <section className="pb-20 md:pb-0">
        {children}
      </section>
      <MobileNav />
      <FamosaFooter />
    </PrivateRoute>
   
  );
}