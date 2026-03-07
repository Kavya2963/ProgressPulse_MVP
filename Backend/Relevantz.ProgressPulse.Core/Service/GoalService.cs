using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.DTOs.Response;
using Relevantz.ProgressPulse.Common.Entities;
using Relevantz.ProgressPulse.Core.IService;
using Relevantz.ProgressPulse.Data.IRepository;

namespace Relevantz.ProgressPulse.Core.Service;

public class GoalService : IGoalService
{
    private readonly IGoalRepository _repository;

    public GoalService(IGoalRepository repository)
    {
        _repository = repository;
    }

    public async Task CreateGoalAsync(int userId, CreateGoalRequest request)
    {
        var goal = new PPGoal
        {
            UserId             = userId,
            Title              = request.Title,
            Description        = request.Description,
            Status             = "NotStarted",
            ProgressPercentage = 0,
            CreatedBy          = "employee",
            CreatedAt          = DateTime.UtcNow
        };

        await _repository.AddAsync(goal);
        await _repository.SaveChangesAsync();
    }

    public async Task<List<GoalResponse>> GetUserGoalsAsync(int userId)
    {
        var goals = await _repository.GetByUserIdAsync(userId);

        return goals.Select(g => new GoalResponse
        {
            Id                  = g.Id,
            Title               = g.Title,
            Description         = g.Description,
            Status              = g.Status,
            ProgressPercentage  = g.ProgressPercentage,
            CreatedAt           = g.CreatedAt,
            CreatedBy           = g.CreatedBy,
            AssignedByManagerId = g.AssignedByManagerId,
            Category            = g.Category,
            Priority            = g.Priority,
            DueDate             = g.DueDate,
        }).ToList();
    }

    public async Task UpdateGoalAsync(int userId, int goalId, UpdateGoalRequest request)
    {
        var goal = await _repository.GetByIdAsync(goalId);

        if (goal == null || goal.UserId != userId)
            throw new Exception("Goal not found or unauthorized");

        goal.Title             = request.Title;
        goal.Description       = request.Description;
        goal.Status            = request.Status;
        goal.ProgressPercentage = request.ProgressPercentage;

        await _repository.SaveChangesAsync();
    }

    public async Task<List<GoalProgressResponse>> GetGoalProgressAsync(int userId)
    {
        var goals = await _repository.GetByUserIdAsync(userId);

        return goals.Select(g => new GoalProgressResponse
        {
            GoalId               = g.Id,
            Title                = g.Title,
            LogsLinked           = g.LogGoalMappings.Count,
            CompletionPercentage = g.ProgressPercentage
        }).ToList();
    }

    public async Task<GoalDetailResponse> GetGoalDetailsAsync(int userId, int goalId)
    {
        var goal = await _repository.GetGoalWithLogsAndCommentsAsync(goalId, userId);

        if (goal == null)
            throw new Exception("Goal not found");

        return new GoalDetailResponse
        {
            GoalId      = goal.Id,
            Title       = goal.Title,
            Description = goal.Description,
            Logs        = goal.LogGoalMappings.Select(m => new GoalLogDetail
            {
                WeeklyLogId     = m.WeeklyLog.Id,
                LogTitle        = m.WeeklyLog.Title,
                CreatedAt       = m.WeeklyLog.CreatedAt,
                ManagerComments = m.WeeklyLog.LogComments
                    .Select(c => c.Comment)
                    .ToList()
            }).ToList()
        };
    }

    public async Task UpdateProgressAsync(int userId, int goalId, double progressPercentage)
    {
        var goal = await _repository.GetByIdForUserAsync(goalId, userId);

        if (goal == null)
            throw new Exception("Goal not found or unauthorized");

        goal.ProgressPercentage = (int)Math.Clamp(progressPercentage, 0, 100);
        goal.Status = goal.ProgressPercentage >= 100 ? "Completed"
                    : goal.ProgressPercentage > 0    ? "InProgress"
                    : "NotStarted";

        await _repository.SaveChangesAsync();
    }

    public async Task AssignGoalAsync(int managerId, AssignGoalRequest request)
    {
        var goal = new PPGoal
        {
            UserId              = request.AssignedToEmployeeId,
            AssignedByManagerId = managerId,
            CreatedBy           = "manager",
            Title               = request.Title,
            Description         = request.Description ?? string.Empty,
            Category            = request.Category,
            Priority            = request.Priority,
            DueDate             = request.DueDate,
            Status              = "NotStarted",
            ProgressPercentage  = 0,
            CreatedAt           = DateTime.UtcNow,
        };

        await _repository.AddAsync(goal);
        await _repository.SaveChangesAsync();
    }

    public async Task<List<GoalResponse>> GetAssignedGoalsAsync(int managerId)
    {
        var goals = await _repository.GetByManagerIdAsync(managerId);

        return goals.Select(g => new GoalResponse
        {
            Id                  = g.Id,
            Title               = g.Title,
            Description         = g.Description,
            Status              = g.Status,
            ProgressPercentage  = g.ProgressPercentage,
            CreatedAt           = g.CreatedAt,
            CreatedBy           = g.CreatedBy,
            AssignedByManagerId = g.AssignedByManagerId,
            Category            = g.Category,
            Priority            = g.Priority,
            DueDate             = g.DueDate,
        }).ToList();
    }
}
