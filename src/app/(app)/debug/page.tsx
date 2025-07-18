
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { checkFirestoreConnectionAction, getCollectionsForDebugAction } from '@/lib/actions';

type LogEntry = {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
};

type ConnectionStatus = {
  connected: boolean;
  reason: string;
  code?: string;
} | null;

type Collection = {
  name: string;
  count: number;
  schemaFields: number;
  lastUpdated: string;
  icon: string | null;
};

const FirebaseDebugComponent = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const checkConnection = async () => {
    setLoading(true);
    addLog('Iniciando test de conexión...', 'info');
    
    try {
      const result = await checkFirestoreConnectionAction();
      
      setConnectionStatus({
        connected: result.success,
        reason: result.message,
        code: result.code,
      });

      if (result.success) {
        addLog(`✅ Conexión exitosa: ${result.message}`, 'success');
      } else {
        addLog(`❌ Error de conexión: ${result.message} (Código: ${result.code})`, 'error');
      }

    } catch (error: any) {
      const errorMessage = error.message || "Error inesperado.";
      addLog(`❌ Error inesperado: ${errorMessage}`, 'error');
      setConnectionStatus({ connected: false, reason: errorMessage, code: 'exception' });
    }
    setLoading(false);
  };

  const testGetCollections = async () => {
    setLoading(true);
    setCollections([]);
    addLog('Iniciando obtención de colecciones...', 'info');
    
    try {
      const result = await getCollectionsForDebugAction();

      result.logs.forEach(log => addLog(log.message, log.type as any));

      if (result.success && result.collections) {
        setCollections(result.collections);
        addLog(`✅ ${result.collections.length} colecciones procesadas exitosamente`, 'success');
      } else {
        addLog('La obtención de colecciones no devolvió un resultado exitoso.', 'error');
      }
      
    } catch (error: any) {
       addLog(`❌ Error obteniendo colecciones: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  const clearLogs = () => {
    setDebugLogs([]);
    setConnectionStatus(null);
    setCollections([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="flex-1 text-2xl font-semibold">Panel de Depuración de Firebase</h1>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Test de Conexión</CardTitle>
            <CardDescription>
                Verifica la conexión básica con Firestore y los permisos.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button 
              onClick={checkConnection}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Probar Conexión
            </Button>
            {connectionStatus && (
              <div className={`mt-3 p-3 rounded text-sm ${
                connectionStatus.connected 
                  ? 'bg-green-100 border border-green-400 text-green-800 dark:bg-green-900/20 dark:border-green-500/30 dark:text-green-300' 
                  : 'bg-red-100 border border-red-400 text-red-800 dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-300'
              }`}>
                <div className="font-semibold">
                  {connectionStatus.connected ? '✅ Conectado' : '❌ No conectado'}
                </div>
                <div>{connectionStatus.reason}</div>
                {connectionStatus.code && (
                  <div>Código: <span className="font-mono bg-muted px-1 py-0.5 rounded-sm">{connectionStatus.code}</span></div>
                )}
              </div>
            )}
          </CardContent>
       </Card>

       <Card>
        <CardHeader>
            <CardTitle>Test de Obtención de Colecciones</CardTitle>
             <CardDescription>
                Intenta obtener la lista de colecciones desde la colección `_schemas`.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button 
                onClick={testGetCollections}
                disabled={loading}
                variant="secondary"
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Obtener Colecciones
            </Button>
            
            {collections.length > 0 && (
            <div className="mt-4">
                <h3 className="font-semibold mb-2">Colecciones encontradas:</h3>
                <div className="space-y-2">
                {collections.map((col) => (
                    <div key={col.name} className="p-3 bg-muted rounded-md text-sm">
                    <div className="font-medium text-foreground">{col.name}</div>
                    <div className="text-muted-foreground">
                        Documentos: {col.count} | Campos de Esquema: {col.schemaFields}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
        </CardContent>
       </Card>

       <Card>
        <CardHeader>
             <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Registros de Depuración</CardTitle>
                    <CardDescription>
                        Pasos detallados de las pruebas ejecutadas.
                    </CardDescription>
                </div>
                <Button 
                    onClick={clearLogs}
                    variant="outline"
                    size="sm"
                >
                    Limpiar
                </Button>
            </div>
        </CardHeader>
        <CardContent>
             <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm h-64 overflow-y-auto">
                {debugLogs.length === 0 ? (
                    <div className="text-gray-500">No hay registros aún. Ejecuta una prueba...</div>
                ) : (
                    debugLogs.map((log, index) => (
                    <div key={index} className={`mb-1 ${
                        log.type === 'error' ? 'text-red-400' : 
                        log.type === 'success' ? 'text-green-400' : 
                        'text-blue-400'
                    }`}>
                        <span className="text-gray-500 mr-2">[{log.timestamp}]</span>{log.message}
                    </div>
                    ))
                )}
            </div>
        </CardContent>
       </Card>
    </div>
  );
};

export default FirebaseDebugComponent;
