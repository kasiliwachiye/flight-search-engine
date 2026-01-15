"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import clsx from "clsx";
import type { LocationOption } from "@/domain/types";
import { findAirportByIata } from "@/lib/airports";
import { searchLocations } from "@/lib/locations";

const debounceMs = 300;

type AirportTypeaheadProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

function formatOption(option: LocationOption): string {
  const city = option.city || option.name;
  return `${city} (${option.iata})`;
}

function formatSecondary(option: LocationOption): string {
  const parts = [option.name, option.country].filter(Boolean);
  return parts.join(" - ");
}

export default function AirportTypeahead({
  label,
  placeholder,
  value,
  onChange,
}: AirportTypeaheadProps) {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) {
      return "";
    }
    const match = findAirportByIata(value);
    return match ? formatOption(match) : value;
  }, [value]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const handler = setTimeout(async () => {
      const query = inputValue.trim();
      if (query.length < 2) {
        setOptions([]);
        setOpen(false);
        return;
      }

      setIsLoading(true);
      const results = await searchLocations(query);
      setOptions(results);
      setOpen(true);
      setActiveIndex(-1);
      setIsLoading(false);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [inputValue, isFocused]);

  const handleSelect = (option: LocationOption) => {
    onChange(option.iata);
    setInputValue(formatOption(option));
    setOpen(false);
    setActiveIndex(-1);
  };

  const commitManualValue = () => {
    const trimmed = inputValue.trim().toUpperCase();
    if (!trimmed) {
      onChange("");
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (/^[A-Z]{3}$/.test(trimmed)) {
      onChange(trimmed);
      setInputValue(trimmed);
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(options.length > 0);
      }
      setActiveIndex((index) =>
        Math.min(index + 1, Math.max(options.length - 1, 0))
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (open && activeIndex >= 0 && options[activeIndex]) {
        event.preventDefault();
        handleSelect(options[activeIndex]);
        return;
      }

      commitManualValue();
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative flex flex-col gap-2">
      <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        placeholder={placeholder}
        value={isFocused ? inputValue : selectedLabel}
        onChange={(event) => {
          setInputValue(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setInputValue(selectedLabel);
          setIsFocused(true);
          if (options.length > 0) {
            setOpen(true);
          }
        }}
        onBlur={() => {
          setIsFocused(false);
          setTimeout(() => setOpen(false), 150);
          commitManualValue();
        }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        className="h-12 w-full rounded-2xl border border-border bg-white/80 px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-[5.1rem] z-20 w-full overflow-hidden rounded-2xl border border-border bg-white shadow-lg"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-muted">Searching...</div>
          ) : options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted">
              No matches. Try an IATA code.
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {options.map((option, index) => (
                <li key={`${option.iata}-${option.name}`}>
                  <button
                    type="button"
                    id={`${listboxId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(option)}
                    className={clsx(
                      "flex w-full flex-col gap-1 px-4 py-3 text-left text-sm transition",
                      index === activeIndex
                        ? "bg-accent/10 text-ink"
                        : "hover:bg-accent/5"
                    )}
                  >
                    <span className="font-semibold text-ink">
                      {formatOption(option)}
                    </span>
                    <span className="text-xs text-muted">
                      {formatSecondary(option)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

