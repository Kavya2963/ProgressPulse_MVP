using FluentValidation;
using Relevantz.ProgressPulse.Common.DTOs.Request;

namespace Relevantz.ProgressPulse.Common.Validators;

public class AssignGoalRequestValidator : AbstractValidator<AssignGoalRequest>
{
    private static readonly string[] AllowedPriorities = new[] { "Low", "Medium", "High", "Critical" };
    private static readonly string[] AllowedCategories = new[] { "Skill", "Performance", "Project", "Training", "Other" };

    public AssignGoalRequestValidator()
    {
        RuleFor(x => x.AssignedToEmployeeId)
            .GreaterThan(0).WithMessage("AssignedToEmployeeId must be a positive integer.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.Category)
            .MaximumLength(50).WithMessage("Category cannot exceed 50 characters.")
            //.Must(v => AllowedCategories.Contains(v!, StringComparer.OrdinalIgnoreCase))
            //.WithMessage($"Category must be one of: {string.Join(", ", AllowedCategories)}")
            .When(x => !string.IsNullOrWhiteSpace(x.Category));

        RuleFor(x => x.Priority)
            .MaximumLength(50).WithMessage("Priority cannot exceed 50 characters.")
            //.Must(v => AllowedPriorities.Contains(v!, StringComparer.OrdinalIgnoreCase))
            //.WithMessage($"Priority must be one of: {string.Join(", ", AllowedPriorities)}")
            .When(x => !string.IsNullOrWhiteSpace(x.Priority));

        RuleFor(x => x.DueDate)
            .Must(d => d == null || d.Value.Date >= DateTime.UtcNow.Date)
            .WithMessage("DueDate cannot be in the past.");
    }
}