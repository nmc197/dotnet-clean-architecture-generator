using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class TagMapping
    {
        public static Tag ToEntity(this CreateTagDto dto)
        {
            return new Tag
            {
                TagTypeId = dto.TagTypeId,
                Code = dto.Code,
                Color = dto.Color,
                SortOrder = dto.SortOrder,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static Tag ToEntity(this UpdateTagDto dto, Tag existData)
        {
            existData.TagTypeId = dto.TagTypeId;
            existData.Code = dto.Code;
            existData.Color = dto.Color;
            existData.SortOrder = dto.SortOrder;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
