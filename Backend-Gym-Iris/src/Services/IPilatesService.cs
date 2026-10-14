using Backend_Gym_Iris.DTOs.User;
using Backend_Gym_Iris.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend_Gym_Iris.Services
{
    public interface IPilatesService
    {
        Task<Dictionary<int, Dictionary<int, List<UserSimpleDTO>>>> GetScheduleAsync();
        Task<PilatesSchedule> AssignAsync(int userId, int dayIndex, int slotIndex);
        Task RemoveAsync(int userId, int dayIndex, int slotIndex);
    }
}
