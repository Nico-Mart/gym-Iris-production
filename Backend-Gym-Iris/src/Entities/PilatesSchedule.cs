using System;

namespace Backend_Gym_Iris.Entities
{
    public class PilatesSchedule
    {
        public int Id { get; set; }

        // FK to Users table
        public int UserId { get; set; }

        // Day index 0..4 (Monday..Friday)
        public int DayIndex { get; set; }

        // Slot index (0-based identifier for time slot)
        public int SlotIndex { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
