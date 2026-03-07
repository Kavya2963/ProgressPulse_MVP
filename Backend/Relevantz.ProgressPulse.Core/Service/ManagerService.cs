using Relevantz.ProgressPulse.Core.IService;
using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.DTOs.Response;
using Relevantz.ProgressPulse.Common.Entities;
using Relevantz.ProgressPulse.Data.DBContexts;
using Relevantz.ProgressPulse.Data.IRepository;
using Microsoft.EntityFrameworkCore;

namespace Relevantz.ProgressPulse.Core.Service;

public class ManagerService : IManagerService
{
    private readonly AppDbContext _context;
    private readonly IWeeklyLogRepository _repository;

    public ManagerService(AppDbContext context,
                          IWeeklyLogRepository repository)
    {
        _context = context;
        _repository = repository;
    }

public async Task<object> GetFilteredTeamLogsAsync(
    int managerId,
    ManagerLogFilterRequest filter)
{
    var employeeIds = await _context.UserManagerMappings
        .Where(x => x.ManagerId == managerId)
        .Select(x => x.EmployeeId)
        .ToListAsync();

    var (logs, totalCount) =
        await _repository.GetFilteredTeamLogsAsync(employeeIds, filter);

    var result = logs.Select(w => new
    {
        w.Id,
        w.Title,
        w.Description,
        w.Impact,
        w.CreatedAt,
        EmployeeId   = w.UserId,           // ← ADD THIS
        EmployeeName = w.User.Name,
        Goals = w.LogGoalMappings
            .Select(g => new { g.Goal.Id, g.Goal.Title })
    });

    return new
    {
        TotalCount = totalCount,
        PageNumber  = filter.PageNumber,
        PageSize    = filter.PageSize,
        Data        = result
    };
}


