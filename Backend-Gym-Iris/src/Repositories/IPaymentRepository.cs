using Backend_Gym_Iris.Entities;

namespace Backend_Gym_Iris.Repositories
{
    public interface IPaymentRepository
    {
        Task<IEnumerable<Payment>> GetAllAsync();
        Task<IEnumerable<Payment>> GetByUserIdAsync(int userId);
        Task<Payment?> GetByIdAsync(int id);
        Task<Payment?> GetByUserAndMonthAsync(int userId, int month, int year);
        Task<Payment> CreateAsync(Payment payment);
        Task<Payment?> UpdateAsync(Payment payment);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int userId, int month, int year);
    }
}
