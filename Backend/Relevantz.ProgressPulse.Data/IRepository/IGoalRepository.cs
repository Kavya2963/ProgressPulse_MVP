using Relevantz.ProgressPulse.Common.Entities;

namespace Relevantz.ProgressPulse.Data.IRepository;

public interface IGoalRepository
{
    Task AddAsync(PPGoal goal);
    Task<List<PPGoal>> GetByUserIdAsync(int userId);
    Task<PPGoal?> GetByIdAsync(int id);
    Task SaveChangesAsync();
    Task<List<PPGoal>> GetGoalsWithLogsAsync(int userId);
    Task<PPGoal?> GetGoalWithLogsAndCommentsAsync(int goalId, int userId);
    Task<PPGoal?> GetByIdForUserAsync(int goalId, int userId);
    Task<List<PPGoal>> GetByManagerIdAsync(int managerId);


}