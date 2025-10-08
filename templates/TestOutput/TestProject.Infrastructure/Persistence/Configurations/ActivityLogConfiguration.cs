using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
    {
        public void Configure(EntityTypeBuilder<ActivityLog> builder)
        {
            builder.ToTable("ActivityLogs");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.UserId)
                .HasColumnName("UserId")
;
            builder.Property(x => x.Action)
                .HasColumnName("Action")
                .HasMaxLength(100)
                .IsRequired()
;
            builder.Property(x => x.Description)
                .HasColumnName("Description")
                .HasMaxLength(500)
;
            builder.Property(x => x.IpAddress)
                .HasColumnName("IpAddress")
                .HasMaxLength(50)
;
            builder.Property(x => x.UserAgent)
                .HasColumnName("UserAgent")
                .HasMaxLength(500)
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
