namespace Relevantz.ProgressPulse.Common.Entities;

public class PPLogGoalMapping
{
    public int Id { get; set; }

    public int WeeklyLogId { get; set; }
    public PPWeeklyLog? WeeklyLog { get; set; }

    public int GoalId { get; set; }
    public PPGoal? Goal { get; set; }
}