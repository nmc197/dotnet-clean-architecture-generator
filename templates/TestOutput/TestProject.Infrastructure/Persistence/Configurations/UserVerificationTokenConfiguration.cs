using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class UserVerificationTokenConfiguration : IEntityTypeConfiguration<UserVerificationToken>
    {
        public void Configure(EntityTypeBuilder<UserVerificationToken> builder)
        {
            builder.ToTable("UserVerificationTokens");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.UserId)
                .HasColumnName("UserId")
                .IsRequired()
;
            builder.Property(x => x.Token)
                .HasColumnName("Token")
                .HasMaxLength(200)
                .IsRequired()
;
            builder.Property(x => x.TokenType)
                .HasColumnName("TokenType")
                .HasMaxLength(20)
                .IsRequired()
;
            builder.Property(x => x.ExpiresAt)
                .HasColumnName("ExpiresAt")
                .IsRequired()
;
            builder.Property(x => x.IsUsed)
                .HasColumnName("IsUsed")
                .IsRequired()
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
