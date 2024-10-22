"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface SearchBarProps {
  query: string;
  onChange?: (query: string) => void;
  disabled?: boolean;
}

export default function SearchBar({
  query,
  onChange,
  disabled = false,
}: SearchBarProps) {
  return (
    <div className="mb-6">
      <Label htmlFor="search-services" className="sr-only">
        サービスを検索
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          id="search-services"
          type="text"
          placeholder="サービス名または提供元で検索..."
          value={query}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`pl-10 py-2 w-full bg-white border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>
    </div>
  );
}
