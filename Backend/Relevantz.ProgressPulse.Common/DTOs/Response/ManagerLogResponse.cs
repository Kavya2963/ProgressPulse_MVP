namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class ManagerLogResponse
{
    public int LogId { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Impact { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public List<GoalTagResponse> Goals { get; set; } = new();

    public List<AttachmentResponse> Attachments { get; set; } = new();
}