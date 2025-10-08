using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class NotificationCategoryConfiguration : IEntityTypeConfiguration<NotificationCategory>
    {
        public void Configure(EntityTypeBuilder<NotificationCategory> builder)
        {
            builder.ToTable("NotificationCategorys");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.Code)
                .HasColumnName("Code")
                .HasMaxLength(20)
                .IsRequired()
;
            builder.Property(x => x.Color)
                .HasColumnName("Color")
                .HasMaxLength(7)
;
            builder.Property(x => x.SortOrder)
                .HasColumnName("SortOrder")
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
