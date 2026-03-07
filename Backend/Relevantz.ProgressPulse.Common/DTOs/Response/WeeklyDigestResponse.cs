namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class WeeklyDigestResponse
{
    public string WeekStart { get; set; } = string.Empty;
    public string WeekEnd { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public bool Submitted { get; set; }
    public int? LogId { get; set; }
    public string? LogTitle { get; set; }
    public string? Impact { get; set; }
    public int AttachmentsCount { get; set; }
    public int CommentsCount { get; set; }
    public int QualityScore { get; set; }
    public string QualityLabel { get; set; } = string.Empty;
    public List<DigestGoalResponse> Goals { get; set; } = new();
}

public class DigestGoalResponse
{
    public int GoalId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public string CreatedBy { get; set; } = "employee";
    public string? Category { get; set; }
    public List<string> LinkedLogTitles { get; set; } = new();
}
