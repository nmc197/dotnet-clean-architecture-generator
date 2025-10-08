using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Implements
{
    public class UserSessionService : IUserSessionService
    {
        private readonly IUserSessionRepository _userSessionRepository;
        
        public UserSessionService(IUserSessionRepository userSessionRepository)
        {
            _userSessionRepository = userSessionRepository;
        }

        public async Task<ApiResponse> CreateAsync(CreateUserSessionDto obj)
        {
            var isExistName = await _userSessionRepository.AnyAsync(x => !x.IsDeleted && x.Name.ToLower() == obj.Name.ToLower());
            if (isExistName)
                return ApiResponse.UnprocessableEntity(
                    ErrorMessagesConstants.GetMessage(ApiCodeConstants.Common.DuplicatedData).Replace("{key}", obj.Name),
                    ApiCodeConstants.Common.DuplicatedData
                );

            var model = obj.ToEntity();
            await _userSessionRepository.CreateAsync(model);
            await _userSessionRepository.SaveChangesAsync();

            return ApiResponse.Created(model.Id);
        }

        public async Task<ApiResponse> CreateListAsync(IEnumerable<CreateUserSessionDto> objs)
        {
            var models = objs.Select(x => x.ToEntity());
            await _userSessionRepository.CreateListAsync(models);
            await _userSessionRepository.SaveChangesAsync();

            return ApiResponse.Created(models.Select(x => x.Id));
        }

        public async Task<ApiResponse> GetAllAsync()
        {
            var data = await _userSessionRepository
                .FindByCondition(x => !x.IsDeleted)
                .Select(x => new UserSessionListDto
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
            var data = await _userSessionRepository
                .FindByCondition(x => !x.IsDeleted && x.Id == id)
                .Select(x => new UserSessionDetailDto
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
            var data = _userSessionRepository
                .FindByCondition(x => !x.IsDeleted)
                .Select(x => new UserSessionListDto
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

            var pagedData = new PagingData<UserSessionListDto>
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

        public async Task<ApiResponse> GetPagedAsync(UserSessionDTParameters parameters)
        {
            var data = await _userSessionRepository.GetPagedAsync(parameters);
            return ApiResponse.Success(data);
        }

        public async Task<ApiResponse> SoftDeleteAsync(int id)
        {
            var isDeleted = await _userSessionRepository.SoftDeleteAsync(id);
            if (!isDeleted)
                return ApiResponse.BadRequest();

            await _userSessionRepository.SaveChangesAsync();
            return ApiResponse.Success();
        }

        public Task<ApiResponse> SoftDeleteListAsync(IEnumerable<int> objs)
        {
            throw new NotImplementedException();
        }

        public async Task<ApiResponse> UpdateAsync(UpdateUserSessionDto obj)
        {
            var isExistName = await _userSessionRepository.AnyAsync(x => !x.IsDeleted && x.Id != obj.Id && x.Name.ToLower() == obj.Name.ToLower());
            if (isExistName)
                return ApiResponse.UnprocessableEntity(
                    ErrorMessagesConstants.GetMessage(ApiCodeConstants.Common.DuplicatedData).Replace("{key}", obj.Name),
                    ApiCodeConstants.Common.DuplicatedData
                );

            var existData = await _userSessionRepository.GetByIdAsync(obj.Id);
            if (existData == null)
                return ApiResponse.NotFound();

            obj.ToEntity(existData);
            await _userSessionRepository.UpdateAsync(existData);
            await _userSessionRepository.SaveChangesAsync();

            return ApiResponse.Success();
        }

        public async Task<ApiResponse> UpdateListAsync(IEnumerable<UpdateUserSessionDto> obj)
        {
            var listIds = obj.Select(x => x.Id).ToList();
            var existData = await _userSessionRepository
                .FindByConditionAsync(x => !x.IsDeleted && listIds.Contains(x.Id));

            if (listIds.Count != existData.Count)
                return ApiResponse.BadRequest();

            foreach (var item in obj)
            {
                var existObj = existData.Find(x => x.Id == item.Id);
                if (existObj != null)
                    item.ToEntity(existObj);
            }

            await _userSessionRepository.UpdateListAsync(existData);
            await _userSessionRepository.SaveChangesAsync();

            return ApiResponse.Success();
        }
    }
}
