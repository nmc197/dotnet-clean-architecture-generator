using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("Notifications");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.Title)
                .HasColumnName("Title")
                .HasMaxLength(200)
                .IsRequired()
;
            builder.Property(x => x.Content)
                .HasColumnName("Content")
                .HasMaxLength(2000)
                .IsRequired()
;
            builder.Property(x => x.NotificationCategoryId)
                .HasColumnName("NotificationCategoryId")
                .IsRequired()
;
            builder.Property(x => x.NotificationTypeId)
                .HasColumnName("NotificationTypeId")
                .IsRequired()
;
            builder.Property(x => x.IsActive)
                .HasColumnName("IsActive")
                .IsRequired()
;
            builder.Property(x => x.PublishedAt)
                .HasColumnName("PublishedAt")
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
