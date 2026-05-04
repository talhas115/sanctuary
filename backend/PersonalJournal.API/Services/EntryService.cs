using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using PersonalJournal.API.DTOs.Entries;
using PersonalJournal.API.Models;
using PersonalJournal.API.Repositories;

namespace PersonalJournal.API.Services
{
    public interface IEntryService
    {
        Task<EntryResponseDto> CreateEntryAsync(Guid userId, CreateEntryDto request);
        Task<EntryResponseDto> UpdateEntryAsync(Guid id, Guid userId, UpdateEntryDto request);
        Task DeleteEntryAsync(Guid id, Guid userId);
        Task<EntryResponseDto> GetEntryAsync(Guid id, Guid userId);
        Task<List<EntryResponseDto>> GetAllEntriesAsync(Guid userId);
        Task<List<EntryResponseDto>> SearchEntriesAsync(Guid userId, string query, string? tag, DateTime? startDate, DateTime? endDate);
        Task<List<EntryResponseDto>> GetCalendarAsync(Guid userId, int year, int month);
    }

    public class EntryService : IEntryService
    {
        private readonly IEntryRepository _entryRepository;

        public EntryService(IEntryRepository entryRepository)
        {
            _entryRepository = entryRepository;
        }

        public async Task<EntryResponseDto> CreateEntryAsync(Guid userId, CreateEntryDto request)
        {
            var entry = new Entry
            {
                UserId = userId,
                Title = request.Title,
                Content = request.Content,
                Visibility = request.Visibility,
                Date = request.Date,
                IsEncrypted = request.IsEncrypted
            };

            await ProcessTagsAsync(entry, request.Tags);

            await _entryRepository.AddAsync(entry);
            await _entryRepository.SaveChangesAsync();

            return MapToDto(entry);
        }

        public async Task<EntryResponseDto> UpdateEntryAsync(Guid id, Guid userId, UpdateEntryDto request)
        {
            var entry = await _entryRepository.GetByIdAsync(id);
            if (entry == null || entry.UserId != userId)
            {
                throw new UnauthorizedAccessException("Entry not found or access denied.");
            }

            entry.Title = request.Title;
            entry.Content = request.Content;
            entry.Visibility = request.Visibility;
            entry.Date = request.Date;
            entry.IsEncrypted = request.IsEncrypted;

            entry.EntryTags.Clear();
            await ProcessTagsAsync(entry, request.Tags);

            await _entryRepository.UpdateAsync(entry);
            await _entryRepository.SaveChangesAsync();

            return MapToDto(entry);
        }

        public async Task DeleteEntryAsync(Guid id, Guid userId)
        {
            var entry = await _entryRepository.GetByIdAsync(id);
            if (entry == null || entry.UserId != userId)
            {
                throw new UnauthorizedAccessException("Entry not found or access denied.");
            }

            await _entryRepository.DeleteAsync(entry);
            await _entryRepository.SaveChangesAsync();
        }

        public async Task<EntryResponseDto> GetEntryAsync(Guid id, Guid userId)
        {
            var entry = await _entryRepository.GetByIdAsync(id);
            if (entry == null || entry.UserId != userId)
            {
                throw new UnauthorizedAccessException("Entry not found or access denied.");
            }

            return MapToDto(entry);
        }

        public async Task<List<EntryResponseDto>> GetAllEntriesAsync(Guid userId)
        {
            var entries = await _entryRepository.GetAllByUserIdAsync(userId);
            return entries.Select(MapToDto).ToList();
        }

        public async Task<List<EntryResponseDto>> SearchEntriesAsync(Guid userId, string query, string? tag, DateTime? startDate, DateTime? endDate)
        {
            var entries = await _entryRepository.SearchAsync(userId, query, tag, startDate, endDate);
            return entries.Select(MapToDto).ToList();
        }

        public async Task<List<EntryResponseDto>> GetCalendarAsync(Guid userId, int year, int month)
        {
            var entries = await _entryRepository.GetCalendarAsync(userId, year, month);
            return entries.Select(MapToDto).ToList();
        }

        private async Task ProcessTagsAsync(Entry entry, List<string> tagNames)
        {
            if (tagNames == null || !tagNames.Any()) return;

            foreach (var tagName in tagNames.Distinct())
            {
                var tag = await _entryRepository.GetOrCreateTagAsync(tagName.ToLowerInvariant());
                entry.EntryTags.Add(new EntryTag { Entry = entry, Tag = tag });
            }
        }

        private EntryResponseDto MapToDto(Entry entry)
        {
            return new EntryResponseDto
            {
                Id = entry.Id,
                Title = entry.Title,
                Content = entry.Content,
                Visibility = entry.Visibility,
                Date = entry.Date,
                CreatedAt = entry.CreatedAt,
                IsEncrypted = entry.IsEncrypted,
                WordCount = CalculateWordCount(entry.Content),
                Tags = entry.EntryTags.Select(et => et.Tag.Name).ToList()
            };
        }

        private int CalculateWordCount(string content)
        {
            if (string.IsNullOrWhiteSpace(content)) return 0;
            // Strip HTML tags for word count
            var textOnly = Regex.Replace(content, "<.*?>", string.Empty);
            return textOnly.Split(new[] { ' ', '\r', '\n', '\t' }, StringSplitOptions.RemoveEmptyEntries).Length;
        }
    }
}
