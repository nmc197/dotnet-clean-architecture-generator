using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLogs");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.UserId)
                .HasColumnName("UserId")
;
            builder.Property(x => x.EntityName)
                .HasColumnName("EntityName")
                .HasMaxLength(100)
                .IsRequired()
;
            builder.Property(x => x.EntityId)
                .HasColumnName("EntityId")
                .IsRequired()
;
            builder.Property(x => x.Action)
                .HasColumnName("Action")
                .HasMaxLength(20)
                .IsRequired()
;
            builder.Property(x => x.OldValues)
                .HasColumnName("OldValues")
                .HasMaxLength(2000)
;
            builder.Property(x => x.NewValues)
                .HasColumnName("NewValues")
                .HasMaxLength(2000)
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
