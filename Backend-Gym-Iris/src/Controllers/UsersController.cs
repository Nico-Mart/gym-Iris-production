using Backend_Gym_Iris.DTOs.User;
using Backend_Gym_Iris.Entities;
using Backend_Gym_Iris.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_Gym_Iris.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var paged = await _userService.GetUsersPagedResponseAsync(pageNumber, pageSize);
            return Ok(paged);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return Ok(_userService.MapToResponse(user));
        }

        [HttpGet("email/{email}")]
        public async Task<ActionResult<UserResponse>> GetUserByEmail(string email)
        {
            var user = await _userService.GetUserByEmailAsync(email);
            return Ok(_userService.MapToResponse(user));
        }

        [HttpPost]
        public async Task<ActionResult<UserResponse>> CreateUser([FromBody] CreateUserRequest request)
        {
            var created = await _userService.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetUser), new { id = created.Id }, _userService.MapToResponse(created));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                var updated = await _userService.UpdateUserAsync(id, request);
                return Ok(_userService.MapToResponse(updated));
            }
            catch (Backend_Gym_Iris.Exceptions.NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Backend_Gym_Iris.Exceptions.ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Backend_Gym_Iris.Exceptions.ConflictException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                await _userService.DeleteUserAsync(id);
                return NoContent();
            }
            catch (Backend_Gym_Iris.Exceptions.NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}