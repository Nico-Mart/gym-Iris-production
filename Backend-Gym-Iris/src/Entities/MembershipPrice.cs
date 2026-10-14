using Backend_Gym_Iris.Enums;

namespace Backend_Gym_Iris.Entities
{
    public class MembershipPrice
    {
        public int Id { get; set; }
        public MembershipType Type { get; set; }
        public decimal Price { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
