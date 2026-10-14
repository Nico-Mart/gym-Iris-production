using Backend_Gym_Iris.Data;
using Backend_Gym_Iris.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend_Gym_Iris.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }
        public async Task<IEnumerable<User>> GetAllWithPaymentsAsync()
        {
            return await _context.Users
                .Include(u => u.Payments)
                .ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            
            return await _context.Users
                .Include(u => u.Payments)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> UpdateAsync(int id, User user)
        {
            var existing = await _context.Users.FindAsync(user.Id);
            if (existing == null) return null;

            existing.Name = user.Name;
            existing.Email = user.Email;
            existing.Telephone = user.Telephone;
            existing.Activity = user.Activity; 
            existing.Status = user.Status;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Users.AnyAsync(u => u.Id == id);
        }

        public async Task<(IEnumerable<User> Users, int TotalCount)> GetPagedWithPaymentsAsync(int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = _context.Users
                .Include(u => u.Payments)
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderBy(u => u.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (users, totalCount);
        }
    }
}
