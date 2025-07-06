"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateUserRoleAction, sendPasswordResetAction, toggleUserStatusAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";

type User = {
    uid: string;
    email: string | null;
    name: string;
    role: 'Admin' | 'Editor' | 'Viewer';
    disabled: boolean;
}

function EditRoleSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
        </Button>
    )
}

export function EditRoleMenuItem({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const initialState = { message: null, success: false, errors: null };
  const [state, formAction] = useActionState(updateUserRoleAction, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
          title: state.success ? "Success" : "Error",
          description: state.message,
          variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        setIsOpen(false);
      }
    }
  }, [state, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Edit Role
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Role for {user.name}</DialogTitle>
          <DialogDescription>
            Select a new role for the user. This will change their permissions across the application.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="uid" value={user.uid} />
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={user.role}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" type="button">Cancel</Button>
            </DialogClose>
            <EditRoleSubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SendPasswordResetMenuItem({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleClick = () => {
    if (!user.email) {
        toast({ title: "Error", description: "User does not have an email address.", variant: "destructive" });
        return;
    }
    startTransition(async () => {
      const result = await sendPasswordResetAction(user.email!);
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    });
  };

  return (
    <DropdownMenuItem onClick={handleClick} disabled={isPending || !user.email}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Send Password Reset
    </DropdownMenuItem>
  );
}

export function ToggleUserStatusMenuItem({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const actionText = user.disabled ? "Enable User" : "Disable User";
  const newStatus = !user.disabled;

  const handleToggle = () => {
    startTransition(async () => {
        const result = await toggleUserStatusAction(user.uid, newStatus);
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
    });
  }

  return (
     <AlertDialog>
        <AlertDialogTrigger asChild>
             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={!user.disabled ? 'text-destructive' : ''}>
                {actionText}
            </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will {user.disabled ? "enable" : "disable"} the user account for {user.name}. 
                    {user.disabled ? ' They will be able to sign in again.' : ' They will no longer be able to sign in.'}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleToggle} disabled={isPending} className={!user.disabled ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
                     {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {actionText}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
