using Backend_Gym_Iris.Enums;

namespace Backend_Gym_Iris.Entities
{
    public class Payment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public MembershipType MembershipType { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public int Month { get; set; }
        public int Year { get; set; }
        public string? Notes { get; set; }

        // Navegación
        public User User { get; set; } = null!;
    }
}
