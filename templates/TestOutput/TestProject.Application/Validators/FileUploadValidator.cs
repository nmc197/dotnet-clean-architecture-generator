using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TestProject.Shared.Entities;

namespace TestProject.Application.Validators
{
    public class FileUploadValidator : AbstractValidator<CreateFileUploadDto>
    {
        public FileUploadValidator()
        {
                RuleFor(x &#x3D;&gt; x.FileName).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.FileName).MaximumLength(200).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
                RuleFor(x &#x3D;&gt; x.OriginalFileName).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.OriginalFileName).MaximumLength(200).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
                RuleFor(x &#x3D;&gt; x.FilePath).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.FilePath).MaximumLength(500).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
                RuleFor(x &#x3D;&gt; x.FileSize).GreaterThan(0).WithMessage(&quot;{PropertyName} must be greater than 0.&quot;)
                RuleFor(x &#x3D;&gt; x.MimeType).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.MimeType).MaximumLength(100).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
        }
    }
}
