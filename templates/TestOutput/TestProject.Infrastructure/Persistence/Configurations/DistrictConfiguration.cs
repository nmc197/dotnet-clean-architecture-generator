using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class DistrictConfiguration : IEntityTypeConfiguration<District>
    {
        public void Configure(EntityTypeBuilder<District> builder)
        {
            builder.ToTable("Districts");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.ProvinceId)
                .HasColumnName("ProvinceId")
                .IsRequired()
;
            builder.Property(x => x.Code)
                .HasColumnName("Code")
                .HasMaxLength(10)
                .IsRequired()
;
            builder.Property(x => x.Name)
                .HasColumnName("Name")
                .HasMaxLength(100)
                .IsRequired()
;
            builder.Property(x => x.SortOrder)
                .HasColumnName("SortOrder")
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
