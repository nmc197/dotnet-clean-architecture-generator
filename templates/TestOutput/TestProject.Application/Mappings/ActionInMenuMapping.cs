using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class ActionInMenuMapping
    {
        public static ActionInMenu ToEntity(this CreateActionInMenuDto dto)
        {
            return new ActionInMenu
            {
                ActionId = dto.ActionId,
                MenuId = dto.MenuId,
                RoleId = dto.RoleId,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static ActionInMenu ToEntity(this UpdateActionInMenuDto dto, ActionInMenu existData)
        {
            existData.ActionId = dto.ActionId;
            existData.MenuId = dto.MenuId;
            existData.RoleId = dto.RoleId;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
