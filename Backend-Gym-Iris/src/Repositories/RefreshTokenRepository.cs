using Backend_Gym_Iris.Data;
using Backend_Gym_Iris.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend_Gym_Iris.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly ApplicationDbContext _context;

        public RefreshTokenRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .Include(rt => rt.Admin)
                .FirstOrDefaultAsync(rt => rt.Token == token);
        }

        public async Task<RefreshToken> CreateAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            return refreshToken;
        }

        public async Task<RefreshToken> UpdateAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Update(refreshToken);
            await _context.SaveChangesAsync();
            return refreshToken;
        }

        public async Task<IEnumerable<RefreshToken>> GetActiveTokensByAdminIdAsync(int adminId)
        {
            return await _context.RefreshTokens
                .Where(rt => rt.AdminId == adminId && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();
        }

        public async Task RevokeAllByAdminIdAsync(int adminId)
        {
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.AdminId == adminId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }
    }
}
