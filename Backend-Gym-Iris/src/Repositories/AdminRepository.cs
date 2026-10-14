using Backend_Gym_Iris.Data;
using Backend_Gym_Iris.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend_Gym_Iris.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private readonly ApplicationDbContext _context;

        public AdminRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Admin?> GetFirstAdminAsync()
        {
            return await _context.Admins.FirstOrDefaultAsync();
        }

        public async Task<Admin?> GetByIdAsync(int id)
        {
            return await _context.Admins.FindAsync(id);
        }

        public async Task<Admin> UpdateAsync(Admin admin)
        {
            _context.Admins.Update(admin);
            await _context.SaveChangesAsync();
            return admin;
        }

        public async Task<Admin> CreateAsync(Admin admin)
        {
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(admin.PasswordHash);
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();
            return admin;
        }
    }
}
