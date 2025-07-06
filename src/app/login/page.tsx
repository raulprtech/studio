
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, fetchSignInMethodsForEmail, linkWithCredential, sendPasswordResetEmail, type AuthProvider, type AuthCredential } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";


// Helper component for the account linking dialog
function AccountLinkDialog({ 
    open, 
    onOpenChange, 
    onLink, 
    onPasswordReset, 
    email, 
    isLoading 
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void, 
    onLink: (password: string) => void, 
    onPasswordReset: () => void,
    email: string, 
    isLoading: boolean 
}) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLink(password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular Cuenta</DialogTitle>
          <DialogDescription>
            Ya existe una cuenta con el correo {email}. Para vincular tu cuenta de Google, por favor introduce tu contraseña.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="link-password">Contraseña</Label>
                <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={onPasswordReset}>¿Olvidaste tu contraseña?</Button>
            </div>
            <Input id="link-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vincular y Continuar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [linkingState, setLinkingState] = useState<{ open: boolean; email: string | null; pendingCred: AuthCredential | null }>({ open: false, email: null, pendingCred: null });
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthSuccess = async (idToken: string) => {
    const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    if (response.ok) {
      router.push('/dashboard');
    } else {
      const data = await response.json();
      throw new Error(data.error || "Error al iniciar sesión en el servidor.");
    }
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEmailLoading(true);

    if (!auth) {
      toast({
          title: "Configuración Incompleta",
          description: "Firebase no está configurado del lado del cliente. Revisa las variables de entorno.",
          variant: "destructive",
      });
      setIsEmailLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await handleAuthSuccess(idToken);
    } catch (error: any) {
        let errorMessage = "Ocurrió un error inesperado.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "Credenciales incorrectas. Por favor, inténtalo de nuevo.";
        } else if (error.message) {
            errorMessage = error.message;
        }
        toast({
            title: "Error de Inicio de Sesión",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    if (!auth) {
      toast({
          title: "Configuración Incompleta",
          description: "Firebase no está configurado del lado del cliente. Revisa las variables de entorno.",
          variant: "destructive",
      });
      setIsGoogleLoading(false);
      return;
    }

    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();
        await handleAuthSuccess(idToken);
    } catch (error: any) {
        if (error.code === 'auth/account-exists-with-different-credential' && error.customData?.email) {
            const email = error.customData.email;
            const pendingCred = GoogleAuthProvider.credentialFromError(error);

            if (!pendingCred) {
                toast({ title: "Error", description: "No se pudo obtener la credencial de Google.", variant: "destructive" });
                return;
            }
            
            const methods = await fetchSignInMethodsForEmail(auth, email);

            if (methods.includes('password')) {
                setLinkingState({ open: true, email, pendingCred });
            } else {
                toast({
                    title: "Conflicto de Cuentas",
                    description: `Ya existe una cuenta con este correo, pero usa el proveedor ${methods[0]}. Por favor, inicia sesión con ese método.`,
                    variant: "destructive"
                });
            }
        } else {
            let errorMessage = error.message || "No se pudo iniciar sesión con Google.";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "El inicio de sesión fue cancelado.";
            }
            toast({
                title: "Error de Inicio de Sesión con Google",
                description: errorMessage,
                variant: "destructive",
            });
        }
    } finally {
        setIsGoogleLoading(false);
    }
}

  const handleLinkAccount = async (password: string) => {
    if (!linkingState.email || !linkingState.pendingCred || !password || !auth) return;
    setIsEmailLoading(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, linkingState.email, password);
        await linkWithCredential(userCredential.user, linkingState.pendingCred);
        const idToken = await userCredential.user.getIdToken();
        await handleAuthSuccess(idToken);
        setLinkingState({ open: false, email: null, pendingCred: null });
    } catch (linkError: any) {
        toast({
            title: "Error al Vincular la Cuenta",
            description: "La contraseña es incorrecta o ocurrió un error. Por favor, inténtalo de nuevo.",
            variant: "destructive"
        });
    } finally {
        setIsEmailLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!linkingState.email || !auth) return;
    try {
        await sendPasswordResetEmail(auth, linkingState.email);
        toast({
            title: "Correo Enviado",
            description: "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.",
        });
        setLinkingState({ open: false, email: null, pendingCred: null }); // Close the dialog after sending
    } catch (error) {
        toast({
            title: "Error",
            description: "No se pudo enviar el correo de restablecimiento de contraseña.",
            variant: "destructive",
        });
    }
}

  const isLoading = isEmailLoading || isGoogleLoading;

  return (
    <>
      {linkingState.email && (
        <AccountLinkDialog
          open={linkingState.open}
          onOpenChange={(open) => setLinkingState(prev => ({ ...prev, open }))}
          onLink={handleLinkAccount}
          onPasswordReset={handlePasswordReset}
          email={linkingState.email}
          isLoading={isEmailLoading}
        />
      )}
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                  <Logo />
              </div>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Usa tu cuenta de Google o tu correo para acceder al panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
              <Button variant="outline" onClick={handleGoogleLogin} disabled={isLoading}>
                  {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Google />}
                  Continuar con Google
              </Button>
              <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                          O continuar con
                      </span>
                  </div>
              </div>
              <form onSubmit={handleLogin} className="grid gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="m@ejemplo.com" required disabled={isLoading}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}/>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                      {isEmailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isEmailLoading ? "Iniciando..." : "Iniciar Sesión"}
                  </Button>
              </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
