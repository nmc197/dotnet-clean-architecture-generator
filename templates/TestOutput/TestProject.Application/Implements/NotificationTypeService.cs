using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Implements
{
    public class NotificationTypeService : INotificationTypeService
    {
        private readonly INotificationTypeRepository _notificationTypeRepository;
        
        public NotificationTypeService(INotificationTypeRepository notificationTypeRepository)
        {
            _notificationTypeRepository = notificationTypeRepository;
        }

        public async Task<ApiResponse> CreateAsync(CreateNotificationTypeDto obj)
        {
            var isExistName = await _notificationTypeRepository.AnyAsync(x => !x.IsDeleted && x.Name.ToLower() == obj.Name.ToLower());
            if (isExistName)
                return ApiResponse.UnprocessableEntity(
                    ErrorMessagesConstants.GetMessage(ApiCodeConstants.Common.DuplicatedData).Replace("{key}", obj.Name),
                    ApiCodeConstants.Common.DuplicatedData
                );

            var model = obj.ToEntity();
            await _notificationTypeRepository.CreateAsync(model);
            await _notificationTypeRepository.SaveChangesAsync();

            return ApiResponse.Created(model.Id);
        }

        public async Task<ApiResponse> CreateListAsync(IEnumerable<CreateNotificationTypeDto> objs)
        {
            var models = objs.Select(x => x.ToEntity());
            await _notificationTypeRepository.CreateListAsync(models);
            await _notificationTypeRepository.SaveChangesAsync();

            return ApiResponse.Created(models.Select(x => x.Id));
        }

        public async Task<ApiResponse> GetAllAsync()
        {
            var data = await _notificationTypeRepository
                .FindByCondition(x => !x.IsDeleted)
                .Select(x => new NotificationTypeListDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    CreatedDate = x.CreatedDate
                })
                .ToListAsync();
            
            return ApiResponse.Success(data);
        }

        public async Task<ApiResponse> GetByIdAsync(int id)
        {
            var data = await _notificationTypeRepository
                .FindByCondition(x => !x.IsDeleted && x.Id == id)
                .Select(x => new NotificationTypeDetailDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    CreatedDate = x.CreatedDate,
                    CreatedBy = x.CreatedBy,
                    LastModifiedDate = x.LastModifiedDate,
                    UpdatedBy = x.UpdatedBy
                })
                .FirstOrDefaultAsync();

            if (data == null)
                return ApiResponse.NotFound();

            return ApiResponse.Success(data);
        }

        public async Task<ApiResponse> GetPagedAsync(SearchQuery query)
        {
            var data = _notificationTypeRepository
                .FindByCondition(x => !x.IsDeleted)
                .Select(x => new NotificationTypeListDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    CreatedDate = x.CreatedDate
                });

            var totalRecord = await data.CountAsync();
            var allData = await data.ToListAsync();

            if (!string.IsNullOrEmpty(query.Keyword))
            {
                var keyword = query.Keyword.RemoveVietnamese().ToLower();
                allData = allData
                    .Where(x => 
                        (!string.IsNullOrEmpty(x.Name) && x.Name.RemoveVietnamese().ToLower().Contains(keyword)) ||
                        (!string.IsNullOrEmpty(x.Description) && x.Description.RemoveVietnamese().ToLower().Contains(keyword))
                    )
                    .ToList();
            }

            var totalFiltered = allData.Count;

            if (!string.IsNullOrEmpty(query.OrderBy))
            {
                allData = allData
                    .AsQueryable()
                    .OrderByDynamic(query.OrderBy, query.SortType == "asc" ? LinqExtensions.Order.Asc : LinqExtensions.Order.Desc)
                    .ToList();
            }

            var dataSource = allData
                .Skip((query.PageIndex - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToList();

            var pagedData = new PagingData<NotificationTypeListDto>
            {
                CurrentPage = query.PageIndex,
                PageSize = query.PageSize,
                DataSource = dataSource,
                Total = totalRecord,
                TotalFiltered = totalFiltered
            };

            return ApiResponse.Success(pagedData);
        }

        public Task<ApiResponse> GetPagedAsync<T>(AdvancedSearchQuery<T> query)
        {
            throw new NotImplementedException();
        }

        public async Task<ApiResponse> GetPagedAsync(NotificationTypeDTParameters parameters)
        {
            var data = await _notificationTypeRepository.GetPagedAsync(parameters);
            return ApiResponse.Success(data);
        }

        public async Task<ApiResponse> SoftDeleteAsync(int id)
        {
            var isDeleted = await _notificationTypeRepository.SoftDeleteAsync(id);
            if (!isDeleted)
                return ApiResponse.BadRequest();

            await _notificationTypeRepository.SaveChangesAsync();
            return ApiResponse.Success();
        }

        public Task<ApiResponse> SoftDeleteListAsync(IEnumerable<int> objs)
        {
            throw new NotImplementedException();
        }

        public async Task<ApiResponse> UpdateAsync(UpdateNotificationTypeDto obj)
        {
            var isExistName = await _notificationTypeRepository.AnyAsync(x => !x.IsDeleted && x.Id != obj.Id && x.Name.ToLower() == obj.Name.ToLower());
            if (isExistName)
                return ApiResponse.UnprocessableEntity(
                    ErrorMessagesConstants.GetMessage(ApiCodeConstants.Common.DuplicatedData).Replace("{key}", obj.Name),
                    ApiCodeConstants.Common.DuplicatedData
                );

            var existData = await _notificationTypeRepository.GetByIdAsync(obj.Id);
            if (existData == null)
                return ApiResponse.NotFound();

            obj.ToEntity(existData);
            await _notificationTypeRepository.UpdateAsync(existData);
            await _notificationTypeRepository.SaveChangesAsync();

            return ApiResponse.Success();
        }

        public async Task<ApiResponse> UpdateListAsync(IEnumerable<UpdateNotificationTypeDto> obj)
        {
            var listIds = obj.Select(x => x.Id).ToList();
            var existData = await _notificationTypeRepository
                .FindByConditionAsync(x => !x.IsDeleted && listIds.Contains(x.Id));

            if (listIds.Count != existData.Count)
                return ApiResponse.BadRequest();

            foreach (var item in obj)
            {
                var existObj = existData.Find(x => x.Id == item.Id);
                if (existObj != null)
                    item.ToEntity(existObj);
            }

            await _notificationTypeRepository.UpdateListAsync(existData);
            await _notificationTypeRepository.SaveChangesAsync();

            return ApiResponse.Success();
        }
    }
}
