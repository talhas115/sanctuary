using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PersonalJournal.API.Data;
using PersonalJournal.API.Models;

namespace PersonalJournal.API.Repositories
{
    public interface IShareLinkRepository
    {
        Task<ShareLink?> GetByUuidAsync(Guid publicUuid);
        Task<ShareLink?> GetByEntryIdAsync(Guid entryId);
        Task AddAsync(ShareLink shareLink);
        Task SaveChangesAsync();
    }

    public class ShareLinkRepository : IShareLinkRepository
    {
        private readonly ApplicationDbContext _context;

        public ShareLinkRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ShareLink?> GetByUuidAsync(Guid publicUuid)
        {
            return await _context.ShareLinks
                .Include(s => s.Entry)
                .FirstOrDefaultAsync(s => s.PublicUuid == publicUuid);
        }

        public async Task<ShareLink?> GetByEntryIdAsync(Guid entryId)
        {
            return await _context.ShareLinks
                .FirstOrDefaultAsync(s => s.EntryId == entryId);
        }

        public async Task AddAsync(ShareLink shareLink)
        {
            await _context.ShareLinks.AddAsync(shareLink);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
