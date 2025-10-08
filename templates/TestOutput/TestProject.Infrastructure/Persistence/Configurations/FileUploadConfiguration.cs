using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class FileUploadConfiguration : IEntityTypeConfiguration<FileUpload>
    {
        public void Configure(EntityTypeBuilder<FileUpload> builder)
        {
            builder.ToTable("FileUploads");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.FileName)
                .HasColumnName("FileName")
                .HasMaxLength(200)
                .IsRequired()
;
            builder.Property(x => x.OriginalFileName)
                .HasColumnName("OriginalFileName")
                .HasMaxLength(200)
                .IsRequired()
;
            builder.Property(x => x.FilePath)
                .HasColumnName("FilePath")
                .HasMaxLength(500)
                .IsRequired()
;
            builder.Property(x => x.FileSize)
                .HasColumnName("FileSize")
                .IsRequired()
;
            builder.Property(x => x.MimeType)
                .HasColumnName("MimeType")
                .HasMaxLength(100)
                .IsRequired()
;
            builder.Property(x => x.FileExtension)
                .HasColumnName("FileExtension")
                .HasMaxLength(10)
;
            builder.Property(x => x.UploadedBy)
                .HasColumnName("UploadedBy")
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
