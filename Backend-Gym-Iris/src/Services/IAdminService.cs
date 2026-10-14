using Backend_Gym_Iris.Entities;

namespace Backend_Gym_Iris.Services
{
    public interface IAdminService
    {
        Task<Admin> ValidatePasswordAsync(string password);
        Task<Admin> GetAdminAsync();
    }
}
