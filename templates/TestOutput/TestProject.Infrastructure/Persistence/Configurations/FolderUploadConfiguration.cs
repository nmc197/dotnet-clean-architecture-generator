using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class FolderUploadConfiguration : IEntityTypeConfiguration<FolderUpload>
    {
        public void Configure(EntityTypeBuilder<FolderUpload> builder)
        {
            builder.ToTable("FolderUploads");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.FolderName)
                .HasColumnName("FolderName")
                .HasMaxLength(200)
                .IsRequired()
;
            builder.Property(x => x.FolderPath)
                .HasColumnName("FolderPath")
                .HasMaxLength(500)
                .IsRequired()
;
            builder.Property(x => x.CreatedBy)
                .HasColumnName("CreatedBy")
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
