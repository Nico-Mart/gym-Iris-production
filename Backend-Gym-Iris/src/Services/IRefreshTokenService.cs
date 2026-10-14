using Backend_Gym_Iris.Entities;

namespace Backend_Gym_Iris.Services
{
    /// <summary>
    /// Servicio para gestionar refresh tokens
    /// Responsable de crear, validar y revocar tokens de actualización
    /// </summary>
    public interface IRefreshTokenService
    {

        /// <param name="adminId">ID del administrador propietario del token</param>
        /// <param name="token">Token generado aleatoriamente</param>
        /// <returns>Refresh token creado</returns>
        Task<RefreshToken> CreateRefreshTokenAsync(int adminId, string token);

        /// <summary>
        /// Obtiene y valida un refresh token
        /// Verifica que exista, no esté expirado y no esté revocado
        /// </summary>
        /// <param name="token">Token a validar</param>
        /// <returns>RefreshToken si es válido, null si es inválido o expirado</returns>
        Task<RefreshToken?> GetAndValidateRefreshTokenAsync(string token);

        /// <summary>
        /// Revoca un refresh token específico
        /// </summary>
        /// <param name="refreshToken">Token a revocar</param>
        /// <param name="replacedByToken">Token nuevo que lo reemplaza (para auditoría)</param>
        Task RevokeRefreshTokenAsync(RefreshToken refreshToken, string? replacedByToken = null);

        /// <summary>
        /// Revoca todos los refresh tokens de un administrador
        /// Útil para logout o cambio de contraseña
        /// </summary>
        /// <param name="adminId">ID del administrador</param>
        Task RevokeAllAdminTokensAsync(int adminId);
    }
}
