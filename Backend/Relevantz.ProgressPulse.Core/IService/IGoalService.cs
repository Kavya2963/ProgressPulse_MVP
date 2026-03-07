using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.DTOs.Response;

namespace Relevantz.ProgressPulse.Core.IService;

public interface IGoalService
{
    Task CreateGoalAsync(int userId, CreateGoalRequest request);
    Task<List<GoalResponse>> GetUserGoalsAsync(int userId);
    Task UpdateGoalAsync(int userId, int goalId, UpdateGoalRequest request);
    Task<List<GoalProgressResponse>> GetGoalProgressAsync(int userId);
    Task<GoalDetailResponse> GetGoalDetailsAsync(int userId, int goalId);
    Task UpdateProgressAsync(int userId, int goalId, double progressPercentage);
    Task AssignGoalAsync(int managerId, AssignGoalRequest request);
    Task<List<GoalResponse>> GetAssignedGoalsAsync(int managerId); 
}
