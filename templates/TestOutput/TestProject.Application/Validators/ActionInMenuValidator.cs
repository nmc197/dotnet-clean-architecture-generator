using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Validators
{
    public class ActionInMenuValidator : AbstractValidator<CreateActionInMenuDto>
    {
        public ActionInMenuValidator()
        {
                RuleFor(x &#x3D;&gt; x.ActionId).GreaterThan(0).WithMessage(&quot;{PropertyName} must be greater than 0.&quot;)
                RuleFor(x &#x3D;&gt; x.MenuId).GreaterThan(0).WithMessage(&quot;{PropertyName} must be greater than 0.&quot;)
                RuleFor(x &#x3D;&gt; x.RoleId).GreaterThan(0).WithMessage(&quot;{PropertyName} must be greater than 0.&quot;)
        }
    }
}
