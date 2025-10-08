using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
    {
        public void Configure(EntityTypeBuilder<UserRole> builder)
        {
            builder.ToTable("UserRoles");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.UserId)
                .HasColumnName("UserId")
                .IsRequired()
;
            builder.Property(x => x.RoleId)
                .HasColumnName("RoleId")
                .IsRequired()
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
