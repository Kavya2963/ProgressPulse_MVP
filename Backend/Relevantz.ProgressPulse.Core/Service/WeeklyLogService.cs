using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.Entities;
using Relevantz.ProgressPulse.Core.IService;
using Relevantz.ProgressPulse.Data.IRepository;
using Relevantz.ProgressPulse.Common.DTOs.Response;

namespace Relevantz.ProgressPulse.Core.Service;

public class WeeklyLogService : IWeeklyLogService
{
    private readonly IWeeklyLogRepository _repository;

    public WeeklyLogService(IWeeklyLogRepository repository)
    {
        _repository = repository;
    }

   public async Task<int> CreateWeeklyLogAsync(int userId, CreateWeeklyLogRequest request)
{
    var goals = await _repository.GetGoalsByIdsAsync(request.GoalIds, userId);

    if (goals.Count != request.GoalIds.Count)
        throw new Exception("One or more goals are invalid");

    var log = new PPWeeklyLog
    {
        UserId      = userId,
        Title       = request.Title,
        Description = request.Description,
        Impact      = request.Impact,
        CreatedAt   = DateTime.UtcNow
    };

    await _repository.AddAsync(log);
    await _repository.SaveChangesAsync();  

    var mappings = goals.Select(g => new PPLogGoalMapping
    {
        WeeklyLogId = log.Id,
        GoalId      = g.Id
    }).ToList();

    await _repository.AddLogGoalMappingsAsync(mappings);
    await _repository.SaveChangesAsync();

    return log.Id;  
}


    public async Task<List<WeeklyLogResponse>> GetUserLogsAsync(int userId, int? goalId)
    {
        var logs = await _repository.GetByUserIdAsync(userId, goalId);

        return logs.Select(log => new WeeklyLogResponse
        {
            Id          = log.Id,
            Title       = log.Title,
            Description = log.Description,
            Impact      = log.Impact,
            CreatedAt   = log.CreatedAt,

            Attachments = log.Attachments.Select(a => new AttachmentResponse
            {
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileSize = a.FileSize
            }).ToList(),

            Goals = log.LogGoalMappings.Select(m => new GoalTagResponse
            {
                Id    = m.Goal!.Id,
                Title = m.Goal.Title
            }).ToList()
        }).ToList();
    }

    public async Task<List<LogCommentResponse>> GetLogCommentsAsync(int userId, int logId)
    {
        return await _repository.GetLogCommentsAsync(userId, logId);
    }
}
