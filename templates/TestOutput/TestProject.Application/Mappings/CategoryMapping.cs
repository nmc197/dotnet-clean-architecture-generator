using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class CategoryMapping
    {
        public static Category ToEntity(this CreateCategoryDto dto)
        {
            return new Category
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedDate = dto.CreatedDate,
                IsDeleted = dto.IsDeleted,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static Category ToEntity(this UpdateCategoryDto dto, Category existData)
        {
            existData.Name = dto.Name;
            existData.Description = dto.Description;
            existData.CreatedDate = dto.CreatedDate;
            existData.IsDeleted = dto.IsDeleted;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
