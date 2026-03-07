namespace Relevantz.ProgressPulse.Common.DTOs.Request;

public class AssignGoalRequest
{
    public int AssignedToEmployeeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Priority { get; set; }
    public DateTime? DueDate { get; set; }
}
