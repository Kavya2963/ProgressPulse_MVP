using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.DTOs.Response;
namespace Relevantz.ProgressPulse.Core.IService;

public interface ICommentService
{
    Task AddCommentAsync(int managerId, AddCommentRequest request);
}