namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class AppraisalReportResponse
{
    public string EmployeeName { get; set; } = string.Empty;
    public string AppraisalPeriod { get; set; } = string.Empty;

    // ── GOAL INTELLIGENCE ──────────────────────────
    public int TotalGoals { get; set; }
    public int GoalsCompleted { get; set; }
    public int GoalsInProgress { get; set; }
    public double AverageCompletionPercentage { get; set; }

    // Self vs Manager goals
    public int SelfGoalsTotal { get; set; }
    public int SelfGoalsCompleted { get; set; }
    public int ManagerGoalsTotal { get; set; }
    public int ManagerGoalsCompleted { get; set; }

    // Due date tracking
    public int GoalsWithDueDate { get; set; }
    public int OnTimeGoals { get; set; }
    public int OverdueGoals { get; set; }

    public double GoalIntelligenceScore { get; set; }

    // ── ACTIVITY INTELLIGENCE ──────────────────────
    public int TotalLogs { get; set; }
    public int ActiveMonths { get; set; }
    public int InactiveMonths { get; set; }
    public int ExpectedLogs { get; set; }
    public double VolumeRate { get; set; }

    // Log quality
    public double AverageLogQualityScore { get; set; }  // 0–5

    // Streak tracking
    public int CurrentWeekStreak { get; set; }
    public int LongestWeekStreak { get; set; }
    public int LongestInactivityGapDays { get; set; }

    public double ActivityIntelligenceScore { get; set; }

    // Quarterly (appraisal-year based)
    public List<QuarterlyActivityResponse> QuarterlyActivity { get; set; } = new();

    // ── ENGAGEMENT INTELLIGENCE ────────────────────
    public int TotalManagerComments { get; set; }
    public double FeedbackCoveragePercentage { get; set; }

    public int RecentComments { get; set; }     // last 90 days
    public int OldComments { get; set; }
    public double RecencyRate { get; set; }

    public int ActedOnFeedbackCount { get; set; }
    public double ActionRate { get; set; }

    public double AvgCommentLength { get; set; }
    public double EngagementIntelligenceScore { get; set; }

    // ── OVERALL ───────────────────────────────────
    public double OverallAppraisalScore { get; set; }
    public string OverallRatingLabel { get; set; } = string.Empty;

    // ── TREND & INSIGHTS ──────────────────────────
    public string? ImprovementTrend { get; set; }
    public List<string> StrengthIndicators { get; set; } = new();
    public List<string> RiskIndicators { get; set; } = new();
}
