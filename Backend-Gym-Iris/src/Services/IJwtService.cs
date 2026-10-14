using System.Security.Claims;

namespace Backend_Gym_Iris.Services
{
    /// <summary>
    /// Interfaz para el servicio de generación y validación de tokens JWT
    /// Define las operaciones necesarias para autenticación basada en JWT
    /// </summary>
    public interface IJwtService
    {
        /// <summary>
        /// Genera un Access Token JWT que expira en 1 hora
        /// El token contiene solo AdminId (NO contraseña ni datos sensibles)
        /// </summary>
        /// <param name="adminId">ID del administrador</param>
        /// <returns>Token JWT en formato string</returns>
        /// <exception cref="ArgumentException">Si adminId es inválido</exception>
        /// <exception cref="InvalidOperationException">Si la configuración JWT es inválida</exception>
        string GenerateAccessToken(int adminId);

        /// <summary>
        /// Genera un Refresh Token aleatorio seguro (64 bytes)
        /// Usa RandomNumberGenerator para criptografía segura
        /// </summary>
        /// <returns>Token aleatorio en formato Base64</returns>
        string GenerateRefreshToken();

        /// <summary>
        /// Valida un token JWT y retorna los claims si es válido
        /// Verifica firma, expiración, issuer y audience
        /// </summary>
        /// <param name="token">Token JWT a validar</param>
        /// <returns>ClaimsPrincipal si el token es válido, null si es inválido</returns>
        ClaimsPrincipal? ValidateToken(string token);

        /// <summary>
        /// Obtiene el AdminId de un token JWT (incluso si está expirado)
        /// Útil para el flujo de refresh token donde necesitamos el AdminId
        /// sin validar la expiración del access token anterior
        /// </summary>
        /// <param name="token">Token JWT</param>
        /// <returns>AdminId si se puede extraer, null si el token es inválido</returns>
        int? GetAdminIdFromToken(string token);
    }
}
