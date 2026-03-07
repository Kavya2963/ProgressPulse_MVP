using Microsoft.EntityFrameworkCore;
using Relevantz.ProgressPulse.Common.Entities;
using Relevantz.ProgressPulse.Data.DBContexts;
using Relevantz.ProgressPulse.Data.IRepository;
using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.DTOs.Response;  // ← ADD THIS


namespace Relevantz.ProgressPulse.Data.Repository;

public class WeeklyLogRepository : IWeeklyLogRepository
{
    private readonly AppDbContext _context;

    public WeeklyLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(PPWeeklyLog log)
    {
        await _context.WeeklyLogs.AddAsync(log);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
    public async Task<PPWeeklyLog?> GetByIdAsync(int id)
    {
        return await _context.WeeklyLogs
            .Include(x => x.Attachments)
            .FirstOrDefaultAsync(x => x.Id == id);
    }
    public async Task<List<PPWeeklyLog>> GetByUserIdAsync(int userId, int? goalId)
    {
        var query = _context.WeeklyLogs
            .Where(x => x.UserId == userId)
            .Include(x => x.Attachments)
            .Include(x => x.LogGoalMappings)
                .ThenInclude(m => m.Goal)
            .AsQueryable();

        if (goalId.HasValue)
        {
            query = query.Where(log =>
                log.LogGoalMappings.Any(m => m.GoalId == goalId.Value));
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }
    public async Task<List<PPGoal>> GetGoalsByIdsAsync(List<int> goalIds, int userId)
    {
        return await _context.Goals
            .Where(g => goalIds.Contains(g.Id) && g.UserId == userId)
            .ToListAsync();
    }


    public async Task AddLogGoalMappingsAsync(List<PPLogGoalMapping> mappings)
    {
        await _context.LogGoalMappings.AddRangeAsync(mappings);
    }

    public async Task<List<PPWeeklyLog>> GetLogsByEmployeeIdsAsync(List<int> employeeIds)
    {
        return await _context.WeeklyLogs
            .Where(log => employeeIds.Contains(log.UserId))
            .Include(log => log.User)
            .Include(log => log.Attachments)
            .Include(log => log.LogGoalMappings)
                .ThenInclude(m => m.Goal)
            .OrderByDescending(log => log.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<(List<PPWeeklyLog>, int)> GetFilteredTeamLogsAsync(
        List<int> employeeIds,
        ManagerLogFilterRequest filter)
    {
        var query = _context.WeeklyLogs
            .Include(w => w.User)
            .Include(w => w.LogGoalMappings)
                .ThenInclude(m => m.Goal)
            .Include(w => w.Attachments)
            .Where(w => employeeIds.Contains(w.UserId))
            .AsQueryable();

        if (filter.StartDate.HasValue)
            query = query.Where(w => w.CreatedAt >= filter.StartDate.Value);

        if (filter.EndDate.HasValue)
            query = query.Where(w => w.CreatedAt <= filter.EndDate.Value);

        if (filter.GoalId.HasValue)
            query = query.Where(w =>
                w.LogGoalMappings.Any(m => m.GoalId == filter.GoalId.Value));

        if (!string.IsNullOrWhiteSpace(filter.EmployeeName))
            query = query.Where(w =>
                w.User.Name.Contains(filter.EmployeeName));

        query = query.OrderByDescending(w => w.CreatedAt);

        var totalCount = await query.CountAsync();

        var logs = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return (logs, totalCount);
    }
public async Task<List<LogCommentResponse>> GetLogCommentsAsync(int userId, int logId)
{
    // Verify log belongs to this user
    var logExists = await _context.WeeklyLogs
        .AnyAsync(w => w.Id == logId && w.UserId == userId);

    if (!logExists)
        throw new Exception("Log not found");

    return await _context.LogComments
        .Where(c => c.WeeklyLogId == logId)
        .Include(c => c.Manager)
        .OrderBy(c => c.CreatedAt)
        .Select(c => new LogCommentResponse
        {
            Id          = c.Id,
            Comment     = c.Comment,
            ManagerName = c.Manager.Name,
            CreatedAt   = c.CreatedAt
        })
        .ToListAsync();
}

}