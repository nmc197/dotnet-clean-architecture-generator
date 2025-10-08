using TestProject.Domain.Entities;
using TestProject.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;

namespace TestProject.Infrastructure.Persistence
{
    public class TestProjectContext : DbContext
    {
        public TestProjectContext(DbContextOptions<TestProjectContext> options) : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<Action> Actions { get; set; }
        public DbSet<Menu> Menus { get; set; }
        public DbSet<ActionInMenu> ActionInMenus { get; set; }
        public DbSet<UserSession> UserSessions { get; set; }
        public DbSet<UserDevice> UserDevices { get; set; }
        public DbSet<UserStatus> UserStatuses { get; set; }
        public DbSet<UserVerificationToken> UserVerificationTokens { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<SystemConfig> SystemConfigs { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationCategory> NotificationCategories { get; set; }
        public DbSet<NotificationType> NotificationTypes { get; set; }
        public DbSet<UserNotification> UserNotifications { get; set; }
        public DbSet<Province> Provinces { get; set; }
        public DbSet<District> Districts { get; set; }
        public DbSet<Ward> Wards { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<TagType> TagTypes { get; set; }
        public DbSet<FileUpload> FileUploads { get; set; }
        public DbSet<FolderUpload> FolderUploads { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply all configurations
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(TestProjectContext).Assembly);

            // Global query filters for soft delete
            modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Role>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserRole>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Permission>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Action>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Menu>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ActionInMenu>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserSession>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserDevice>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserStatus>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserVerificationToken>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ActivityLog>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<AuditLog>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<SystemConfig>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Notification>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<NotificationCategory>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<NotificationType>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserNotification>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Province>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<District>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Ward>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Tag>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TagType>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<FileUpload>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<FolderUpload>().HasQueryFilter(e => !e.IsDeleted);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Update audit fields
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is IAuditable auditable)
                {
                    switch (entry.State)
                    {
                        case EntityState.Added:
                            auditable.CreatedDate = DateTime.UtcNow;
                            break;
                        case EntityState.Modified:
                            auditable.LastModifiedDate = DateTime.UtcNow;
                            break;
                    }
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
