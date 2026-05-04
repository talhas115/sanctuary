using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalJournal.API.Services;

namespace PersonalJournal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicController : ControllerBase
    {
        private readonly IPublicService _publicService;

        public PublicController(IPublicService publicService)
        {
            _publicService = publicService;
        }

        [HttpGet("{uuid}")]
        public async Task<IActionResult> GetSharedEntry(Guid uuid)
        {
            try
            {
                var entry = await _publicService.GetPublicEntryAsync(uuid);
                return Ok(entry);
            }
            catch (UnauthorizedAccessException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("generate/{entryId}")]
        public async Task<IActionResult> GenerateLink(Guid entryId)
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
                {
                    return Unauthorized("User ID not found in token.");
                }

                var uuid = await _publicService.GenerateShareLinkAsync(entryId, userId);
                return Ok(new { link = $"/api/public/{uuid}", uuid = uuid });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
