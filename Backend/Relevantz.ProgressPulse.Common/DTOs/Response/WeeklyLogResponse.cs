namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class WeeklyLogResponse
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }          // ← ADD THIS
    public string EmployeeName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<AttachmentResponse> Attachments { get; set; } = new();
    public List<GoalTagResponse> Goals { get; set; } = new();
}
