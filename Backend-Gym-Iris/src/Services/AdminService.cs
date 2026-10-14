using Backend_Gym_Iris.Data;
using Backend_Gym_Iris.Entities;
using Backend_Gym_Iris.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend_Gym_Iris.Services
{
    public class AdminService : IAdminService
    {

        private readonly IAdminRepository _adminRepository;

        public AdminService(IAdminRepository adminRepository)
        {
            _adminRepository = adminRepository;
        }

        public async Task<Admin> ValidatePasswordAsync(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new Backend_Gym_Iris.Exceptions.ValidationException("Password is required.");

            var admin = await _adminRepository.GetFirstAdminAsync();

            if (admin == null)
                throw new Backend_Gym_Iris.Exceptions.NotFoundException("Admin user not found.");

            if (!BCrypt.Net.BCrypt.Verify(password, admin.PasswordHash))
                throw new Backend_Gym_Iris.Exceptions.UnauthorizedException("Invalid password.");

            return admin;
        }
        public async Task<Admin> GetAdminAsync()
        {
            var admin = await _adminRepository.GetFirstAdminAsync();
            if (admin == null)
                throw new Backend_Gym_Iris.Exceptions.NotFoundException("Admin user not found.");
            return admin;
        }

    }
}
