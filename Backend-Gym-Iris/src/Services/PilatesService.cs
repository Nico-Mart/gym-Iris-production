using Backend_Gym_Iris.Data;
using Backend_Gym_Iris.DTOs.User;
using Backend_Gym_Iris.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend_Gym_Iris.Services
{
    public class PilatesService : IPilatesService
    {
        private readonly ApplicationDbContext _context;
        private const int MAX_CAPACITY = 4;

        public PilatesService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Dictionary<int, Dictionary<int, List<UserSimpleDTO>>>> GetScheduleAsync()
        {
            var entries = await _context.PilatesSchedules.AsNoTracking().ToListAsync();

            var schedule = new Dictionary<int, Dictionary<int, List<UserSimpleDTO>>>();

            var userIds = entries.Select(e => e.UserId).Distinct().ToList();
            var users = await _context.Users.Where(u => userIds.Contains(u.Id)).AsNoTracking().ToListAsync();

            foreach (var e in entries)
            {
                if (!schedule.ContainsKey(e.DayIndex))
                    schedule[e.DayIndex] = new Dictionary<int, List<UserSimpleDTO>>();

                if (!schedule[e.DayIndex].ContainsKey(e.SlotIndex))
                    schedule[e.DayIndex][e.SlotIndex] = new List<UserSimpleDTO>();

                var user = users.FirstOrDefault(u => u.Id == e.UserId);
                if (user != null)
                {
                    schedule[e.DayIndex][e.SlotIndex].Add(new UserSimpleDTO
                    {
                        Id = user.Id,
                        FullName = user.Name,
                        Email = user.Email
                    });
                }
            }

            return schedule;
        }

        public async Task<PilatesSchedule> AssignAsync(int userId, int dayIndex, int slotIndex)
        {
            if (dayIndex < 0 || dayIndex > 4)
                throw new Backend_Gym_Iris.Exceptions.ValidationException("DayIndex must be between 0 and 4.");

            if (slotIndex < 0)
                throw new Backend_Gym_Iris.Exceptions.ValidationException("SlotIndex must be >= 0.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Backend_Gym_Iris.Exceptions.NotFoundException("User not found.");

            var hasSameDay = await _context.PilatesSchedules
                .AnyAsync(a => a.UserId == userId && a.DayIndex == dayIndex);
            if (hasSameDay)
                throw new Backend_Gym_Iris.Exceptions.ValidationException("User already has a Pilates slot assigned for this day.");

            var distinctDays = await _context.PilatesSchedules
                .Where(a => a.UserId == userId)
                .Select(a => a.DayIndex)
                .Distinct()
                .CountAsync();
            if (distinctDays >= 2)
                throw new Backend_Gym_Iris.Exceptions.ValidationException("User cannot be assigned to more than 2 different days per week.");

            var slotCount = await _context.PilatesSchedules
                .CountAsync(a => a.DayIndex == dayIndex && a.SlotIndex == slotIndex);
            if (slotCount >= MAX_CAPACITY)
                throw new Backend_Gym_Iris.Exceptions.ConflictException("This time slot is full (maximum 4 users).");

            var entry = new PilatesSchedule
            {
                UserId = userId,
                DayIndex = dayIndex,
                SlotIndex = slotIndex
            };

            _context.PilatesSchedules.Add(entry);
            await _context.SaveChangesAsync();

            return entry;
        }

        public async Task RemoveAsync(int userId, int dayIndex, int slotIndex)
        {
            var entry = await _context.PilatesSchedules
                .FirstOrDefaultAsync(e => e.UserId == userId && e.DayIndex == dayIndex && e.SlotIndex == slotIndex);
            if (entry == null)
                throw new Backend_Gym_Iris.Exceptions.NotFoundException("Pilates assignment not found.");

            _context.PilatesSchedules.Remove(entry);
            await _context.SaveChangesAsync();
        }
    }
}
