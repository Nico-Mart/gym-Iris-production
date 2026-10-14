using Backend_Gym_Iris.Enums;

namespace Backend_Gym_Iris.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telephone { get; set; } = string.Empty;
        
        public DateTime JoinDate { get; set; } = DateTime.UtcNow;
        public MembershipStatus Status { get; set; } = MembershipStatus.Pending;
        public string Activity { get; set; } = string.Empty;

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        // Pilates appointments now handled by PilatesSchedule entity
        // kept for compatibility: none
    }
}
