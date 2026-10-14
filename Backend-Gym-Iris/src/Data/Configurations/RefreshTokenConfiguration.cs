using Backend_Gym_Iris.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend_Gym_Iris.Data.Configurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasKey(rt => rt.Id);

            builder.Property(rt => rt.Token)
                .IsRequired();

            builder.HasIndex(rt => rt.Token)
                .IsUnique();

            builder.Property(rt => rt.CreatedAt)
                .IsRequired();

            builder.Property(rt => rt.ExpiresAt)
                .IsRequired();

            builder.Property(rt => rt.IsRevoked)
                .HasDefaultValue(false);

            // Relación con Admin
            builder.HasOne(rt => rt.Admin)
                .WithMany()
                .HasForeignKey(rt => rt.AdminId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
