using Backend_Gym_Iris.DTOs.User;
using Backend_Gym_Iris.Entities;
using Backend_Gym_Iris.Repositories;

namespace Backend_Gym_Iris.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllAsync();
        }
        public async Task<IEnumerable<User>> GetAllUsersWithPaymentsAsync()
        {
            return await _userRepository.GetAllWithPaymentsAsync();
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                throw new Backend_Gym_Iris.Exceptions.NotFoundException($"User with id {id} not found.");
            return user;
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new Backend_Gym_Iris.Exceptions.ValidationException("Email is required.");

            var user = await _userRepository.GetByEmailAsync(email.Trim().ToLowerInvariant());
            if (user == null)
                throw new Backend_Gym_Iris.Exceptions.NotFoundException($"User with email {email} not found.");
            return user;
        }

        public async Task<(IEnumerable<User> Users, int TotalCount)> GetUsersPagedWithPaymentsAsync(int pageNumber, int pageSize)
        {
            return await _userRepository.GetPagedWithPaymentsAsync(pageNumber, pageSize);
        }

        public async Task<Backend_Gym_Iris.DTOs.Common.PagedResult<Backend_Gym_Iris.DTOs.User.UserResponse>> GetUsersPagedResponseAsync(int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var (users, totalCount) = await _userRepository.GetPagedWithPaymentsAsync(pageNumber, pageSize);
            var items = users.Select(MapToResponse).ToList();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var result = new Backend_Gym_Iris.DTOs.Common.PagedResult<Backend_Gym_Iris.DTOs.User.UserResponse>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };

            return result;
        }

        public async Task<User> CreateUserAsync(DTOs.User.CreateUserRequest request)
        {
            if (request == null)
                throw new Backend_Gym_Iris.Exceptions.ValidationException("CreateUserRequest is required.");

            var email = request.Email?.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email))
                throw new Backend_Gym_Iris.Exceptions.ValidationException("Email is required.");

            // Basic email format check
            try { var _ = new System.Net.Mail.MailAddress(email); }
            catch { throw new Backend_Gym_Iris.Exceptions.ValidationException("Email format is invalid."); }

            var existingUser = await _userRepository.GetByEmailAsync(email);
            if (existingUser != null)
            {
                throw new Backend_Gym_Iris.Exceptions.ConflictException($"A user with email '{email}' already exists.");
            }

            var user = new User
            {
                Name = request.Name ?? string.Empty,
                Email = email,
                Telephone = request.Telephone ?? string.Empty,
                Activity = request.Activity ?? string.Empty
            };

            return await _userRepository.CreateAsync(user);
        }

        public async Task<User> UpdateUserAsync(int id, DTOs.User.UpdateUserRequest request)
        {
            if (request == null)
                throw new Backend_Gym_Iris.Exceptions.ValidationException("UpdateUserRequest is required.");

            var exists = await _userRepository.ExistsAsync(id);
            if (!exists)
                throw new Backend_Gym_Iris.Exceptions.NotFoundException($"User with id {id} not found.");

            var email = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(email))
                throw new Backend_Gym_Iris.Exceptions.ValidationException("Email is required.");

            // Basic email format check
            try { var _ = new System.Net.Mail.MailAddress(email); }
            catch { throw new Backend_Gym_Iris.Exceptions.ValidationException("Email format is invalid."); }

            var existingUser = await _userRepository.GetByEmailAsync(email);
            if (existingUser != null && existingUser.Id != id)
                throw new Backend_Gym_Iris.Exceptions.ConflictException($"A user with email '{email}' already exists.");

            var user = new User
            {
                Id = id,
                Name = request.Name ?? string.Empty,
                Email = email,
                Telephone = request.Telephone ?? string.Empty,
                Activity = request.Activity ?? string.Empty,
                Status = request.Status
            };

            return await _userRepository.UpdateAsync(id, user);
        }

        public async Task DeleteUserAsync(int id)
        {
            var deleted = await _userRepository.DeleteAsync(id);
            if (!deleted)
                throw new Backend_Gym_Iris.Exceptions.NotFoundException($"User with id {id} not found.");
        }
        public UserResponse MapToResponse(User u)
        {
            var payments = u.Payments.Select(p =>
            {
                var monthKey = $"{p.Year}-{p.Month:D2}";

                return new PaymentInfo(
                    p.Id, 
                    monthKey, 
                    string.Empty,
                    p.Amount,       
                    p.Amount,     
                    p.PaymentDate.ToString("yyyy-MM-dd")
                );
            }).ToList();

            return new UserResponse(
                u.Id, u.Name, u.Email, u.Telephone,
                u.JoinDate, u.Status.ToString(), u.Activity, payments
            );
        }

    }
}
