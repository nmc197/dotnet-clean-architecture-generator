using TestProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TestProject.Infrastructure.Persistence.Configurations
{
    public class ActionInMenuConfiguration : IEntityTypeConfiguration<ActionInMenu>
    {
        public void Configure(EntityTypeBuilder<ActionInMenu> builder)
        {
            builder.ToTable("ActionInMenus");

            builder.HasKey(x => x.);

            // Properties
            builder.Property(x => x.ActionId)
                .HasColumnName("ActionId")
                .IsRequired()
;
            builder.Property(x => x.MenuId)
                .HasColumnName("MenuId")
                .IsRequired()
;
            builder.Property(x => x.RoleId)
                .HasColumnName("RoleId")
                .IsRequired()
;

            // Soft delete
            builder.Property(x => x.IsDeleted).HasDefaultValue(false);
        }
    }
}
