using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class UserSessionConfiguration : IEntityTypeConfiguration<UserSession>
    {
        public void Configure(EntityTypeBuilder<UserSession> builder)
        {
            builder.ToTable("UserSessions");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.UserId)
                .HasColumnName("UserId")
                .IsRequired()
;
            builder.Property(x => x.AccessTokenJti)
                .HasColumnName("AccessTokenJti")
                .HasMaxLength(100)
                .IsRequired()
;
            builder.Property(x => x.RefreshTokenJti)
                .HasColumnName("RefreshTokenJti")
                .HasMaxLength(100)
                .IsRequired()
;
            builder.Property(x => x.IsRevoked)
                .HasColumnName("IsRevoked")
                .IsRequired()
;
            builder.Property(x => x.ExpiresAt)
                .HasColumnName("ExpiresAt")
                .IsRequired()
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
