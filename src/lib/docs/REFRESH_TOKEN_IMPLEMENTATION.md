# Implementación de Refresh Token

Esta implementación proporciona un sistema completo de manejo de refresh tokens para tu aplicación React con las siguientes características:

## Características

1. **Refresh Automático en Interceptores**: Maneja automáticamente los errores 401 y refresca el token sin interrumpir la experiencia del usuario.
2. **Refresh Proactivo**: Programa el refresh del token 1 minuto antes de que expire.
3. **Cola de Peticiones**: Evita múltiples llamadas simultáneas al endpoint de refresh token.
4. **Logout Automático**: Redirige al login cuando el refresh token falla o expira.

## Archivos Modificados/Creados

### 1. `/src/lib/utils/axios.ts` (Modificado)ok 
- Interceptor de respuesta mejorado que maneja errores 401
- Sistema de cola para peticiones pendientes durante el refresh
- Evento personalizado `auth:logout` para notificar logout automático

### 2. `/src/contexts/auth.tsx` (Modificado)
- Listener para el evento `auth:logout`
- Manejo mejorado de errores en logout

### 3. `/src/hooks/use-token-refresh.ts` (Nuevo)
- Hook personalizado para refresh manual de tokens
- Obtiene los datos de token desde las cookies (no desde el contexto de autenticación)
- Función `refreshTokenManually` para refrescar el token cuando sea necesario
- Indicador `canRefresh` para saber si hay un refresh token disponible

### 4. `/src/contexts/token-refresh.tsx` (Nuevo)
- Componente que maneja automáticamente el refresh proactivo de tokens
- Programa refresh 1 minuto antes de la expiración
- Obtiene los datos de token desde las cookies

## Cómo Usar

### Paso 1: Envolver tu aplicación
En tu archivo principal (probablemente `main.tsx` o donde tengas el `AuthProvider`):

```tsx
import { AuthProvider } from '@/contexts/auth';
import { TokenRefreshProvider } from '@/contexts/token-refresh';

function App() {
  return (
    <AuthProvider>
      <TokenRefreshProvider>
        {/* Tu aplicación aquí */}
        <Router />
      </TokenRefreshProvider>
    </AuthProvider>
  );
}
```

### Paso 2: Opcional - Usar el hook manualmente
Si necesitas hacer refresh manual del token en algún componente:

```tsx
import { useTokenRefresh } from '@/hooks/use-token-refresh';

function SomeComponent() {
  const { refreshTokenManually, canRefresh } = useTokenRefresh();

  const handleManualRefresh = async () => {
    if (!canRefresh) {
      console.log('No refresh token available');
      return;
    }

    const success = await refreshTokenManually();
    if (success) {
      console.log('Token refreshed successfully');
    } else {
      console.log('Token refresh failed, user logged out');
    }
  };

  return (
    <button onClick={handleManualRefresh} disabled={!canRefresh}>
      Refresh Token
    </button>
  );
}
```

## Flujo de Funcionamiento

### Refresh Automático (Interceptor)
1. Usuario hace una petición HTTP
2. Si recibe 401, el interceptor:
   - Verifica si ya hay un refresh en proceso
   - Si hay uno en proceso, encola la petición
   - Si no, inicia el proceso de refresh
   - Obtiene el refresh token de las cookies
   - Llama al endpoint `/auth/refresh-token`
   - Actualiza las cookies con los nuevos tokens
   - Reintenta la petición original
   - Procesa las peticiones encoladas

### Refresh Proactivo
1. Al hacer login o refresh, se programa un timeout
2. El timeout se ejecuta 1 minuto antes de que expire el refresh token
3. Automáticamente hace refresh del token
4. Programa el siguiente refresh

### Manejo de Errores
- Si el refresh token falla o está expirado:
  - Se elimina la sesión de las cookies
  - Se dispara el evento `auth:logout`
  - El `AuthProvider` escucha este evento y actualiza el estado
  - El usuario es redirigido al login

## Configuración del Backend

Asegúrate de que tu backend:

1. **Endpoint de Refresh Token**: `/auth/refresh-token`
   ```json
   {
     "refreshToken": "your-refresh-token"
   }
   ```

2. **Respuesta exitosa**:
   ```json
   {
     "success": true,
     "payload": {
       "token": "new-access-token",
       "refreshToken": "new-refresh-token",
       "refreshTokenExpiration": "2024-01-01T12:00:00Z",
       "appToken": "app-token",
       "firstLogin": false,
       "idUser": "user-id",
       "idAgent": "agent-id"
     }
   }
   ```

3. **Manejo de errores 401**: Devuelve 401 cuando el access token está expirado
4. **Manejo de refresh token expirado**: Devuelve error cuando el refresh token está expirado

## Consideraciones de Seguridad

1. **Cookies Seguras**: Asegúrate de que las cookies se manejen de forma segura (httpOnly, secure, sameSite)
2. **Expiración**: El refresh token debe tener una expiración más larga que el access token
3. **Rotación**: Es recomendable que el backend rote los refresh tokens en cada uso
4. **Logout**: Invalida los refresh tokens en el backend al hacer logout

## Testing

Para probar la implementación:

1. **Test de Refresh Automático**: 
   - Deja que expire el access token
   - Haz una petición HTTP
   - Verifica que se refresque automáticamente

2. **Test de Refresh Proactivo**:
   - Login con un token que expire pronto
   - Verifica que se programe el refresh automático

3. **Test de Logout Automático**:
   - Usa un refresh token expirado
   - Verifica que se haga logout automático

## Troubleshooting

### El refresh no funciona
- Verifica que el endpoint `/auth/refresh-token` esté funcionando
- Revisa que el formato de respuesta sea correcto
- Verifica que las cookies se estén guardando correctamente

### Múltiples redirects al login
- Asegúrate de que el evento `auth:logout` no se dispare múltiples veces
- Verifica que el logout maneje errores correctamente

### Peticiones duplicadas
- El sistema de cola debería prevenir esto
- Verifica que `isRefreshing` se maneje correctamente