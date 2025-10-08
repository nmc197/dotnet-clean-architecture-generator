using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class SystemConfigConfiguration : IEntityTypeConfiguration<SystemConfig>
    {
        public void Configure(EntityTypeBuilder<SystemConfig> builder)
        {
            builder.ToTable("SystemConfigs");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.Key)
                .HasColumnName("Key")
                .HasMaxLength(100)
                .IsRequired()
;
            builder.Property(x => x.Value)
                .HasColumnName("Value")
                .HasMaxLength(1000)
;
            builder.Property(x => x.Description)
                .HasColumnName("Description")
                .HasMaxLength(500)
;
            builder.Property(x => x.IsActive)
                .HasColumnName("IsActive")
                .IsRequired()
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
