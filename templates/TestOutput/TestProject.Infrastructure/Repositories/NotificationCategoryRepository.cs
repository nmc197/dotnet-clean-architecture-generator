using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Infrastructure.Repositories
{
    public class NotificationCategoryRepository : RepositoryBase<NotificationCategory, int>, INotificationCategoryRepository
    {
        private readonly TestProjectContext _context;
        private readonly IStorageService _storageService;
        
        public NotificationCategoryRepository(TestProjectContext context, IUnitOfWork unitOfWork, IStorageService storageService) 
            : base(context, unitOfWork)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _storageService = storageService;
        }

        public async Task<DTResult<NotificationCategoryAggregate>> GetPagedAsync(NotificationCategoryDTParameters parameters)
        {
            var keyword = parameters.Search?.Value;
            var orderCriteria = string.Empty;
            var orderAscendingDirection = true;
            
            if (parameters.Order != null && parameters.Order.Any())
            {
                orderCriteria = parameters.Columns[parameters.Order[0].Column].Data;
                orderAscendingDirection = parameters.Order[0].Dir.ToString().ToLower() == "asc";
            }
            else
            {
                orderCriteria = "Id";
                orderAscendingDirection = true;
            }

            var query = _context.NotificationCategories
                .Where(x => !x.IsDeleted)
                .Select(x => new NotificationCategoryAggregate
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    CreatedDate = x.CreatedDate,
                    CreatedBy = x.CreatedBy,
                    LastModifiedDate = x.LastModifiedDate,
                    UpdatedBy = x.UpdatedBy
                });

            var totalRecord = await query.CountAsync();

            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query
                    .Where(x => 
                        EF.Functions.Collate(x.Name.ToLower(), SQLParams.Latin_General).Contains(EF.Functions.Collate(keyword, SQLParams.Latin_General)) ||
                        (x.Description != null && EF.Functions.Collate(x.Description.ToLower(), SQLParams.Latin_General).Contains(EF.Functions.Collate(keyword, SQLParams.Latin_General))) ||
                        x.CreatedDate.ToVietnameseDateTimeOffset().Contains(keyword)
                    );
            }

            foreach (var column in parameters.Columns)
            {
                var search = column.Search.Value;
                if (!search.Contains("/"))
                {
                    search = column.Search.Value.ToLower();
                }
                if (string.IsNullOrEmpty(search)) continue;
                
                switch (column.Data)
                {
                    case "name":
                        query = query
                            .Where(r => EF.Functions.Collate(r.Name.ToLower(), SQLParams.Latin_General).Contains(EF.Functions.Collate(search, SQLParams.Latin_General)));
                        break;
                    case "description":
                        query = query.Where(r => r.Description != null && EF.Functions.Collate(r.Description.ToLower(), SQLParams.Latin_General).Contains(EF.Functions.Collate(search, SQLParams.Latin_General)));
                        break;
                    case "createdDate":
                        if (search.Contains(" - "))
                        {
                            var dates = search.Split(" - ");
                            var startDate = DateTime.ParseExact(dates[0], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            var endDate = DateTime.ParseExact(dates[1], "dd/MM/yyyy", CultureInfo.InvariantCulture).AddDays(1).AddSeconds(-1);
                            query = query.Where(c => c.CreatedDate >= startDate && c.CreatedDate <= endDate);
                        }
                        else
                        {
                            var date = DateTime.ParseExact(search, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            query = query.Where(c => c.CreatedDate.Date == date.Date);
                        }
                        break;
                }
            }

            query = orderAscendingDirection ? 
                query.OrderByDynamic(orderCriteria, LinqExtensions.Order.Asc) : 
                query.OrderByDynamic(orderCriteria, LinqExtensions.Order.Desc);

            var data = new DTResult<NotificationCategoryAggregate>
            {
                draw = parameters.Draw,
                data = await query.Skip(parameters.Start).Take(parameters.Length).ToListAsync(),
                recordsFiltered = await query.CountAsync(),
                recordsTotal = totalRecord
            };

            return data;
        }
    }
}
