"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Inline SVG for Google Icon
const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2">
        <title>Google</title>
        <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.85 1.62-4.64 0-8.4-3.6-8.4-8s3.76-8 8.4-8c2.48 0 4.04.92 4.97 1.82l2.45-2.35C17.7 1.34 15.47 0 12.48 0 5.88 0 .01 5.38.01 12s5.87 12 12.47 12c3.25 0 5.76-1.08 7.68-2.92 1.95-1.84 2.6-4.35 2.6-6.92 0-.6-.05-1.18-.15-1.68H12.48z"
            fill="currentColor"
        />
    </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
    setIsLoading(true);

    if (!auth) {
      toast({
          title: "Configuración Incompleta",
          description: "Firebase no está configurado del lado del cliente. Revisa las variables de entorno.",
          variant: "destructive",
      });
      setIsLoading(false);
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
      setIsLoading(false);
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
        let errorMessage = error.message || "No se pudo iniciar sesión con Google.";
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "El inicio de sesión fue cancelado.";
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = "Ya existe una cuenta con este correo electrónico pero con un método de inicio de sesión diferente.";
        }
        
        toast({
            title: "Error de Inicio de Sesión con Google",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsGoogleLoading(false);
    }
  }

  return (
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
            <Button variant="outline" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
                {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
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
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="m@ejemplo.com" required disabled={isGoogleLoading}/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isGoogleLoading}/>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
