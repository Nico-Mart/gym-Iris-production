using Backend_Gym_Iris.DTOs.Payment;
using Backend_Gym_Iris.Entities;

namespace Backend_Gym_Iris.Services
{
    public interface IPaymentService
    {
        Task<IEnumerable<Payment>> GetAllPaymentsAsync();
        Task<IEnumerable<Payment>> GetPaymentsByUserIdAsync(int userId);
        Task<Payment> GetPaymentByIdAsync(int id);
        Task<IEnumerable<Backend_Gym_Iris.DTOs.Payment.PaymentResponse>> GetAllPaymentsResponseAsync();
        Task<Backend_Gym_Iris.DTOs.Payment.PaymentResponse> GetPaymentResponseAsync(int id);
        Task<IEnumerable<Backend_Gym_Iris.DTOs.Payment.PaymentResponse>> GetPaymentsByUserResponseAsync(int userId);
        Task<Payment> CreatePaymentAsync(CreatePaymentRequest request);
        Task<Backend_Gym_Iris.DTOs.Payment.PaymentResponse> CreatePaymentResponseAsync(CreatePaymentRequest request);
        Task<Payment> UpdatePaymentAsync(int id, UpdatePaymentRequest request);
        Task<Backend_Gym_Iris.DTOs.Payment.PaymentResponse> UpdatePaymentResponseAsync(int id, UpdatePaymentRequest request);
        Task DeletePaymentAsync(int id);
        Task<decimal> GetTotalPaidByUserAsync(int userId);
        Task<bool> HasPaidMonthAsync(int userId, int month, int year);
    }
}
