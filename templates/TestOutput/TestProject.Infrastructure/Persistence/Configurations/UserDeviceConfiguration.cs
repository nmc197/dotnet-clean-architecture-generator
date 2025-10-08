using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class UserDeviceConfiguration : IEntityTypeConfiguration<UserDevice>
    {
        public void Configure(EntityTypeBuilder<UserDevice> builder)
        {
            builder.ToTable("UserDevices");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.UserId)
                .HasColumnName("UserId")
                .IsRequired()
;
            builder.Property(x => x.DeviceId)
                .HasColumnName("DeviceId")
                .HasMaxLength(100)
                .IsRequired()
;
            builder.Property(x => x.DeviceName)
                .HasColumnName("DeviceName")
                .HasMaxLength(100)
;
            builder.Property(x => x.DeviceType)
                .HasColumnName("DeviceType")
                .HasMaxLength(20)
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
