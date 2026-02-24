"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
    return (
        <div className="relative group">
            <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-all duration-300" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-[var(--input)]/60 border border-[var(--card-border)] rounded-full py-2.5 pl-11 pr-4 text-sm text-[var(--foreground)] focus:ring-4 focus:ring-[var(--accent)]/10 focus:bg-[var(--card)] focus:border-[var(--accent)]/30 outline-none transition-all duration-300 placeholder:text-[var(--muted)] font-black tracking-tight"
                />
            </div>
        </div>
    );


}
