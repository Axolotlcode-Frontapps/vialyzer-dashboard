# Solución al Bucle Infinito del Token Refresh

## Problema Detectado

El bucle infinito se producía por la siguiente secuencia:

1. **TokenRefreshProvider** programa un refresh del token
2. Cuando el refresh se ejecuta, llama a `login(response.payload)`
3. `login()` actualiza el estado `signInResponse` en el contexto de autenticación
4. El cambio de estado dispara el `useEffect` en `TokenRefreshProvider`
5. Esto vuelve a programar otro refresh, creando un **bucle infinito**

## Soluciones Implementadas

### 1. Método `silentRefresh` en AuthContext

Se agregó un nuevo método `silentRefresh` que actualiza las cookies y el estado sin disparar re-renders innecesarios:

```tsx
const silentRefresh = useCallback((signInResponse: SignInResponse) => {
  setSessionCookie(SESSION_NAME, signInResponse);
  setSignInResponse(signInResponse);
}, []);
```

### 2. Prevención de Reprogramación Duplicada

Se implementó un sistema para evitar programar múltiples refreshes para la misma fecha de expiración:

```tsx
const lastScheduledExpiration = useRef<string | null>(null);

// Evitar reprogramar si ya tenemos programado para la misma fecha
if (lastScheduledExpiration.current === refreshTokenExpiration) {
  return;
}
```

### 3. Validación de Tiempo de Expiración

Se agregó validación para no programar refreshes si el token ya expiró o está muy cerca de expirar:

```tsx
// Si el token ya expiró o está por expirar (menos de 30 segundos), no programar
if (timeUntilExpiration <= 30 * 1000) {
  return;
}
```

### 4. Mejora en el Interceptor de Axios

Se implementó un sistema de promise único para evitar múltiples llamadas simultáneas al endpoint de refresh:

```tsx
let refreshPromise: Promise<string | null> | null = null;

if (!refreshPromise) {
  refreshPromise = (async () => {
    // lógica de refresh
  })();
}
```

## Archivos Modificados

1. **`/src/contexts/auth.tsx`**: Agregado método `silentRefresh`
2. **`/src/contexts/token-refresh.tsx`**: Implementada lógica anti-bucle
3. **`/src/lib/utils/axios.ts`**: Mejorado interceptor con promise único

## Verificación de la Solución

Para verificar que el bucle infinito está resuelto:

1. **Inicia sesión en la aplicación**
2. **Abre las DevTools**
3. **Observa la consola** durante 2-3 minutos

### Comportamiento Esperado (✅ Correcto)

- Deberías ver máximo 1 mensaje de "Token refresh scheduled" cuando el token esté cerca de expirar
- No deberías ver múltiples programaciones en secuencia rápida
- El refresh debería ejecutarse solo cuando sea necesario

### Comportamiento Problemático (❌ Bucle Infinito)

- Verías múltiples mensajes "Token refresh scheduled" en sucesión rápida
- La consola se llenaría de logs de refresh
- El rendimiento de la aplicación se vería afectado

## Notas Importantes

- El método `silentRefresh` debe usarse solo para refreshes automáticos
- El método `login` normal debe seguir usándose para logins manuales del usuario
- Los timeouts se limpian automáticamente al desmontar componentes
- El sistema funciona tanto para refreshes proactivos como reactivos (interceptor)

## Testing

Para probar la solución en diferentes escenarios:

1. **Token cerca de expirar**: Ajusta la fecha de expiración del token
2. **Múltiples pestañas**: Abre la app en varias pestañas
3. **Red lenta**: Simula red lenta en DevTools
4. **Errores del servidor**: Simula errores 500 en el endpoint de refresh