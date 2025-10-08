using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Validators
{
    public class NotificationValidator : AbstractValidator<CreateNotificationDto>
    {
        public NotificationValidator()
        {
                RuleFor(x &#x3D;&gt; x.Title).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.Title).MaximumLength(200).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
                RuleFor(x &#x3D;&gt; x.Content).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.Content).MaximumLength(2000).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
                RuleFor(x &#x3D;&gt; x.NotificationCategoryId).GreaterThan(0).WithMessage(&quot;{PropertyName} must be greater than 0.&quot;)
                RuleFor(x &#x3D;&gt; x.NotificationTypeId).GreaterThan(0).WithMessage(&quot;{PropertyName} must be greater than 0.&quot;)
        }
    }
}
