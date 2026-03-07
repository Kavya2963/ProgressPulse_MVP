using FluentValidation;
using Relevantz.ProgressPulse.Common.DTOs.Request;

namespace Relevantz.ProgressPulse.Common.Validators;

public class ManagerLogFilterRequestValidator : AbstractValidator<ManagerLogFilterRequest>
{
    private const int MaxPageSize = 100;

    public ManagerLogFilterRequestValidator()
    {
        // Date range coherence
        RuleFor(x => x)
            .Must(x => !(x.StartDate.HasValue && x.EndDate.HasValue) || x.StartDate!.Value.Date <= x.EndDate!.Value.Date)
            .WithMessage("StartDate must be less than or equal to EndDate.");

        // Optional GoalId must be positive
        RuleFor(x => x.GoalId)
            .Must(id => !id.HasValue || id.Value > 0)
            .WithMessage("GoalId must be a positive integer when provided.");

        RuleFor(x => x.EmployeeName)
            .MaximumLength(100).WithMessage("EmployeeName cannot exceed 100 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.EmployeeName));

        // Pagination
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("PageNumber must be at least 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, MaxPageSize)
            .WithMessage($"PageSize must be between 1 and {MaxPageSize}.");
    }
}