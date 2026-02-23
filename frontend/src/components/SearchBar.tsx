"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
    return (
        <div className="relative p-4">
            <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-gray-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-[#111827] focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                />
            </div>
        </div>
    );
}
