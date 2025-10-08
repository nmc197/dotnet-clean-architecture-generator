using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class ProductMapping
    {
        public static Product ToEntity(this CreateProductDto dto)
        {
            return new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                CreatedDate = dto.CreatedDate,
                IsDeleted = dto.IsDeleted,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static Product ToEntity(this UpdateProductDto dto, Product existData)
        {
            existData.Name = dto.Name;
            existData.Description = dto.Description;
            existData.Price = dto.Price;
            existData.CreatedDate = dto.CreatedDate;
            existData.IsDeleted = dto.IsDeleted;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
