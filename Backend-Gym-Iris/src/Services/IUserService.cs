using Backend_Gym_Iris.DTOs.User;
using Backend_Gym_Iris.Entities;

namespace Backend_Gym_Iris.Services
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<IEnumerable<User>> GetAllUsersWithPaymentsAsync();
        Task<(IEnumerable<User> Users, int TotalCount)> GetUsersPagedWithPaymentsAsync(int pageNumber, int pageSize);
        Task<Backend_Gym_Iris.DTOs.Common.PagedResult<Backend_Gym_Iris.DTOs.User.UserResponse>> GetUsersPagedResponseAsync(int pageNumber, int pageSize);
        Task<User> GetUserByIdAsync(int id);
        Task<User> GetUserByEmailAsync(string email);
        Task<User> CreateUserAsync(DTOs.User.CreateUserRequest request);
        Task<User> UpdateUserAsync(int id, DTOs.User.UpdateUserRequest request);
        Task DeleteUserAsync(int id);
        UserResponse MapToResponse(User u);
    }
}
