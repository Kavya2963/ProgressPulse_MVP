using Relevantz.ProgressPulse.Common.Entities;
using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.DTOs.Response;  // ← ADD THIS


namespace Relevantz.ProgressPulse.Data.IRepository;

public interface IWeeklyLogRepository
{
    // Create
    Task AddAsync(PPWeeklyLog log);

    // Save
    Task SaveChangesAsync();

    // Get single log
    Task<PPWeeklyLog?> GetByIdAsync(int id);

    // Get logs for employee (with optional goal filter)
    Task<List<PPWeeklyLog>> GetByUserIdAsync(int userId, int? goalId);

    // Get goals by Ids for validation
    Task<List<PPGoal>> GetGoalsByIdsAsync(List<int> goalIds, int userId);

    // Add log-goal mappings
    Task AddLogGoalMappingsAsync(List<PPLogGoalMapping> mappings);
    Task<List<LogCommentResponse>> GetLogCommentsAsync(int userId, int logId);


    // Manager: get logs by employee list
    Task<List<PPWeeklyLog>> GetLogsByEmployeeIdsAsync(List<int> employeeIds);
    Task<(List<PPWeeklyLog> Logs, int TotalCount)> 
    
GetFilteredTeamLogsAsync(
    List<int> employeeIds,
    ManagerLogFilterRequest filter);
}