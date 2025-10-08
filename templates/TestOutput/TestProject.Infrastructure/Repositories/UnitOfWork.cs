using TestProject.Domain.Abstractions;
using TestProject.Domain.Interfaces.Repositories;
using TestProject.Infrastructure.Persistence;
using TestProject.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace TestProject.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly TestProjectContext _context;
        private readonly IServiceProvider _serviceProvider;

        public UnitOfWork(TestProjectContext context, IServiceProvider serviceProvider)
        {
            _context = context;
            _serviceProvider = serviceProvider;
        }

        // Repository properties
        public IUserRepository Users => GetRepository<IUserRepository>();
        public IRoleRepository Roles => GetRepository<IRoleRepository>();
        public IUserRoleRepository UserRoles => GetRepository<IUserRoleRepository>();
        public IPermissionRepository Permissions => GetRepository<IPermissionRepository>();
        public IActionRepository Actions => GetRepository<IActionRepository>();
        public IMenuRepository Menus => GetRepository<IMenuRepository>();
        public IActionInMenuRepository ActionInMenus => GetRepository<IActionInMenuRepository>();
        public IUserSessionRepository UserSessions => GetRepository<IUserSessionRepository>();
        public IUserDeviceRepository UserDevices => GetRepository<IUserDeviceRepository>();
        public IUserStatusRepository UserStatuses => GetRepository<IUserStatusRepository>();
        public IUserVerificationTokenRepository UserVerificationTokens => GetRepository<IUserVerificationTokenRepository>();
        public IActivityLogRepository ActivityLogs => GetRepository<IActivityLogRepository>();
        public IAuditLogRepository AuditLogs => GetRepository<IAuditLogRepository>();
        public ISystemConfigRepository SystemConfigs => GetRepository<ISystemConfigRepository>();
        public INotificationRepository Notifications => GetRepository<INotificationRepository>();
        public INotificationCategoryRepository NotificationCategories => GetRepository<INotificationCategoryRepository>();
        public INotificationTypeRepository NotificationTypes => GetRepository<INotificationTypeRepository>();
        public IUserNotificationRepository UserNotifications => GetRepository<IUserNotificationRepository>();
        public IProvinceRepository Provinces => GetRepository<IProvinceRepository>();
        public IDistrictRepository Districts => GetRepository<IDistrictRepository>();
        public IWardRepository Wards => GetRepository<IWardRepository>();
        public ITagRepository Tags => GetRepository<ITagRepository>();
        public ITagTypeRepository TagTypes => GetRepository<ITagTypeRepository>();
        public IFileUploadRepository FileUploads => GetRepository<IFileUploadRepository>();
        public IFolderUploadRepository FolderUploads => GetRepository<IFolderUploadRepository>();

        private T GetRepository<T>() where T : class
        {
            return _serviceProvider.GetRequiredService<T>();
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            await _context.Database.BeginTransactionAsync(cancellationToken);
        }

        public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        {
            await _context.Database.CommitTransactionAsync(cancellationToken);
        }

        public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
        {
            await _context.Database.RollbackTransactionAsync(cancellationToken);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
