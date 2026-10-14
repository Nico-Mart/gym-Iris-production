using Backend_Gym_Iris.DTos.Auth;
using Backend_Gym_Iris.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_Gym_Iris.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IJwtService _jwtService;
        private readonly IRefreshTokenService _refreshTokenService;

        public AuthController(
            IAdminService adminService, 
            IJwtService jwtService,
            IRefreshTokenService refreshTokenService)
        {
            _adminService = adminService;
            _jwtService = jwtService;
            _refreshTokenService = refreshTokenService;
        }

        /// <summary>
        /// Login simplificado - Solo requiere contraseña
        /// Genera access token (1h) y refresh token (30 días)
        /// </summary>
        
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Password is required" });
            }
            var admin = await _adminService.ValidatePasswordAsync(request.Password);

            var accessToken = _jwtService.GenerateAccessToken(admin.Id);

            var refreshToken = _jwtService.GenerateRefreshToken();

            await _refreshTokenService.CreateRefreshTokenAsync(admin.Id, refreshToken);

            var accessTokenExpiresAt = DateTime.UtcNow.AddHours(1);
            var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(30);

            var response = new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshTokenExpiresAt = refreshTokenExpiresAt
            };

            return Ok(response);
        }

        /// <summary>
        /// Renovar tokens usando el refresh token
        /// </summary>
        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<ActionResult<RefreshTokenResponse>> Refresh([FromBody] RefreshTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest(new { message = "Refresh token is required" });
            }

            var storedRefreshToken = await _refreshTokenService.GetAndValidateRefreshTokenAsync(request.RefreshToken);

            if (storedRefreshToken == null)
            {
                return Unauthorized(new { message = "Invalid or expired refresh token" });
            }

            var admin = storedRefreshToken.Admin;

            var newAccessToken = _jwtService.GenerateAccessToken(admin.Id);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            await _refreshTokenService.RevokeRefreshTokenAsync(storedRefreshToken, newRefreshToken);
            await _refreshTokenService.CreateRefreshTokenAsync(admin.Id, newRefreshToken);

            var accessTokenExpiresAt = DateTime.UtcNow.AddHours(1);
            var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(30);

            var response = new RefreshTokenResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshTokenExpiresAt = refreshTokenExpiresAt
            };

            return Ok(response);
        }

        /// <summary>
        /// Verificar si el access token es válido
        /// </summary>
        [HttpGet("validate")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            var adminIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            return Ok(new
            {
                isValid = true,
                adminId = adminIdClaim
            });
        }

        /// <summary>
        /// Cerrar sesión - Revoca todos los refresh tokens del admin
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var adminIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (adminIdClaim != null && int.TryParse(adminIdClaim, out int adminId))
            {
                await _refreshTokenService.RevokeAllAdminTokensAsync(adminId);
                return Ok(new { message = "Logged out successfully" });
            }

            return BadRequest(new { message = "Invalid token" });
        }
    }
}
