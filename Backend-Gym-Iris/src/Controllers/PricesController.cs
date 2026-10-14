using Backend_Gym_Iris.DTOs.MembershipPrice;
using Backend_Gym_Iris.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_Gym_Iris.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PricesController : ControllerBase
    {
        private readonly IMembershipPriceService _priceService;

        public PricesController(IMembershipPriceService priceService)
        {
            _priceService = priceService;
        }

        /// <summary>
        /// Obtiene todos los precios de membresías
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PriceResponse>>> GetAllPrices()
        {
            var response = await _priceService.GetAllPricesResponseAsync();
            return Ok(response);
        }

        /// <summary>
        /// Obtiene el precio de un tipo específico de membresía
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PriceResponse>> GetPrice(int id)
        {
            var response = await _priceService.GetPriceResponseAsync(id);
            return Ok(response);
        }

        /// <summary>
        /// Actualiza el precio de una membresía (solo Admin)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<PriceResponse>> UpdatePrice(int id, [FromBody] UpdatePriceRequest request)
        {
            try
            {
                var response = await _priceService.UpdatePriceResponseAsync(id, request.Price);
                return Ok(response);
            }
            catch (Backend_Gym_Iris.Exceptions.NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Backend_Gym_Iris.Exceptions.ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
