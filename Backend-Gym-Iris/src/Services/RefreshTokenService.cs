using Backend_Gym_Iris.Entities;
using Backend_Gym_Iris.Repositories;
using Microsoft.Extensions.Logging;

namespace Backend_Gym_Iris.Services
{

    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly ILogger<RefreshTokenService> _logger;

        private const int REFRESH_TOKEN_DAYS = 30;

        public RefreshTokenService(
            IRefreshTokenRepository refreshTokenRepository,
            ILogger<RefreshTokenService> logger)
        {
            _refreshTokenRepository = refreshTokenRepository ?? throw new ArgumentNullException(nameof(refreshTokenRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc />
        public async Task<RefreshToken> CreateRefreshTokenAsync(int adminId, string token)
        {

            if (adminId <= 0)
            {
                _logger.LogWarning("Attempted to create refresh token with invalid adminId: {AdminId}", adminId);
                throw new ArgumentException("AdminId must be greater than 0", nameof(adminId));
            }

            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("Attempted to create refresh token with null or empty token");
                throw new ArgumentException("Token cannot be null or empty", nameof(token));
            }

            try
            {
                _logger.LogInformation("Creating refresh token for adminId: {AdminId}", adminId);

                var refreshToken = new RefreshToken
                {
                    Token = token,
                    AdminId = adminId,
                    ExpiresAt = DateTime.UtcNow.AddDays(REFRESH_TOKEN_DAYS),
                    CreatedAt = DateTime.UtcNow,
                    IsRevoked = false
                };

                var created = await _refreshTokenRepository.CreateAsync(refreshToken);

                _logger.LogInformation("Refresh token created successfully for adminId: {AdminId}, expires at: {ExpiresAt}", 
                    adminId, refreshToken.ExpiresAt);

                return created;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating refresh token for adminId: {AdminId}", adminId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<RefreshToken?> GetAndValidateRefreshTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("Attempted to validate null or empty refresh token");
                return null;
            }

            try
            {
                _logger.LogDebug("Validating refresh token");

                var refreshToken = await _refreshTokenRepository.GetByTokenAsync(token);

                if (refreshToken == null)
                {
                    _logger.LogWarning("Refresh token not found in database");
                    return null;
                }

                if (!refreshToken.IsActive)
                {
                    if (refreshToken.IsRevoked)
                    {
                        _logger.LogWarning("Refresh token is revoked. AdminId: {AdminId}, RevokedAt: {RevokedAt}", 
                            refreshToken.AdminId, refreshToken.RevokedAt);
                    }
                    else if (refreshToken.IsExpired)
                    {
                        _logger.LogWarning("Refresh token is expired. AdminId: {AdminId}, ExpiresAt: {ExpiresAt}", 
                            refreshToken.AdminId, refreshToken.ExpiresAt);
                    }
                    return null;
                }

                _logger.LogDebug("Refresh token validated successfully for adminId: {AdminId}", refreshToken.AdminId);

                return refreshToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating refresh token");
                return null;
            }
        }

        /// <inheritdoc />
        public async Task RevokeRefreshTokenAsync(RefreshToken refreshToken, string? replacedByToken = null)
        {

            if (refreshToken == null)
            {
                _logger.LogWarning("Attempted to revoke null refresh token");
                throw new ArgumentNullException(nameof(refreshToken));
            }

            try
            {
                _logger.LogInformation("Revoking refresh token for adminId: {AdminId}", refreshToken.AdminId);

                refreshToken.IsRevoked = true;
                refreshToken.RevokedAt = DateTime.UtcNow;
                refreshToken.ReplacedByToken = replacedByToken;

                await _refreshTokenRepository.UpdateAsync(refreshToken);

                _logger.LogInformation("Refresh token revoked successfully for adminId: {AdminId}", refreshToken.AdminId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking refresh token for adminId: {AdminId}", refreshToken.AdminId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task RevokeAllAdminTokensAsync(int adminId)
        {
            if (adminId <= 0)
            {
                _logger.LogWarning("Attempted to revoke tokens with invalid adminId: {AdminId}", adminId);
                throw new ArgumentException("AdminId must be greater than 0", nameof(adminId));
            }

            try
            {
                _logger.LogInformation("Revoking all refresh tokens for adminId: {AdminId}", adminId);

                await _refreshTokenRepository.RevokeAllByAdminIdAsync(adminId);

                _logger.LogInformation("All refresh tokens revoked successfully for adminId: {AdminId}", adminId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking all tokens for adminId: {AdminId}", adminId);
                throw;
            }
        }
    }
}
