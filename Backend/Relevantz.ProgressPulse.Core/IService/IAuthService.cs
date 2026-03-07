using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.DTOs.Response;
namespace Relevantz.ProgressPulse.Core.IService;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<ProfileResponse?> GetProfileAsync(int userId);

}