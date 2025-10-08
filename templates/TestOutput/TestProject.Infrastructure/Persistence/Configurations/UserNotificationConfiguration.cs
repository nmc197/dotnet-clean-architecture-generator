using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class UserNotificationConfiguration : IEntityTypeConfiguration<UserNotification>
    {
        public void Configure(EntityTypeBuilder<UserNotification> builder)
        {
            builder.ToTable("UserNotifications");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.UserId)
                .HasColumnName("UserId")
                .IsRequired()
;
            builder.Property(x => x.NotificationId)
                .HasColumnName("NotificationId")
                .IsRequired()
;
            builder.Property(x => x.IsRead)
                .HasColumnName("IsRead")
                .IsRequired()
;
            builder.Property(x => x.ReadAt)
                .HasColumnName("ReadAt")
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
