"use client";
// Transcript — live streaming transcript panel
// Displays user (right-aligned) and AI (left-aligned) messages in real time
// Powered by Vapi's transcript.partial and transcript.final events

import { ITranscriptMessage } from "@/types";

interface TranscriptProps {
  messages: ITranscriptMessage[];
}

export default function Transcript({ messages }: TranscriptProps) {
  // TODO: Implement scrollable transcript panel with message styling
  return (
    <div>
      {messages.map((msg, i) => (
        <p key={i} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
          {msg.content}
        </p>
      ))}
    </div>
  );
}
