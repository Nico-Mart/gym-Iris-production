using Backend_Gym_Iris.DTOs.Admin;
using Backend_Gym_Iris.DTos.Auth;
using Backend_Gym_Iris.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_Gym_Iris.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminsController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IJwtService _jwtService;
        private readonly IRefreshTokenService _refreshTokenService;

        public AdminsController(
            IAdminService adminService,
            IJwtService jwtService,
            IRefreshTokenService refreshTokenService)
        {
            _adminService = adminService;
            _jwtService = jwtService;
            _refreshTokenService = refreshTokenService;
        }

        [HttpPost("validate")]
        [AllowAnonymous]
        public async Task<IActionResult> ValidatePassword([FromBody] ValidatePasswordRequest request)
        {
            var admin = await _adminService.ValidatePasswordAsync(request.Password);

            // Generate access + refresh tokens (same behavior as AuthController)
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
    }
}
