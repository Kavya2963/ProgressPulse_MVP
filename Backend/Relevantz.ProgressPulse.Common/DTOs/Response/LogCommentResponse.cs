namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class LogCommentResponse
{
    public int Id { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string ManagerName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
