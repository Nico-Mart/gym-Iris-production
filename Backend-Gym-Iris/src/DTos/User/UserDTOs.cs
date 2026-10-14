using Backend_Gym_Iris.Enums;

namespace Backend_Gym_Iris.DTOs.User
{
    public record CreateUserRequest(
        string Name,
        string Email,
        string Telephone,
        string Activity
    );

    public record UpdateUserRequest(
        string Name,
        string Email,
        string Telephone,
        string Activity,
        MembershipStatus Status
    );

    public record UserResponse(
        int Id,
        string Name,
        string Email,
        string Telephone,
        DateTime JoinDate,
        string Status,
        string Activity,
        List<PaymentInfo> Payments
    );

    public record PaymentInfo(
        int Id,
        string Month,       
        string Status,      
        decimal Amount,
        decimal? PaidAmount,
        string? PaidDate    
    );
}