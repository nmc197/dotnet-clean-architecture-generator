using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Validators
{
    public class FolderUploadValidator : AbstractValidator<CreateFolderUploadDto>
    {
        public FolderUploadValidator()
        {
                RuleFor(x &#x3D;&gt; x.FolderName).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.FolderName).MaximumLength(200).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
                RuleFor(x &#x3D;&gt; x.FolderPath).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.FolderPath).MaximumLength(500).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
        }
    }
}
