using Backend_Gym_Iris.Entities;

namespace Backend_Gym_Iris.Repositories
{
    public interface IAdminRepository
    {
        Task<Admin?> GetFirstAdminAsync();
        Task<Admin?> GetByIdAsync(int id);
        Task<Admin> UpdateAsync(Admin admin);
        Task<Admin> CreateAsync(Admin admin);
    }
}
