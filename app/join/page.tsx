"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { JoinModal } from "@/components/modals/JoinModal";
import { useRouter } from "next/navigation";

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const pwd = searchParams.get("pwd") || "";

  return (
    <JoinModal
      isOpen={true}
      onClose={() => router.push("/")}
      defaultMeetingId={id}
      defaultPasscode={pwd}
    />
  );
}

export default function JoinPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F7F9FA]">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNewMeetingClick={() => router.push("/")}
          onJoinClick={() => {}}
          onScheduleClick={() => router.push("/")}
        />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Suspense fallback={<div className="text-gray-500 text-sm">Loading join interface...</div>}>
            <JoinContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
