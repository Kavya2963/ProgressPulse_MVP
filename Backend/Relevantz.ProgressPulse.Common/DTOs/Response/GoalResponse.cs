namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class GoalResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public DateTime CreatedAt { get; set; }

    public string CreatedBy { get; set; } = "employee";
    public int? AssignedByManagerId { get; set; }
    public string? Category { get; set; }
    public string? Priority { get; set; }
    public DateTime? DueDate { get; set; }

}
