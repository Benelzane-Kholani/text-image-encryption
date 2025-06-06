'use client';
import Link from "next/link";
import { useState } from "react";
import './../css/navBar.css';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-neutral-900 border-b border-indigo-500">
      <div className="flex justify-between items-center p-4">
        <Link href="/" className="text-zinc-300 navBarLogo">TextImageEncryption</Link>

        {/* Hamburger Icon */}
        <button 
          className="text-zinc-300 md:hidden" 
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
          <Link href="#" className="text-zinc-300 nav-link">encrypt-image</Link>
          <Link href="#" className="text-zinc-300 nav-link">encrypt-text</Link>
          <Link href="#" className="text-zinc-300 nav-link">help</Link>
          <Link href="#" className="text-zinc-300 nav-link">about</Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="flex flex-col md:hidden px-4 pb-4 gap-2">
          <Link href="#" className="text-zinc-300 nav-link">encrypt-image</Link>
          <Link href="#" className="text-zinc-300 nav-link">encrypt-text</Link>
          <Link href="#" className="text-zinc-300 nav-link">help</Link>
          <Link href="#" className="text-zinc-300 nav-link">about</Link>
        </div>
      )}
    </div>
  );
}
