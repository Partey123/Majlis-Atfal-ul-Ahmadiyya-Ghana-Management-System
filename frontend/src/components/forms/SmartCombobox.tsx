import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface Item {
  id: number | string;
  name: string;
}

interface SmartComboboxProps {
  items: Item[];
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  onCreateNew?: (name: string) => Promise<void>;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function SmartCombobox({
  items,
  value,
  onChange,
  onSearch,
  onCreateNew,
  placeholder = "Select an option...",
  label = "Item",
  disabled = false
}: SmartComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedItem = items.find((item) => item.name === value);

  const handleCreateNew = async () => {
    if (!searchQuery || !onCreateNew) return;
    
    try {
      setIsCreating(true);
      await onCreateNew(searchQuery);
      onChange(searchQuery);
      setOpen(false);
      setSearchQuery("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-[44px]"
          disabled={disabled}
        >
          <span className="truncate">
            {value ? value : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`Search ${label.toLowerCase()}s...`} 
            value={searchQuery}
            onValueChange={(val) => {
              setSearchQuery(val);
              if (onSearch) onSearch(val);
            }}
          />
          <CommandList>
            {items.length === 0 && searchQuery && onCreateNew && (
              <CommandEmpty className="p-0">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-2 py-4 h-auto rounded-none text-left font-normal flex items-center gap-2"
                  onClick={handleCreateNew}
                  disabled={isCreating}
                >
                  <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="line-clamp-2 text-sm">
                    Create new {label.toLowerCase()}: <span className="font-medium text-foreground">{searchQuery}</span>
                  </span>
                </Button>
              </CommandEmpty>
            )}
            
            {items.length === 0 && (!searchQuery || !onCreateNew) && (
              <CommandEmpty>No {label.toLowerCase()}s found.</CommandEmpty>
            )}

            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="min-h-[44px]"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
