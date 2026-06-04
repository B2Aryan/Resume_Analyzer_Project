
import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

const DEFAULT_ROLES = [
  "Frontend Developer",
  "Frontend Developer Intern",
  "Frontend Engineer",
  "Backend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "Full Stack Developer Intern",
  "Software Engineer",
  "Software Engineer Intern",
  "DevOps Engineer",
  "Cloud Engineer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "Java Developer",
  "Python Developer",
  "React Developer",
  "Node.js Developer",
  "Mobile App Developer",
  "Android Developer",
  "iOS Developer",
  "UI/UX Designer",
  "Product Manager",
  "QA Engineer",
  "Cybersecurity Analyst"
];

interface RoleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  roles?: string[];
  placeholder?: string;
  className?: string;
}

export function RoleAutocomplete({
  value,
  onChange,
  roles = DEFAULT_ROLES,
  placeholder = "e.g. Frontend Developer Intern",
  className
}: RoleAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Filter roles based on search
  const filteredSuggestions = useMemo(() => {
    const searchTerm = value.toLowerCase();
    if (!searchTerm) return roles;
    return roles.filter((role) =>
      role.toLowerCase().includes(searchTerm)
    );
  }, [value, roles]);

  const handleSelect = (selectedRole: string) => {
    console.log("Selected role:", selectedRole);
    onChange(selectedRole);
    setOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.role-autocomplete-wrapper')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Reset highlighted index when filtered suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredSuggestions]);

  // Debug logs
  console.log("RoleAutocomplete debug:", {
    searchTerm: value,
    filteredSuggestions,
    isOpen: open,
    totalRoles: roles.length,
    highlightedIndex
  });

  return (
    <div className="role-autocomplete-wrapper relative w-full">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setHighlightedIndex(-1);
            return;
          }

          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!open) {
              setOpen(true);
            } else {
              setHighlightedIndex((prev) =>
                Math.min(prev + 1, filteredSuggestions.length - 1)
              );
            }
            return;
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            return;
          }

          if (e.key === "Enter" && open && highlightedIndex >= 0) {
            e.preventDefault();
            handleSelect(filteredSuggestions[highlightedIndex]);
            return;
          }
        }}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring backdrop-blur ${className}`}
      />

      {open && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-[100] mt-1 max-h-60 overflow-auto rounded-xl border border-border bg-background/95 shadow-xl backdrop-blur-sm">
          <div className="py-1">
            {filteredSuggestions.map((role, index) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSelect(role)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  highlightedIndex === index
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

