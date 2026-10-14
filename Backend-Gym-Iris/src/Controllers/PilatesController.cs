using Backend_Gym_Iris.Data;
using Backend_Gym_Iris.Entities;
using Backend_Gym_Iris.DTOs.User;
using Backend_Gym_Iris.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend_Gym_Iris.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PilatesController : ControllerBase
    {
        private readonly IPilatesService _pilatesService;

        public PilatesController(IPilatesService pilatesService)
        {
            _pilatesService = pilatesService;
        }

        // GET: api/Pilates/schedule
        // Returns a nested structure: days -> slots -> list of users
        [HttpGet("schedule")]
        public async Task<IActionResult> GetSchedule()
        {
            var schedule = await _pilatesService.GetScheduleAsync();
            return Ok(schedule);
        }

        public class AssignRequest
        {
            public int UserId { get; set; }
            public int DayIndex { get; set; }
            public int SlotIndex { get; set; }
        }

        // POST: api/Pilates/assign
        [HttpPost("assign")]
        public async Task<IActionResult> Assign([FromBody] AssignRequest request)
        {
            var entry = await _pilatesService.AssignAsync(request.UserId, request.DayIndex, request.SlotIndex);
            return CreatedAtAction(nameof(GetSchedule), new { id = entry.Id }, entry);
        }

        // DELETE: api/Pilates/remove/{userId}/{dayIndex}/{slotIndex}
        [HttpDelete("remove/{userId:int}/{dayIndex:int}/{slotIndex:int}")]
        public async Task<IActionResult> Remove(int userId, int dayIndex, int slotIndex)
        {
            await _pilatesService.RemoveAsync(userId, dayIndex, slotIndex);
            return NoContent();
        }
    }
}
