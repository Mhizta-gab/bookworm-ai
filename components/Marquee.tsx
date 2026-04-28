"use client";

export default function Marquee() {
  const items = ["PDF to Speech", "AI Book Personas", "Infinite Library", "Voice-First", "No Hallucinations"]; 
  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {[...items, ...items].map((item, i) => (
          <span key={i} className={`marquee-item ${i % 2 === 0 ? "marquee-item--outline" : ""}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
