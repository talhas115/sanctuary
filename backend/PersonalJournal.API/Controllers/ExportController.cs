using System;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalJournal.API.Services;

namespace PersonalJournal.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ExportController : ControllerBase
    {
        private readonly IExportService _exportService;

        public ExportController(IExportService exportService)
        {
            _exportService = exportService;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token.");
            }
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> ExportAll([FromQuery] string format = "pdf")
        {
            var userId = GetUserId();

            if (format.ToLower() == "html")
            {
                var html = await _exportService.ExportEntriesToHtmlAsync(userId);
                return File(Encoding.UTF8.GetBytes(html), "text/html", "journal_export.html");
            }
            else
            {
                var pdfBytes = await _exportService.ExportEntriesToPdfAsync(userId);
                return File(pdfBytes, "application/pdf", "journal_export.pdf");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ExportSingle(Guid id, [FromQuery] string format = "pdf")
        {
            try
            {
                var userId = GetUserId();

                if (format.ToLower() == "html")
                {
                    var html = await _exportService.ExportEntriesToHtmlAsync(userId, id);
                    return File(Encoding.UTF8.GetBytes(html), "text/html", $"entry_{id}.html");
                }
                else
                {
                    var pdfBytes = await _exportService.ExportEntriesToPdfAsync(userId, id);
                    return File(pdfBytes, "application/pdf", $"entry_{id}.pdf");
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }
    }
}
