"use client";

import { Show, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import type React from "react";

interface TryBookwormButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function TryBookwormButton({ className, children = "Try Bookworm" }: TryBookwormButtonProps) {
  return (
    <>
      <Show when="signed-in">
        <Link href="/dashboard" className={className}>
          {children}
        </Link>
      </Show>
      <Show when="signed-out">
        <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
          <button type="button" className={className}>
            {children}
          </button>
        </SignUpButton>
      </Show>
    </>
  );
}