    public async Task AddCommentAsync(int managerId, int weeklyLogId, string comment)
    {
        var log = await _context.WeeklyLogs.FindAsync(weeklyLogId);

        if (log == null)
            throw new Exception("Weekly log not found");

        var newComment = new PPLogComment
        {
            WeeklyLogId = weeklyLogId,
            ManagerId = managerId,
            Comment = comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.LogComments.Add(newComment);
        await _context.SaveChangesAsync();
    }
    public async Task<ManagerDashboardResponse> GetDashboardSummaryAsync(int managerId)
    {
        var employeeIds = await _context.UserManagerMappings
            .Where(x => x.ManagerId == managerId)
            .Select(x => x.EmployeeId)
            .ToListAsync();

        var startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);

        var logsThisWeek = await _context.WeeklyLogs
            .Where(w => employeeIds.Contains(w.UserId)
                        && w.CreatedAt >= startOfWeek)
            .ToListAsync();

        var totalComments = await _context.LogComments
            .Where(c => c.ManagerId == managerId)
            .CountAsync();

        var mostActive = logsThisWeek
            .GroupBy(x => x.UserId)
            .OrderByDescending(g => g.Count())
            .FirstOrDefault();

        string? mostActiveEmployee = null;

        if (mostActive != null)
        {
            mostActiveEmployee = await _context.Users
                .Where(u => u.Id == mostActive.Key)
                .Select(u => u.Name)
                .FirstOrDefaultAsync();
        }

        return new ManagerDashboardResponse
        {
            TotalEmployees = employeeIds.Count,
            LogsSubmittedThisWeek = logsThisWeek.Count,
            PendingLogsThisWeek = employeeIds.Count - logsThisWeek.Select(x => x.UserId).Distinct().Count(),
            TotalCommentsGiven = totalComments,
            MostActiveEmployee = mostActiveEmployee
        };
    }
   public async Task<EmployeeSummaryResponse> GetEmployeeSummaryAsync(
    int managerId, int employeeId)
{
    var isValid = await _context.UserManagerMappings
        .AnyAsync(x => x.ManagerId == managerId
                    && x.EmployeeId == employeeId);

    if (!isValid) throw new Exception("Unauthorized access");

    var employee  = await _context.Users.FirstAsync(x => x.Id == employeeId);
    var last90    = DateTime.UtcNow.AddDays(-90);
    var now       = DateTime.UtcNow;

    // ── Goals ──────────────────────────────────────────────
    var goals = await _context.Goals
        .Where(g => g.UserId == employeeId)
        .OrderBy(g => g.ProgressPercentage)   // incomplete first
        .ToListAsync();

    var totalGoals       = goals.Count;
    var completedGoals   = goals.Count(g => g.ProgressPercentage >= 100);
    var inProgressGoals  = goals.Count(g => g.ProgressPercentage > 0
                                         && g.ProgressPercentage < 100);
    var avgCompletion    = totalGoals == 0
        ? 0
        : Math.Round(goals.Average(g => g.ProgressPercentage), 2);

    var goalItems = goals.Select(g => new GoalProgressItem
    {
        GoalId             = g.Id,
        Title              = g.Title,
        Category           = g.Category ?? "General",
        CreatedBy          = g.CreatedBy ?? "self",
        Status             = g.Status,
        ProgressPercentage = g.ProgressPercentage,
        DueDate            = g.DueDate,
        IsOverdue          = g.DueDate.HasValue
                          && g.DueDate.Value < now
                          && g.ProgressPercentage < 100,
    }).ToList();

    // ── Logs (last 90 days) ────────────────────────────────
    var logs = await _context.WeeklyLogs
        .Where(l => l.UserId == employeeId && l.CreatedAt >= last90)
        .Include(l => l.Attachments)
        .Include(l => l.LogGoalMappings)
        .Include(l => l.LogComments)
        .OrderByDescending(l => l.CreatedAt)
        .ToListAsync();

    var totalLogs = logs.Count;

    // Recent 3 logs with quality scoring
    var recentLogs = logs.Take(3).Select(l =>
    {
        int q = 0;
        if (!string.IsNullOrWhiteSpace(l.Title))                    q++;
        if (!string.IsNullOrWhiteSpace(l.Description)
            && l.Description.Length > 20)                           q++;
        if (!string.IsNullOrWhiteSpace(l.Impact))                   q++;
        if (l.LogGoalMappings != null && l.LogGoalMappings.Any())   q++;
        if (l.Attachments != null && l.Attachments.Any())           q++;

        return new RecentLogItem
        {
            Id           = l.Id,
            Title        = l.Title ?? "Untitled",
            Impact       = l.Impact ?? "",
            GoalsLinked  = l.LogGoalMappings?.Count ?? 0,
            QualityScore = q,
            QualityLabel = q switch
            {
                5    => "Excellent",
                4    => "High",
                3    => "Medium",
                <= 2 => "Low",
                _    => "Low"
            },
            CreatedAt = l.CreatedAt,
        };
    }).ToList();

    // ── Manager Comments ───────────────────────────────────
    var totalComments = await _context.LogComments
        .Where(c => c.ManagerId == managerId
                 && c.WeeklyLog.UserId == employeeId)
        .CountAsync();

    // Consistency = logs per month (avg over 3 months)
    var consistency = Math.Round(totalLogs / 3.0, 2);

    // ── Smart Summary ──────────────────────────────────────
    // ── Smart Summary ──────────────────────────────────────────
var parts = new List<string>();

// Goal execution
if (avgCompletion >= 80 && completedGoals == totalGoals)
    parts.Add("all goals completed successfully");
else if (avgCompletion >= 80)
    parts.Add("strong goal completion rate");
else if (avgCompletion >= 60)
    parts.Add("moderate goal progress");
else
    parts.Add("goal completion needs improvement");

// Overdue check
var overdueCount = goalItems.Count(g => g.IsOverdue);
if (overdueCount > 0)
    parts.Add($"{overdueCount} overdue goal{(overdueCount > 1 ? "s" : "")} need attention");

// Log consistency
if (consistency >= 4)
    parts.Add("highly consistent log submissions");
else if (consistency >= 2)
    parts.Add("moderate log activity");
else if (totalLogs == 0)
    parts.Add("no logs submitted in 90 days");
else
    parts.Add("low log submission frequency");

// Manager engagement
if (totalComments >= 5)
    parts.Add("good manager feedback coverage");
else if (totalComments == 0)
    parts.Add("no manager feedback given yet");

// Build sentence
string summary = $"{employee.Name} shows {string.Join(", ", parts)}.";

// Closing recommendation
if (avgCompletion < 50 || totalLogs == 0)
    summary += " Immediate follow-up recommended.";
else if (avgCompletion >= 80 && consistency >= 3)
    summary += " Performance is on track for a strong appraisal.";


    return new EmployeeSummaryResponse
    {
        EmployeeName               = employee.Name,
        TotalGoals                 = totalGoals,
        CompletedGoals             = completedGoals,
        InProgressGoals            = inProgressGoals,
        AverageCompletionPercentage = avgCompletion,
        TotalLogsLast90Days        = totalLogs,
        TotalManagerComments       = totalComments,
        ConsistencyScore           = consistency,
        Goals                      = goalItems,
        RecentLogs                 = recentLogs,
        Summary                    = summary,
    };
}

public async Task<AppraisalReportResponse> GetAppraisalReportAsync(
    int managerId, int employeeId)
{
    var isValid = await _context.UserManagerMappings
        .AnyAsync(x => x.ManagerId == managerId
                    && x.EmployeeId == employeeId);

    if (!isValid) throw new Exception("Unauthorized access");

    var appraisalStart = DateTime.UtcNow.AddDays(-365);
    var now            = DateTime.UtcNow;

    var employee = await _context.Users
        .FirstAsync(x => x.Id == employeeId);

    // ── LOAD DATA ─────────────────────────────────────────────
    var goals = await _context.Goals
        .Where(g => g.UserId == employeeId && g.CreatedAt >= appraisalStart)
        .ToListAsync();

    var logs = await _context.WeeklyLogs
        .Where(l => l.UserId == employeeId && l.CreatedAt >= appraisalStart)
        .Include(l => l.Attachments)
        .Include(l => l.LogGoalMappings)
        .OrderBy(l => l.CreatedAt)
        .ToListAsync();

    var comments = await _context.LogComments
        .Where(c => c.ManagerId == managerId
                 && c.WeeklyLog.UserId == employeeId
                 && c.CreatedAt >= appraisalStart)
        .Include(c => c.WeeklyLog)
        .ToListAsync();

    // ══════════════════════════════════════════════════════════
    // SECTION 1 — GOAL INTELLIGENCE
    // ══════════════════════════════════════════════════════════

    var totalGoals      = goals.Count;
    var goalsCompleted  = goals.Count(g => g.ProgressPercentage >= 100);
    var goalsInProgress = goals.Count(g => g.ProgressPercentage > 0
                                        && g.ProgressPercentage < 100);
    var avgCompletion   = totalGoals == 0
        ? 0
        : Math.Round(goals.Average(g => g.ProgressPercentage), 2);

    // A) Self vs Manager goals
    var selfGoals    = goals.Where(g => g.CreatedBy != "manager").ToList();
    var managerGoals = goals.Where(g => g.CreatedBy == "manager").ToList();

    var selfGoalsCompleted    = selfGoals.Count(g => g.ProgressPercentage >= 100);
    var managerGoalsCompleted = managerGoals.Count(g => g.ProgressPercentage >= 100);

    // B) Due date tracking
    var goalsWithDueDate = goals.Where(g => g.DueDate.HasValue).ToList();
    var onTimeGoals = goalsWithDueDate
        .Count(g => g.ProgressPercentage >= 100
                 && g.DueDate.HasValue
                 && g.DueDate.Value >= now);
    var overdueGoals = goalsWithDueDate
        .Count(g => g.DueDate.HasValue
                 && g.DueDate.Value < now
                 && g.ProgressPercentage < 100);

    // C) Goal Intelligence Score calculation
    // Part A: Completion Rate → 40 pts
    double goalA = totalGoals == 0 ? 0
        : ((double)goalsCompleted / totalGoals) * 40;

    // Part B: Progress Score → 20 pts
    double goalB = (avgCompletion / 100.0) * 20;

    // Part C: Due Date Score → 25 pts
    double goalC = goalsWithDueDate.Count == 0 ? 12.5  // neutral if no due dates
        : ((double)onTimeGoals / goalsWithDueDate.Count) * 25;

    // Part D: Manager Goal Completion → 15 pts
    double goalD = managerGoals.Count == 0 ? 7.5  // neutral if no manager goals
        : ((double)managerGoalsCompleted / managerGoals.Count) * 15;

    var goalIntelligenceScore = Math.Round(
        Math.Min(goalA + goalB + goalC + goalD, 100), 2);

    // ══════════════════════════════════════════════════════════
    // SECTION 2 — ACTIVITY INTELLIGENCE
    // ══════════════════════════════════════════════════════════

    var totalLogs = logs.Count;

    // A) Consistency — active months in appraisal year
    var activeMonths = logs
        .GroupBy(l => new { l.CreatedAt.Year, l.CreatedAt.Month })
        .Count();
    var inactiveMonths = 12 - activeMonths;

    // B) Log Quality Score (0–5 per log)
    double totalQuality = 0;
    foreach (var log in logs)
    {
        int score = 0;
        if (!string.IsNullOrWhiteSpace(log.Title))                      score++;
        if (!string.IsNullOrWhiteSpace(log.Description)
            && log.Description.Length > 20)                             score++;
        if (!string.IsNullOrWhiteSpace(log.Impact))                     score++;
        if (log.LogGoalMappings != null && log.LogGoalMappings.Any())   score++;
        if (log.Attachments != null && log.Attachments.Any())           score++;
        totalQuality += score;
    }
    var avgLogQuality = totalLogs == 0 ? 0
        : Math.Round(totalQuality / totalLogs, 2);  // 0–5

    // C) Week Streak tracking
    // Build a HashSet of week-start dates that have at least 1 log
    var logWeeks = logs
        .Select(l =>
        {
            var d   = l.CreatedAt.Date;
            int diff = ((int)d.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
            return d.AddDays(-diff);  // Monday of that week
        })
        .Distinct()
        .OrderBy(d => d)
        .ToList();

    int longestStreak = 0, currentStreak = 0;
    DateTime? prevWeek = null;

    foreach (var week in logWeeks)
    {
        if (prevWeek.HasValue && (week - prevWeek.Value).Days == 7)
        {
            currentStreak++;
        }
        else
        {
            currentStreak = 1;
        }
        longestStreak = Math.Max(longestStreak, currentStreak);
        prevWeek = week;
    }

    // Current streak — count back from most recent week
    currentStreak = 0;
    var checkWeek = DateTime.UtcNow.Date;
    int dayOfWeek = ((int)checkWeek.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
    checkWeek = checkWeek.AddDays(-dayOfWeek);

    while (logWeeks.Contains(checkWeek))
    {
        currentStreak++;
        checkWeek = checkWeek.AddDays(-7);
    }

    // D) Volume Rate
    var weeksSinceStart = Math.Max(
        (int)Math.Ceiling((now - appraisalStart).TotalDays / 7.0), 1);
    var volumeRate = Math.Round(
        Math.Min((double)totalLogs / weeksSinceStart, 1.0) * 100, 2);

    // Longest inactivity gap
    int longestGap = 0;
    if (logs.Count > 1)
    {
        for (int i = 1; i < logs.Count; i++)
        {
            var gap = (logs[i].CreatedAt - logs[i - 1].CreatedAt).Days;
            if (gap > longestGap) longestGap = gap;
        }
    }

    // Activity Intelligence Score calculation
    // Part A: Consistency → 35 pts
    double actA = ((double)activeMonths / 12.0) * 35;

    // Part B: Log Quality → 30 pts
    double actB = (avgLogQuality / 5.0) * 30;

    // Part C: Streak → 20 pts
    double actC = Math.Min((double)longestStreak / 52.0, 1.0) * 20;

    // Part D: Volume → 15 pts
    double actD = (volumeRate / 100.0) * 15;

    var activityIntelligenceScore = Math.Round(
        Math.Min(actA + actB + actC + actD, 100), 2);

    // Quarterly Breakdown — appraisal-year based (not calendar year)
    // Q1 = months 1–3 of appraisal year, Q2 = months 4–6, etc.
    var quarterlyData = Enumerable.Range(1, 4)
        .Select(q =>
        {
            var qStart = appraisalStart.AddMonths((q - 1) * 3);
            var qEnd   = appraisalStart.AddMonths(q * 3);
            return new QuarterlyActivityResponse
            {
                Quarter   = $"Q{q} ({qStart:MMM}–{qEnd.AddDays(-1):MMM yyyy})",
                LogsCount = logs.Count(l => l.CreatedAt >= qStart
                                         && l.CreatedAt < qEnd)
            };
        })
        .ToList();

    // Improvement Trend
    var midPoint       = appraisalStart.AddMonths(6);
    var firstHalfCount  = logs.Count(l => l.CreatedAt < midPoint);
    var secondHalfCount = logs.Count(l => l.CreatedAt >= midPoint);

    string improvementTrend = secondHalfCount > firstHalfCount
        ? $"Activity increased in the second half ({secondHalfCount} logs vs {firstHalfCount})."
        : secondHalfCount < firstHalfCount
        ? $"Activity decreased in the second half ({secondHalfCount} logs vs {firstHalfCount})."
        : $"Consistent activity across both halves of the appraisal year.";

    // ══════════════════════════════════════════════════════════
    // SECTION 3 — ENGAGEMENT INTELLIGENCE
    // ══════════════════════════════════════════════════════════

    var totalComments = comments.Count;
    var ninetyDaysAgo = now.AddDays(-90);

    // A) Feedback Coverage
    var logsWithFeedback = logs
        .Count(l => comments.Any(c => c.WeeklyLogId == l.Id));
    var feedbackCoverage = totalLogs == 0 ? 0
        : Math.Round((double)logsWithFeedback / totalLogs * 100, 2);

    // B) Recency Weight — recent vs old comments
    var recentComments = comments.Count(c => c.CreatedAt >= ninetyDaysAgo);
    var oldComments    = totalComments - recentComments;
    var recencyRate    = totalComments == 0 ? 0
        : Math.Round((double)recentComments / totalComments * 100, 2);

    // C) Action Rate — did employee update goal AFTER manager commented?
    // For each comment, check if any goal linked to that log
    // had its progress updated after the comment date
    int actedOnFeedback = 0;
    foreach (var comment in comments)
    {
        if (comment.WeeklyLog == null) continue;

        // Get goals linked to this log
        var linkedGoalIds = comment.WeeklyLog.LogGoalMappings?
            .Select(m => m.GoalId).ToList() ?? new List<int>();

        if (!linkedGoalIds.Any()) continue;

        // Check if any of those goals were updated (progress changed) after comment
        // We approximate this by checking if goal UpdatedAt > comment.CreatedAt
        // Since we may not have UpdatedAt, we check if goal is now more complete
        // than it could have been before — we use a simpler proxy:
        // goal.ProgressPercentage > 0 AND goal was created before the comment
        var goalWasActedOn = goals.Any(g =>
            linkedGoalIds.Contains(g.Id)
            && g.CreatedAt <= comment.CreatedAt
            && g.ProgressPercentage > 0);

        if (goalWasActedOn) actedOnFeedback++;
    }

    var actionRate = totalComments == 0 ? 0
        : Math.Round((double)actedOnFeedback / totalComments * 100, 2);

    // D) Comment Depth — average comment length
    var avgCommentLength = totalComments == 0 ? 0
        : Math.Round(comments.Average(c => (double)c.Comment.Length), 2);

    double commentDepthScore = avgCommentLength > 100 ? 15
        : avgCommentLength >= 50 ? 10 : 5;

    // Engagement Intelligence Score calculation
    // Part A: Feedback Coverage → 40 pts
    double engA = (feedbackCoverage / 100.0) * 40;

    // Part B: Recency → 20 pts
    double engB = (recencyRate / 100.0) * 20;

    // Part C: Action Rate → 25 pts
    double engC = (actionRate / 100.0) * 25;

    // Part D: Comment Depth → 15 pts
    double engD = commentDepthScore;

    var engagementIntelligenceScore = Math.Round(
        Math.Min(engA + engB + engC + engD, 100), 2);

    // ══════════════════════════════════════════════════════════
    // SECTION 4 — OVERALL SCORE
    // ══════════════════════════════════════════════════════════

    // Weighted: Goals 45%, Activity 30%, Engagement 25%
    var overallScore = Math.Round(
        (goalIntelligenceScore     * 0.45) +
        (activityIntelligenceScore * 0.30) +
        (engagementIntelligenceScore * 0.25), 2);

    var ratingLabel = overallScore >= 90 ? "Outstanding"
        : overallScore >= 75 ? "Exceeds Expectations"
        : overallScore >= 60 ? "Meets Expectations"
        : overallScore >= 45 ? "Needs Improvement"
        : "Underperforming";

    // ══════════════════════════════════════════════════════════
    // SECTION 5 — STRENGTHS & RISKS
    // ══════════════════════════════════════════════════════════

    var strengths = new List<string>();
    var risks     = new List<string>();

    // Goal strengths/risks
    if (goalIntelligenceScore >= 80)
        strengths.Add("Excellent goal execution with strong completion rate.");
    if (managerGoals.Count > 0 && managerGoalsCompleted == managerGoals.Count)
        strengths.Add("All manager-assigned goals completed successfully.");
    if (onTimeGoals > 0 && goalsWithDueDate.Count > 0
        && onTimeGoals == goalsWithDueDate.Count)
        strengths.Add("All goals with due dates completed on time.");

    if (overdueGoals > 0)
        risks.Add($"{overdueGoals} goal(s) are overdue and incomplete.");
    if (avgCompletion < 50)
        risks.Add("Low average goal completion percentage.");
    if (managerGoals.Count > 0 && managerGoalsCompleted == 0)
        risks.Add("No manager-assigned goals have been completed.");

    // Activity strengths/risks
    if (currentStreak >= 4)
        strengths.Add($"Active submission streak of {currentStreak} consecutive weeks.");
    if (avgLogQuality >= 4)
        strengths.Add("High quality log submissions with detailed descriptions.");
    if (activeMonths >= 9)
        strengths.Add("Consistent activity across most months of the appraisal year.");

    if (inactiveMonths >= 4)
        risks.Add($"{inactiveMonths} inactive months detected — low consistency.");
    if (avgLogQuality < 2.5)
        risks.Add("Log quality is low — logs lack descriptions, impact or goal links.");
    if (longestGap > 30)
        risks.Add($"Longest inactivity gap was {longestGap} days.");

    // Engagement strengths/risks
    if (feedbackCoverage >= 70)
        strengths.Add("Manager feedback provided on majority of submitted logs.");
    if (actionRate >= 60)
        strengths.Add("Employee consistently acts on manager feedback.");
    if (recentComments >= 3)
        strengths.Add("Active manager engagement in the last 90 days.");

    if (feedbackCoverage < 20)
        risks.Add("Very low feedback coverage — most logs have no manager comments.");
    if (actionRate < 20 && totalComments > 3)
        risks.Add("Employee rarely updates goals after receiving feedback.");
    if (recentComments == 0 && totalComments > 0)
        risks.Add("No manager comments given in the last 90 days.");

    // ══════════════════════════════════════════════════════════
    // FINAL RETURN
    // ══════════════════════════════════════════════════════════

    return new AppraisalReportResponse
    {
        EmployeeName      = employee.Name,
        AppraisalPeriod   = $"{appraisalStart:MMM yyyy} – {now:MMM yyyy}",

        // Goal Intelligence
        TotalGoals                   = totalGoals,
        GoalsCompleted               = goalsCompleted,
        GoalsInProgress              = goalsInProgress,
        AverageCompletionPercentage  = avgCompletion,
        SelfGoalsTotal               = selfGoals.Count,
        SelfGoalsCompleted           = selfGoalsCompleted,
        ManagerGoalsTotal            = managerGoals.Count,
        ManagerGoalsCompleted        = managerGoalsCompleted,
        GoalsWithDueDate             = goalsWithDueDate.Count,
        OnTimeGoals                  = onTimeGoals,
        OverdueGoals                 = overdueGoals,
        GoalIntelligenceScore        = goalIntelligenceScore,

        // Activity Intelligence
        TotalLogs                    = totalLogs,
        ActiveMonths                 = activeMonths,
        InactiveMonths               = inactiveMonths,
        ExpectedLogs                 = weeksSinceStart,
        VolumeRate                   = volumeRate,
        AverageLogQualityScore       = avgLogQuality,
        CurrentWeekStreak            = currentStreak,
        LongestWeekStreak            = longestStreak,
        LongestInactivityGapDays     = longestGap,
        ActivityIntelligenceScore    = activityIntelligenceScore,
        QuarterlyActivity            = quarterlyData,
        ImprovementTrend             = improvementTrend,

        // Engagement Intelligence
        TotalManagerComments         = totalComments,
        FeedbackCoveragePercentage   = feedbackCoverage,
        RecentComments               = recentComments,
        OldComments                  = oldComments,
        RecencyRate                  = recencyRate,
        ActedOnFeedbackCount         = actedOnFeedback,
        ActionRate                   = actionRate,
        AvgCommentLength             = avgCommentLength,
        EngagementIntelligenceScore  = engagementIntelligenceScore,

        // Overall
        OverallAppraisalScore        = overallScore,
        OverallRatingLabel           = ratingLabel,

        // Insights
        StrengthIndicators           = strengths,
        RiskIndicators               = risks,
    };
}

    public async Task<List<EmployeeListResponse>> GetMyEmployeesAsync(int managerId)
    {
        return await _context.UserManagerMappings
            .Where(x => x.ManagerId == managerId)
            .Include(x => x.Employee)
            .Select(x => new EmployeeListResponse
            {
                Id = x.Employee.Id,
                Name = x.Employee.Name,
                Email = x.Employee.Email
            })
            .ToListAsync();
    }
  public async Task<List<WeeklyDigestResponse>> GetWeeklyDigestAsync(
    int managerId, int employeeId, DateTime weekStart)
{
    var weekEnd = weekStart.AddDays(6).Date
                           .AddHours(23).AddMinutes(59).AddSeconds(59);

    // Verify employee belongs to this manager
    var isValid = await _context.UserManagerMappings
        .AnyAsync(x => x.ManagerId == managerId
                    && x.EmployeeId == employeeId);

    if (!isValid) throw new Exception("Unauthorized");

    var employee = await _context.Users
        .FirstAsync(u => u.Id == employeeId);

    var weekLog = await _context.WeeklyLogs
        .Where(w => w.UserId == employeeId
                 && w.CreatedAt >= weekStart
                 && w.CreatedAt <= weekEnd)
        .Include(w => w.Attachments)
        .Include(w => w.LogComments)
        .Include(w => w.LogGoalMappings)
            .ThenInclude(m => m.Goal)
        .FirstOrDefaultAsync();

    var allGoals = await _context.Goals
        .Where(g => g.UserId == employeeId)
        .Include(g => g.LogGoalMappings)
            .ThenInclude(m => m.WeeklyLog)
        .ToListAsync();

    var goalDigest = allGoals.Select(g =>
    {
        var linkedThisWeek = g.LogGoalMappings
            .Where(m => m.WeeklyLog != null
                     && m.WeeklyLog.CreatedAt >= weekStart
                     && m.WeeklyLog.CreatedAt <= weekEnd)
            .Select(m => m.WeeklyLog.Title)
            .ToList();

        return new DigestGoalResponse
        {
            GoalId             = g.Id,
            Title              = g.Title,
            Status             = g.Status,
            ProgressPercentage = g.ProgressPercentage,
            CreatedBy          = g.CreatedBy,
            Category           = g.Category,
            LinkedLogTitles    = linkedThisWeek,
        };
    }).ToList();

    int quality = 0;
    if (weekLog != null)
    {
        if (!string.IsNullOrWhiteSpace(weekLog.Title))       quality++;
        if (!string.IsNullOrWhiteSpace(weekLog.Description)) quality++;
        if (!string.IsNullOrWhiteSpace(weekLog.Impact))      quality++;
        if (weekLog.LogGoalMappings.Any())                   quality++;
        if (weekLog.Attachments.Any())                       quality++;
    }

    string qualityLabel = quality switch
    {
        5    => "Excellent",
        4    => "High",
        3    => "Medium",
        <= 2 => "Low",
        _    => "Low"
    };

    return new List<WeeklyDigestResponse>
    {
        new WeeklyDigestResponse
        {
            WeekStart        = weekStart.ToString("MMM dd"),
            WeekEnd          = weekEnd.ToString("MMM dd, yyyy"),
            EmployeeId       = employee.Id,
            EmployeeName     = employee.Name,
            Submitted        = weekLog != null,
            LogId            = weekLog?.Id,
            LogTitle         = weekLog?.Title,
            Impact           = weekLog?.Impact,
            AttachmentsCount = weekLog?.Attachments.Count ?? 0,
            CommentsCount    = weekLog?.LogComments.Count ?? 0,
            QualityScore     = quality,
            QualityLabel     = qualityLabel,
            Goals            = goalDigest,
        }
    };
}


}