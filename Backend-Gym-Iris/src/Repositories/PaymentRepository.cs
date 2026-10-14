using Backend_Gym_Iris.Data;
using Backend_Gym_Iris.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend_Gym_Iris.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ApplicationDbContext _context;

        public PaymentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Payment>> GetAllAsync()
        {
            return await _context.Payments
                .Include(p => p.User)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Payment>> GetByUserIdAsync(int userId)
        {
            return await _context.Payments
                .Include(p => p.User)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.Year)
                .ThenByDescending(p => p.Month)
                .ToListAsync();
        }

        public async Task<Payment?> GetByIdAsync(int id)
        {
            return await _context.Payments
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Payment?> GetByUserAndMonthAsync(int userId, int month, int year)
        {
            return await _context.Payments
                .FirstOrDefaultAsync(p => p.UserId == userId && p.Month == month && p.Year == year);
        }

        public async Task<Payment> CreateAsync(Payment payment)
        {
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Recargar con User incluido
            return await _context.Payments
                .Include(p => p.User)
                .FirstAsync(p => p.Id == payment.Id);
        }

        public async Task<Payment?> UpdateAsync(Payment payment)
        {
            var existing = await _context.Payments
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == payment.Id);

            if (existing == null) return null;

            existing.Amount = payment.Amount;
            existing.PaymentDate = payment.PaymentDate;
            existing.Notes = payment.Notes;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
                return false;

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int userId, int month, int year)
        {
            return await _context.Payments
                .AnyAsync(p => p.UserId == userId && p.Month == month && p.Year == year);
        }
    }
}
