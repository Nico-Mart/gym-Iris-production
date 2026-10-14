using Backend_Gym_Iris.Entities;

namespace Backend_Gym_Iris.Repositories
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<RefreshToken> CreateAsync(RefreshToken refreshToken);
        Task<RefreshToken> UpdateAsync(RefreshToken refreshToken);
        Task<IEnumerable<RefreshToken>> GetActiveTokensByAdminIdAsync(int adminId);
        Task RevokeAllByAdminIdAsync(int adminId);
    }
}
