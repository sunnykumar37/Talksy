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
                <Search className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-slate-100/80 border-none rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all placeholder:text-slate-400 shadow-sm"
                />
            </div>
        </div>
    );

}
