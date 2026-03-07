using Relevantz.ProgressPulse.Common.DTOs.Response;

namespace Relevantz.ProgressPulse.Core.IService;

public interface IAttachmentService
{
    Task AddAttachmentMetadataAsync(
        int weeklyLogId,
        int userId,
        string originalFileName,
        string storedFilePath,
        long fileSize);

    Task<List<AttachmentResponse>> GetAttachmentsAsync(int weeklyLogId, int userId);  
}
