using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Backend_Gym_Iris.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<JwtService> _logger;
        private const string JWT_KEY_CONFIG = "Jwt:Key";
        private const string JWT_ISSUER_CONFIG = "Jwt:Issuer";
        private const string JWT_AUDIENCE_CONFIG = "Jwt:Audience";
        private const int ACCESS_TOKEN_HOURS = 1;
        private const int REFRESH_TOKEN_BYTES = 64;
        private const int MIN_KEY_LENGTH = 32;

        public JwtService(IConfiguration configuration, ILogger<JwtService> logger)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            ValidateConfiguration();
        }

        /// <summary>
        /// Valida que la configuración JWT esté correcta
        /// </summary>
        /// <exception cref="InvalidOperationException">Si la configuración es inválida</exception>
        private void ValidateConfiguration()
        {
            var key = _configuration[JWT_KEY_CONFIG];
            var issuer = _configuration[JWT_ISSUER_CONFIG];
            var audience = _configuration[JWT_AUDIENCE_CONFIG];

            if (string.IsNullOrWhiteSpace(key))
            {
                throw new InvalidOperationException($"JWT Key not configured in {JWT_KEY_CONFIG}");
            }

            if (key.Length < MIN_KEY_LENGTH)
            {
                throw new InvalidOperationException($"JWT Key must be at least {MIN_KEY_LENGTH} characters long. Current length: {key.Length}");
            }

            if (string.IsNullOrWhiteSpace(issuer))
            {
                throw new InvalidOperationException($"JWT Issuer not configured in {JWT_ISSUER_CONFIG}");
            }

            if (string.IsNullOrWhiteSpace(audience))
            {
                throw new InvalidOperationException($"JWT Audience not configured in {JWT_AUDIENCE_CONFIG}");
            }

            _logger.LogInformation("JWT configuration validated successfully");
        }

        /// <inheritdoc />
        public string GenerateAccessToken(int adminId)
        {
            if (adminId <= 0)
            {
                _logger.LogWarning("Attempted to generate token with invalid adminId: {AdminId}", adminId);
                throw new ArgumentException("AdminId must be greater than 0", nameof(adminId));
            }

            try
            {
                _logger.LogInformation("Generating access token for adminId: {AdminId}", adminId);

                var key = _configuration[JWT_KEY_CONFIG]!;
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, adminId.ToString()),
                    new Claim(ClaimTypes.Role, "Admin"),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
                };

                var expiresAt = DateTime.UtcNow.AddHours(ACCESS_TOKEN_HOURS);

                var token = new JwtSecurityToken(
                    issuer: _configuration[JWT_ISSUER_CONFIG],
                    audience: _configuration[JWT_AUDIENCE_CONFIG],
                    claims: claims,
                    expires: expiresAt,
                    signingCredentials: credentials
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                _logger.LogInformation("Access token generated successfully for adminId: {AdminId}, expires at: {ExpiresAt}", 
                    adminId, expiresAt);

                return tokenString;
            }
            catch (Exception ex) when (ex is not ArgumentException)
            {
                _logger.LogError(ex, "Error generating access token for adminId: {AdminId}", adminId);
                throw new InvalidOperationException("Failed to generate access token", ex);
            }
        }

        /// <inheritdoc />
        public string GenerateRefreshToken()
        {
            try
            {
                var randomBytes = new byte[REFRESH_TOKEN_BYTES];
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(randomBytes);
                }

                var refreshToken = Convert.ToBase64String(randomBytes);

                _logger.LogDebug("Refresh token generated successfully");

                return refreshToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating refresh token");
                throw new InvalidOperationException("Failed to generate refresh token", ex);
            }
        }

        /// <inheritdoc />
        public ClaimsPrincipal? ValidateToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("Attempted to validate null or empty token");
                return null;
            }

            try
            {
                var key = _configuration[JWT_KEY_CONFIG]!;
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

                var tokenHandler = new JwtSecurityTokenHandler();

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = securityKey,
                    ValidateIssuer = true,
                    ValidIssuer = _configuration[JWT_ISSUER_CONFIG],
                    ValidateAudience = true,
                    ValidAudience = _configuration[JWT_AUDIENCE_CONFIG],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero, 
                    ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 }
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

                if (validatedToken is not JwtSecurityToken jwtToken ||
                    !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    _logger.LogWarning("Token validation failed: invalid algorithm");
                    return null;
                }

                _logger.LogDebug("Token validated successfully");

                return principal;
            }
            catch (SecurityTokenExpiredException ex)
            {
                _logger.LogDebug(ex, "Token validation failed: token expired");
                return null;
            }
            catch (SecurityTokenException ex)
            {
                _logger.LogWarning(ex, "Token validation failed: security token exception");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error validating token");
                return null;
            }
        }

        /// <inheritdoc />
        public int? GetAdminIdFromToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("Attempted to extract adminId from null or empty token");
                return null;
            }

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();

                if (!tokenHandler.CanReadToken(token))
                {
                    _logger.LogWarning("Token is not a valid JWT");
                    return null;
                }

                var jwtToken = tokenHandler.ReadJwtToken(token);

                var adminIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

                if (adminIdClaim == null)
                {
                    _logger.LogWarning("AdminId claim not found in token");
                    return null;
                }

                if (int.TryParse(adminIdClaim.Value, out int adminId))
                {
                    _logger.LogDebug("AdminId extracted successfully from token: {AdminId}", adminId);
                    return adminId;
                }

                _logger.LogWarning("AdminId claim is not a valid integer: {Value}", adminIdClaim.Value);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting adminId from token");
                return null;
            }
        }
    }
}
