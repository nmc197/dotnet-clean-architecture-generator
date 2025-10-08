using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.Email)
                .HasColumnName("Email")
                .HasMaxLength(100)
                .IsRequired()
;
            builder.Property(x => x.PhoneNumber)
                .HasColumnName("PhoneNumber")
                .HasMaxLength(20)
;
            builder.Property(x => x.FirstName)
                .HasColumnName("FirstName")
                .HasMaxLength(50)
                .IsRequired()
;
            builder.Property(x => x.LastName)
                .HasColumnName("LastName")
                .HasMaxLength(50)
                .IsRequired()
;
            builder.Property(x => x.DateOfBirth)
                .HasColumnName("DateOfBirth")
;
            builder.Property(x => x.Gender)
                .HasColumnName("Gender")
                .HasMaxLength(10)
;
            builder.Property(x => x.Address)
                .HasColumnName("Address")
                .HasMaxLength(500)
;
            builder.Property(x => x.ProvinceId)
                .HasColumnName("ProvinceId")
;
            builder.Property(x => x.DistrictId)
                .HasColumnName("DistrictId")
;
            builder.Property(x => x.WardId)
                .HasColumnName("WardId")
;
            builder.Property(x => x.UserStatusId)
                .HasColumnName("UserStatusId")
                .IsRequired()
;
            builder.Property(x => x.IsEmailVerified)
                .HasColumnName("IsEmailVerified")
                .IsRequired()
;
            builder.Property(x => x.IsPhoneVerified)
                .HasColumnName("IsPhoneVerified")
                .IsRequired()
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
