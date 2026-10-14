using Backend_Gym_Iris.Entities;
using Backend_Gym_Iris.Enums;
using Backend_Gym_Iris.Repositories;

namespace Backend_Gym_Iris.Services
{
    public class MembershipPriceService : IMembershipPriceService
    {
        private readonly IMembershipPriceRepository _priceRepository;

        public MembershipPriceService(IMembershipPriceRepository priceRepository)
        {
            _priceRepository = priceRepository;
        }

        public async Task<IEnumerable<MembershipPrice>> GetAllPricesAsync()
        {
            return await _priceRepository.GetAllAsync();
        }

        public async Task<MembershipPrice?> GetPriceByIdAsync(int id)
        {
            return await _priceRepository.GetByIdAsync(id);
        }

        public async Task<MembershipPrice?> GetPriceByTypeAsync(MembershipType type)
        {
            return await _priceRepository.GetByTypeAsync(type);
        }

        public async Task<MembershipPrice> UpdatePriceAsync(int id, decimal newPrice)
        {
            if (newPrice <= 0)
                throw new Backend_Gym_Iris.Exceptions.ValidationException("El precio debe ser mayor a 0");

            var existingPrice = await _priceRepository.GetByIdAsync(id);
            if (existingPrice == null)
                throw new Backend_Gym_Iris.Exceptions.NotFoundException($"Precio con ID {id} no encontrado");

            existingPrice.Price = newPrice;
            existingPrice.LastUpdated = DateTime.UtcNow;

            var updated = await _priceRepository.UpdateAsync(existingPrice);
            return updated!;
        }

        private Backend_Gym_Iris.DTOs.MembershipPrice.PriceResponse MapToResponse(MembershipPrice p)
        {
            return new Backend_Gym_Iris.DTOs.MembershipPrice.PriceResponse(
                p.Id,
                p.Type.ToString(),
                p.Price,
                p.LastUpdated
            );
        }

        public async Task<IEnumerable<Backend_Gym_Iris.DTOs.MembershipPrice.PriceResponse>> GetAllPricesResponseAsync()
        {
            var prices = await GetAllPricesAsync();
            return prices.Select(MapToResponse);
        }

        public async Task<Backend_Gym_Iris.DTOs.MembershipPrice.PriceResponse> GetPriceResponseAsync(int id)
        {
            var price = await GetPriceByIdAsync(id);
            if (price == null)
                throw new Backend_Gym_Iris.Exceptions.NotFoundException($"Precio con ID {id} no encontrado");

            return MapToResponse(price);
        }

        public async Task<Backend_Gym_Iris.DTOs.MembershipPrice.PriceResponse> UpdatePriceResponseAsync(int id, decimal newPrice)
        {
            var updated = await UpdatePriceAsync(id, newPrice);
            return MapToResponse(updated);
        }
    }
}
