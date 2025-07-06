"use client";
import type { LucideProps } from 'lucide-react';
import { icons, Database } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
    name?: string | null;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
    if (name && icons[name as keyof typeof icons]) {
        const LucideIcon = icons[name as keyof typeof icons];
        return <LucideIcon {...props} />;
    }
    // Return a default icon if the name is not found or not provided
    return <Database {...props} />;
};
