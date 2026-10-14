using Backend_Gym_Iris.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend_Gym_Iris.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {

            builder.HasIndex(u => u.Email)
                .IsUnique()
                .HasDatabaseName("IX_Users_Email_Unique");

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(256);
        }
    }
}
