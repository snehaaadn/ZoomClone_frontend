"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Plus,
  PenTool,
  Eraser,
  RotateCcw,
  Presentation,
  Grid,
  FileSpreadsheet,
  Workflow,
  Sparkles,
} from "lucide-react";

export default function WhiteboardsPage() {
  const router = useRouter();
  const [activeColor, setActiveColor] = useState("#0E71EB");
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = tool === "eraser" ? 20 : lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : activeColor;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F7F9FA]">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNewMeetingClick={() => router.push("/")}
          onJoinClick={() => router.push("/join")}
          onScheduleClick={() => router.push("/")}
        />

        <main className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="max-w-6xl w-full mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Presentation className="w-5 h-5 text-[#0E71EB]" />
                  <span>Zoom Whiteboards</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Ideate, diagram, and collaborate asynchronously or in real-time meetings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearCanvas}
                  className="px-3 py-1.5 border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                  <span>Clear Canvas</span>
                </button>
              </div>
            </div>

            {/* Interactive Drawing Stage */}
            <div className="bg-white border border-[#E4E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="h-12 border-b border-gray-200 px-4 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTool("pen")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      tool === "pen"
                        ? "bg-blue-100 text-[#0E71EB]"
                        : "text-gray-600 hover:bg-gray-200/60"
                    }`}
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Pen</span>
                  </button>

                  <button
                    onClick={() => setTool("eraser")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      tool === "eraser"
                        ? "bg-blue-100 text-[#0E71EB]"
                        : "text-gray-600 hover:bg-gray-200/60"
                    }`}
                  >
                    <Eraser className="w-4 h-4" />
                    <span>Eraser</span>
                  </button>

                  <div className="h-5 w-px bg-gray-200" />

                  {/* Colors */}
                  <div className="flex items-center gap-1.5">
                    {["#0E71EB", "#E02828", "#23D160", "#F26D21", "#131619"].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setActiveColor(c);
                          setTool("pen");
                        }}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                          activeColor === c && tool === "pen" ? "scale-125 ring-2 ring-offset-1 ring-blue-500" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 font-medium">
                  Click and drag to draw directly on canvas
                </div>
              </div>

              {/* Canvas Board */}
              <div className="p-4 flex items-center justify-center bg-gray-100/50">
                <canvas
                  ref={canvasRef}
                  width={900}
                  height={420}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="rounded-xl border border-gray-200 shadow-sm cursor-crosshair max-w-full bg-white"
                />
              </div>
            </div>

            {/* Template gallery */}
            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Popular Whiteboard Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-white border border-[#E4E7EB] hover:border-[#0E71EB] rounded-xl transition-all shadow-xs cursor-pointer group">
                  <Workflow className="w-6 h-6 text-[#0E71EB] mb-2" />
                  <span className="font-bold text-gray-900 block">Sprint Retro Board</span>
                  <span className="text-gray-500 text-[11px] mt-0.5 block">What went well, what could improve</span>
                </div>
                <div className="p-4 bg-white border border-[#E4E7EB] hover:border-[#0E71EB] rounded-xl transition-all shadow-xs cursor-pointer group">
                  <Grid className="w-6 h-6 text-[#F26D21] mb-2" />
                  <span className="font-bold text-gray-900 block">Architecture Flowchart</span>
                  <span className="text-gray-500 text-[11px] mt-0.5 block">WebRTC mesh & peer signaling flows</span>
                </div>
                <div className="p-4 bg-white border border-[#E4E7EB] hover:border-[#0E71EB] rounded-xl transition-all shadow-xs cursor-pointer group">
                  <Sparkles className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="font-bold text-gray-900 block">Brainstorming Canvas</span>
                  <span className="text-gray-500 text-[11px] mt-0.5 block">Post-it notes and visual voting</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
