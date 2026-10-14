namespace Backend_Gym_Iris.DTOs.User
{
    public class UserSimpleDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
    }
}
