using Microsoft.EntityFrameworkCore;
using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.Entities;
using Relevantz.ProgressPulse.Core.IService;
using Relevantz.ProgressPulse.Data.DBContexts;

namespace Relevantz.ProgressPulse.Core.Service;

public class CommentService : ICommentService
{
    private readonly AppDbContext _context;

    public CommentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddCommentAsync(int managerId, AddCommentRequest request)
    {
        var log = await _context.WeeklyLogs
            .FirstOrDefaultAsync(l => l.Id == request.WeeklyLogId);

        if (log == null)
            throw new Exception("Log not found");

        var hasAccess = await _context.UserManagerMappings.AnyAsync(m =>
            m.ManagerId == managerId &&
            m.EmployeeId == log.UserId);

        if (!hasAccess)
            throw new UnauthorizedAccessException("You cannot comment on this log");

        var comment = new PPLogComment
        {
            WeeklyLogId = request.WeeklyLogId,
            ManagerId = managerId,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.LogComments.Add(comment);
        await _context.SaveChangesAsync();
    }
}