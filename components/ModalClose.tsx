"use client";

import { useRouter } from "next/navigation";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function ModalClose({ className, children }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={className}
    >
      {children}
    </button>
  );
}