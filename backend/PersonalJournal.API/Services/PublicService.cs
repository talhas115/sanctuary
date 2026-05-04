using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using PersonalJournal.API.DTOs.Entries;
using PersonalJournal.API.Models;
using PersonalJournal.API.Repositories;

namespace PersonalJournal.API.Services
{
    public interface IPublicService
    {
        Task<Guid> GenerateShareLinkAsync(Guid entryId, Guid userId);
        Task<PublicEntryDto> GetPublicEntryAsync(Guid publicUuid);
    }

    public class PublicService : IPublicService
    {
        private readonly IShareLinkRepository _shareLinkRepository;
        private readonly IEntryRepository _entryRepository;

        public PublicService(IShareLinkRepository shareLinkRepository, IEntryRepository entryRepository)
        {
            _shareLinkRepository = shareLinkRepository;
            _entryRepository = entryRepository;
        }

        public async Task<Guid> GenerateShareLinkAsync(Guid entryId, Guid userId)
        {
            var entry = await _entryRepository.GetByIdAsync(entryId);
            if (entry == null || entry.UserId != userId)
            {
                throw new UnauthorizedAccessException("Entry not found or access denied.");
            }

            if (entry.Visibility != "public")
            {
                throw new InvalidOperationException("Cannot share a private entry.");
            }

            // Restriction removed: encrypted entries CAN be shared if the user specifically makes them public.
            // Decryption happens on the client side in the share view.

            var existingLink = await _shareLinkRepository.GetByEntryIdAsync(entryId);
            if (existingLink != null)
            {
                return existingLink.PublicUuid;
            }

            var shareLink = new ShareLink
            {
                EntryId = entryId,
                PublicUuid = Guid.NewGuid()
            };

            await _shareLinkRepository.AddAsync(shareLink);
            await _shareLinkRepository.SaveChangesAsync();

            return shareLink.PublicUuid;
        }

        public async Task<PublicEntryDto> GetPublicEntryAsync(Guid publicUuid)
        {
            var shareLink = await _shareLinkRepository.GetByUuidAsync(publicUuid);
            if (shareLink == null || shareLink.Entry == null)
            {
                throw new UnauthorizedAccessException("Invalid or expired share link.");
            }

            if (shareLink.Entry.Visibility != "public")
            {
                throw new UnauthorizedAccessException("This entry is no longer public.");
            }

            return new PublicEntryDto
            {
                Title = shareLink.Entry.Title,
                Content = shareLink.Entry.Content,
                Date = shareLink.Entry.Date,
                IsEncrypted = shareLink.Entry.IsEncrypted,
                WordCount = CalculateWordCount(shareLink.Entry.Content, shareLink.Entry.IsEncrypted)
            };
        }

        private int CalculateWordCount(string content, bool isEncrypted)
        {
            if (string.IsNullOrWhiteSpace(content)) return 0;
            if (isEncrypted) return 0; // Word count cannot be calculated for raw encrypted strings on server
            var textOnly = Regex.Replace(content, "<.*?>", string.Empty);
            return textOnly.Split(new[] { ' ', '\r', '\n', '\t' }, StringSplitOptions.RemoveEmptyEntries).Length;
        }
    }
}
