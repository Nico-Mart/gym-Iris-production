using Backend_Gym_Iris.Enums;

namespace Backend_Gym_Iris.DTOs.Payment
{
    public record CreatePaymentRequest(
        int UserId,
        MembershipType MembershipType,
        decimal Amount,
        int Month,
        int Year,
        string? Notes
    );

    public record UpdatePaymentRequest(
        decimal Amount,
        DateTime PaymentDate,
        string? Notes
    );

    public record PaymentResponse(
        int Id,
        int UserId,
        string UserName,
        string MembershipType,
        decimal Amount,
        DateTime PaymentDate,
        int Month,
        int Year,
        string? Notes
    );
}
