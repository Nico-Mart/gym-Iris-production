using Backend_Gym_Iris.Entities;
using Backend_Gym_Iris.Enums;

namespace Backend_Gym_Iris.Repositories
{
    public interface IMembershipPriceRepository
    {
        Task<IEnumerable<MembershipPrice>> GetAllAsync();
        Task<MembershipPrice?> GetByIdAsync(int id);
        Task<MembershipPrice?> GetByTypeAsync(MembershipType type);
        Task<MembershipPrice> CreateAsync(MembershipPrice price);
        Task<MembershipPrice?> UpdateAsync(MembershipPrice price);
        Task<bool> DeleteAsync(int id);
    }
}
