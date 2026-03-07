using Microsoft.EntityFrameworkCore;
using Relevantz.ProgressPulse.Common.Entities;
using Relevantz.ProgressPulse.Data.DBContexts;
using Relevantz.ProgressPulse.Data.IRepository;

namespace Relevantz.ProgressPulse.Data.Repository;

public class GoalRepository : IGoalRepository
{
    private readonly AppDbContext _context;

    public GoalRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(PPGoal goal)
    {
        await _context.Goals.AddAsync(goal);
    }

    public async Task<List<PPGoal>> GetByUserIdAsync(int userId)
    {
        return await _context.Goals
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<PPGoal?> GetByIdAsync(int id)
    {
        return await _context.Goals
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
    public async Task<List<PPGoal>> GetGoalsWithLogsAsync(int userId)
    {
        return await _context.Goals
            .Where(g => g.UserId == userId)
            .Include(g => g.LogGoalMappings)
            .ToListAsync();
    }
    public async Task<PPGoal?> GetGoalWithLogsAndCommentsAsync(int goalId, int userId)
    {
        return await _context.Goals
            .Where(g => g.Id == goalId && g.UserId == userId)
            .Include(g => g.LogGoalMappings)
                .ThenInclude(m => m.WeeklyLog)
                    .ThenInclude(w => w.LogComments)
            .FirstOrDefaultAsync();
    }
    public async Task<PPGoal?> GetByIdForUserAsync(int goalId, int userId)
{
    return await _context.Goals
        .FirstOrDefaultAsync(g => g.Id == goalId && g.UserId == userId);
}
public async Task<List<PPGoal>> GetByManagerIdAsync(int managerId)
{
    return await _context.Goals
        .Where(g => g.AssignedByManagerId == managerId)
        .OrderByDescending(g => g.CreatedAt)
        .ToListAsync();
}

}