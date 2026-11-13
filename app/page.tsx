"use client";
import { useEffect, useState } from "react";
import Home from "@/components/Home";
import SaveApp from "@/components/SaveApp";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [saveId, setSaveId] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return saveId ? <SaveApp key={saveId} id={saveId} onExit={() => setSaveId(null)} /> : <Home onOpen={setSaveId} />;
}
