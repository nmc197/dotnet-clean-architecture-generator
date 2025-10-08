using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Validators
{
    public class UserRoleValidator : AbstractValidator<CreateUserRoleDto>
    {
        public UserRoleValidator()
        {
                RuleFor(x &#x3D;&gt; x.UserId).GreaterThan(0).WithMessage(&quot;{PropertyName} must be greater than 0.&quot;)
                RuleFor(x &#x3D;&gt; x.RoleId).GreaterThan(0).WithMessage(&quot;{PropertyName} must be greater than 0.&quot;)
        }
    }
}
