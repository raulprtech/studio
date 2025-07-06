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
            Guardar Cambios
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
          title: state.success ? "Éxito" : "Error",
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
          Editar Rol
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Rol para {user.name}</DialogTitle>
          <DialogDescription>
            Selecciona un nuevo rol para el usuario. Esto cambiará sus permisos en toda la aplicación.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="uid" value={user.uid} />
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select name="role" defaultValue={user.role}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Administrador</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Viewer">Lector</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" type="button">Cancelar</Button>
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
        toast({ title: "Error", description: "El usuario no tiene una dirección de correo electrónico.", variant: "destructive" });
        return;
    }
    startTransition(async () => {
      const result = await sendPasswordResetAction(user.email!);
      toast({
        title: result.success ? "Éxito" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    });
  };

  return (
    <DropdownMenuItem onClick={handleClick} disabled={isPending || !user.email}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Enviar correo de restablecimiento
    </DropdownMenuItem>
  );
}

export function ToggleUserStatusMenuItem({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const actionText = user.disabled ? "Habilitar Usuario" : "Deshabilitar Usuario";
  const newStatus = !user.disabled;

  const handleToggle = () => {
    startTransition(async () => {
        const result = await toggleUserStatusAction(user.uid, newStatus);
        toast({
            title: result.success ? "Éxito" : "Error",
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
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción {user.disabled ? "habilitará" : "deshabilitará"} la cuenta de usuario para {user.name}.
                    {user.disabled ? ' Podrá volver a iniciar sesión.' : ' Ya no podrá iniciar sesión.'}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleToggle} disabled={isPending} className={!user.disabled ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
                     {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {actionText}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
