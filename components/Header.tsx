"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all ${scrolled ? "bg-white/90 backdrop-blur-md py-4 border-b-4 border-black" : "py-8"}`}>
      <div className="wrapper flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-xl" />
          BOOKWORM
        </Link>
        <nav className="hidden md:flex items-center gap-12 font-bold uppercase text-sm tracking-widest">
          <a href="#features" className="hover:text-peach transition-colors">Features</a>
          <a href="#how" className="hover:text-peach transition-colors">Process</a>
          <a href="#voices" className="hover:text-peach transition-colors">Voices</a>
          <div className="w-[2px] h-4 bg-black/10 mx-2" />
          <Link href="/sign-in">Log In</Link>
          <Link href="/sign-up" className="btn btn--primary py-3 px-8">Sign Up</Link>
        </nav>
      </div>
    </header>
  );
}
