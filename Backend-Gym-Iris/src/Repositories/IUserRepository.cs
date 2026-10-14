using Backend_Gym_Iris.Entities;

namespace Backend_Gym_Iris.Repositories
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<IEnumerable<User>> GetAllWithPaymentsAsync();
        Task<(IEnumerable<User> Users, int TotalCount)> GetPagedWithPaymentsAsync(int pageNumber, int pageSize);
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<User> CreateAsync(User user);
        Task<User?> UpdateAsync(int id, User user);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
