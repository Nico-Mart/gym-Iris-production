using Backend_Gym_Iris.Enums;

namespace Backend_Gym_Iris.DTOs.MembershipPrice
{
    public record UpdatePriceRequest(decimal Price);

    public record PriceResponse(
        int Id,
        string Type,
        decimal Price,
        DateTime LastUpdated
    );
}
