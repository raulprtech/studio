"use client";

import { useState } from "react";
import { icons } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DynamicIcon } from "@/components/dynamic-icon";
import { cn } from "@/lib/utils";

type IconPickerProps = {
  value?: string;
  onChange: (iconName: string) => void;
  defaultValue?: string;
  className?: string;
};

const commonIcons = [
    'Package', 'Users', 'FileText', 'ShoppingCart', 'Home', 'Settings',
    'Database', 'Folder', 'CreditCard', 'Image', 'MessageSquare',
    'BarChart', 'Bell', 'Bookmark', 'Calendar', 'Camera', 'CheckCircle',
    'ChevronDown', 'Clipboard', 'Clock', 'Code', 'Copy', 'Edit', 'ExternalLink',
    'Filter', 'Flag', 'Gift', 'Heart', 'HelpCircle', 'Inbox', 'Info',
    'Key', 'Link', 'Lock', 'LogIn', 'LogOut', 'Mail', 'MapPin', 'Menu',
    'Minus', 'MoreHorizontal', 'Move', 'Music', 'Paperclip', 'Phone', 'Play',
    'Plus', 'Power', 'Printer', 'RefreshCw', 'Save', 'Search', 'Send',
    'Share2', 'Shield', 'Slash', 'Sliders', 'Star', 'Tag', 'ThumbsUp',
    'Trash2', 'TrendingUp', 'Truck', 'Upload', 'User', 'Video', 'Wallet', 'X',
    'Zap', 'ZoomIn', 'ZoomOut'
];

const iconNames = Object.keys(icons) as (keyof typeof icons)[];

export function IconPicker({ value, onChange, defaultValue, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedValue = value || defaultValue || "";

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
  };
  
  const filteredIcons = search
    ? iconNames.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    : commonIcons;


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start gap-2", className)}
        >
          {selectedValue ? (
            <>
              <DynamicIcon name={selectedValue} />
              <span className="truncate">{selectedValue}</span>
            </>
          ) : (
            "Select an icon"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <Command>
          <CommandInput 
            placeholder="Search for an icon..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No icons found.</CommandEmpty>
            <CommandGroup>
              {filteredIcons.slice(0, 100).map((iconName) => (
                <CommandItem
                  key={iconName}
                  onSelect={() => handleSelect(iconName)}
                  className="flex items-center gap-2"
                >
                  <DynamicIcon name={iconName} />
                  <span>{iconName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
