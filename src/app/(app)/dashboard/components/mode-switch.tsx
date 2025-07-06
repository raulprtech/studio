
"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { setAppModeAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type ModeSwitchProps = {
    initialMode: 'live' | 'demo';
    isConfigured: boolean;
};

export function ModeSwitch({ initialMode, isConfigured }: ModeSwitchProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isChecked, setIsChecked] = useState(initialMode === 'live');

    const handleToggle = (checked: boolean) => {
        const newMode = checked ? 'live' : 'demo';
        setIsChecked(checked);

        startTransition(async () => {
            await setAppModeAction(newMode);
            toast({
                title: 'Mode Changed',
                description: `App is now in ${newMode} mode. The page will now reload.`,
            });
            // Use router.refresh() to re-run Server Components and get new data
            router.refresh();
        });
    };

    return (
        <div className="flex items-center space-x-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Switch
                id="mode-switch"
                checked={isChecked}
                onCheckedChange={handleToggle}
                disabled={!isConfigured || isPending}
                aria-readonly={!isConfigured || isPending}
            />
            <Label htmlFor="mode-switch" className={!isConfigured ? 'text-muted-foreground' : ''}>
                {isChecked ? 'Live Mode' : 'Demo Mode'}
            </Label>
        </div>
    );
}
