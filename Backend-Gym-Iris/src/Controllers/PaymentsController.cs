using Backend_Gym_Iris.DTOs.Payment;
using Backend_Gym_Iris.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_Gym_Iris.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Obtiene todos los pagos
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentResponse>>> GetPayments()
        {
            var response = await _paymentService.GetAllPaymentsResponseAsync();
            return Ok(response);
        }

        /// <summary>
        /// Obtiene un pago por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentResponse>> GetPayment(int id)
        {
            try
            {
                var payment = await _paymentService.GetPaymentByIdAsync(id);
                var response = new PaymentResponse(
                    payment.Id,
                    payment.UserId,
                    payment.User.Name,
                    payment.MembershipType.ToString(),
                    payment.Amount,
                    payment.PaymentDate,
                    payment.Month,
                    payment.Year,
                    payment.Notes
                );
                return Ok(response);
            }
            catch (Backend_Gym_Iris.Exceptions.NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene todos los pagos de un usuario
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<PaymentResponse>>> GetPaymentsByUser(int userId)
        {
            var payments = await _paymentService.GetPaymentsByUserIdAsync(userId);
            var response = payments.Select(p => new PaymentResponse(
                p.Id,
                p.UserId,
                p.User.Name,
                p.MembershipType.ToString(),
                p.Amount,
                p.PaymentDate,
                p.Month,
                p.Year,
                p.Notes
            ));
            return Ok(response);
        }

        /// <summary>
        /// Obtiene el total pagado por un usuario
        /// </summary>
        [HttpGet("user/{userId}/total")]
        public async Task<ActionResult<object>> GetTotalPaidByUser(int userId)
        {
            var total = await _paymentService.GetTotalPaidByUserAsync(userId);
            return Ok(new { userId, totalPaid = total });
        }

        /// <summary>
        /// Verifica si un usuario pagó un mes específico
        /// </summary>
        [HttpGet("user/{userId}/check/{year}/{month}")]
        public async Task<ActionResult<object>> CheckMonthPaid(int userId, int year, int month)
        {
            var hasPaid = await _paymentService.HasPaidMonthAsync(userId, month, year);
            return Ok(new { userId, year, month, hasPaid });
        }

        /// <summary>
        /// Crea un nuevo pago
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PaymentResponse>> CreatePayment([FromBody] CreatePaymentRequest request)
        {
            var response = await _paymentService.CreatePaymentResponseAsync(request);
            return CreatedAtAction(nameof(GetPayment), new { id = response.Id }, response);
        }

        /// <summary>
        /// Actualiza un pago existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePayment(int id, [FromBody] UpdatePaymentRequest request)
        {
            var response = await _paymentService.UpdatePaymentResponseAsync(id, request);
            return Ok(response);
        }

        /// <summary>
        /// Elimina un pago
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            await _paymentService.DeletePaymentAsync(id);
            return NoContent();
        }
    }
}
