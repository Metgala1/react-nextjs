// components/ModalWrapper.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ModalWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Optional: Close on ESC key press for better UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/products");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return <>{children}</>;
}
