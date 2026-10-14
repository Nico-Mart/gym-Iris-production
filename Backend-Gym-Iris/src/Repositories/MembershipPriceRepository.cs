using Backend_Gym_Iris.Data;
using Backend_Gym_Iris.Entities;
using Backend_Gym_Iris.Enums;
using Microsoft.EntityFrameworkCore;

namespace Backend_Gym_Iris.Repositories
{
    public class MembershipPriceRepository : IMembershipPriceRepository
    {
        private readonly ApplicationDbContext _context;

        public MembershipPriceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MembershipPrice>> GetAllAsync()
        {
            return await _context.MembershipPrices.ToListAsync();
        }

        public async Task<MembershipPrice?> GetByIdAsync(int id)
        {
            return await _context.MembershipPrices.FindAsync(id);
        }

        public async Task<MembershipPrice?> GetByTypeAsync(MembershipType type)
        {
            return await _context.MembershipPrices
                .FirstOrDefaultAsync(mp => mp.Type == type);
        }

        public async Task<MembershipPrice> CreateAsync(MembershipPrice price)
        {
            _context.MembershipPrices.Add(price);
            await _context.SaveChangesAsync();
            return price;
        }

        public async Task<MembershipPrice?> UpdateAsync(MembershipPrice price)
        {
            var existingPrice = await _context.MembershipPrices.FindAsync(price.Id);
            if (existingPrice == null)
                return null;

            existingPrice.Price = price.Price;
            existingPrice.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingPrice;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var price = await _context.MembershipPrices.FindAsync(id);
            if (price == null)
                return false;

            _context.MembershipPrices.Remove(price);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
