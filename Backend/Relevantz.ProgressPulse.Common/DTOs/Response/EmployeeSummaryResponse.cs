namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class EmployeeSummaryResponse
{
    public string EmployeeName { get; set; } = string.Empty;

    // ── Snapshot Stats ──
    public int TotalGoals { get; set; }
    public int CompletedGoals { get; set; }
    public int InProgressGoals { get; set; }
    public double AverageCompletionPercentage { get; set; }
    public int TotalLogsLast90Days { get; set; }
    public int TotalManagerComments { get; set; }
    public double ConsistencyScore { get; set; }

    // ── Goal Progress Bars ──
    public List<GoalProgressItem> Goals { get; set; } = new();

    // ── Recent Logs ──
    public List<RecentLogItem> RecentLogs { get; set; } = new();

    public string Summary { get; set; } = string.Empty;
}

public class GoalProgressItem
{
    public int    GoalId             { get; set; }
    public string Title              { get; set; } = string.Empty;
    public string Category           { get; set; } = string.Empty;
    public string CreatedBy          { get; set; } = string.Empty;  // "manager" | "self"
    public string Status             { get; set; } = string.Empty;
    public double ProgressPercentage { get; set; }
    public DateTime? DueDate         { get; set; }
    public bool IsOverdue            { get; set; }
}

public class RecentLogItem
{
    public int    Id           { get; set; }
    public string Title        { get; set; } = string.Empty;
    public string Impact       { get; set; } = string.Empty;
    public int    GoalsLinked  { get; set; }
    public int    QualityScore { get; set; }  // 0–5
    public string QualityLabel { get; set; } = string.Empty;
    public DateTime CreatedAt  { get; set; }
}
