"use client";
// VapiControls — mic button, session status indicator, session timer
// States: idle | connecting | listening | thinking | speaking | ended

import { useVapi } from "@/hooks/useVapi";

interface VapiControlsProps {
  bookId: string;
  bookTitle: string;
  author: string;
}

export default function VapiControls({ bookId, bookTitle, author }: VapiControlsProps) {
  const { status, startSession, stopSession } = useVapi();

  // TODO: Implement full voice UI with status indicators and animated feedback
  return (
    <div>
      <p>Status: {status}</p>
      <button onClick={() => startSession({ bookId, bookTitle, author })}>
        Start Voice Session
      </button>
      <button onClick={stopSession}>Stop</button>
    </div>
  );
}
