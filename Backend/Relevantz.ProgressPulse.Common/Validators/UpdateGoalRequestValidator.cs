using FluentValidation;
using Relevantz.ProgressPulse.Common.DTOs.Request;

namespace Relevantz.ProgressPulse.Common.Validators;

public class UpdateGoalRequestValidator : AbstractValidator<UpdateGoalRequest>
{
    public UpdateGoalRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(500);  

        RuleFor(x => x.ProgressPercentage)
            .InclusiveBetween(0, 100);

        RuleFor(x => x.Status)
            .Must(status => new[] { "NotStarted", "InProgress", "Completed" }
            .Contains(status))
            .WithMessage("Invalid status value");
    }
}
