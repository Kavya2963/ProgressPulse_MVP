using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.ProgressPulse.Core.IService;
using System.Security.Claims;

namespace Relevantz.ProgressPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Employee")]
public class AttachmentController : ControllerBase
{
    private readonly IAttachmentService _service;
    private readonly IWebHostEnvironment _environment;

    private readonly string[] allowedTypes = { ".png", ".jpg", ".jpeg", ".pdf" };
    private const long maxFileSize = 10 * 1024 * 1024;

    public AttachmentController(
        IAttachmentService service,
        IWebHostEnvironment environment)
    {
        _service = service;
        _environment = environment;
    }

    [HttpPost("{weeklyLogId}")]
    public async Task<IActionResult> Upload(int weeklyLogId, List<IFormFile> files)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (files.Count > 5)
            return BadRequest("Maximum 5 files allowed");

        var uploadPath = Path.Combine(_environment.WebRootPath, "uploads");

        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        foreach (var file in files)
        {
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedTypes.Contains(extension))
                return BadRequest("Invalid file type");

            if (file.Length > maxFileSize)
                return BadRequest("File exceeds 10MB limit");

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            await _service.AddAttachmentMetadataAsync(
                weeklyLogId,
                userId,
                file.FileName,
                $"/uploads/{fileName}",
                file.Length);
        }

        return Ok("Files uploaded successfully");
    }

    [HttpGet("{weeklyLogId}")]
    public async Task<IActionResult> GetAttachments(int weeklyLogId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _service.GetAttachmentsAsync(weeklyLogId, userId);
        return Ok(result);
    }

    [HttpGet("download/{weeklyLogId}/{fileName}")]
    public IActionResult Download(int weeklyLogId, string fileName)
    {
        var uploadPath = Path.Combine(_environment.WebRootPath, "uploads");
        var filePath   = Path.Combine(uploadPath, fileName);

        if (!System.IO.File.Exists(filePath))
            return NotFound("File not found");

        var extension   = Path.GetExtension(fileName).ToLower();
        var contentType = extension switch
        {
            ".pdf"  => "application/pdf",
            ".png"  => "image/png",
            ".jpg"  => "image/jpeg",
            ".jpeg" => "image/jpeg",
            _       => "application/octet-stream"
        };

        var fileBytes = System.IO.File.ReadAllBytes(filePath);
        return File(fileBytes, contentType, fileName);
    }
}
