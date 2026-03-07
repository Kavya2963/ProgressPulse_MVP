using Relevantz.ProgressPulse.Common.DTOs.Response;
using Relevantz.ProgressPulse.Common.Entities;
using Relevantz.ProgressPulse.Core.IService;
using Relevantz.ProgressPulse.Data.IRepository;

namespace Relevantz.ProgressPulse.Core.Service;

public class AttachmentService : IAttachmentService
{
    private readonly IWeeklyLogRepository _repository;

    public AttachmentService(IWeeklyLogRepository repository)
    {
        _repository = repository;
    }

    public async Task AddAttachmentMetadataAsync(
        int weeklyLogId,
        int userId,
        string originalFileName,
        string storedFilePath,
        long fileSize)
    {
        var log = await _repository.GetByIdAsync(weeklyLogId);

        if (log == null || log.UserId != userId)
            throw new Exception("Log not found or unauthorized");

        log.Attachments.Add(new PPLogAttachment
        {
            FileName   = originalFileName,
            FilePath   = storedFilePath,
            FileSize   = fileSize,
            UploadedAt = DateTime.UtcNow
        });

        await _repository.SaveChangesAsync();
    }

    public async Task<List<AttachmentResponse>> GetAttachmentsAsync(int weeklyLogId, int userId)
    {
        var log = await _repository.GetByIdAsync(weeklyLogId);

        if (log == null || log.UserId != userId)
            throw new Exception("Log not found or unauthorized");

        return log.Attachments.Select(a => new AttachmentResponse
        {
            FileName = a.FileName,
            FilePath = a.FilePath,
            FileSize = a.FileSize
        }).ToList();
    }
}
