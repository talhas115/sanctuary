using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PersonalJournal.API.Repositories;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace PersonalJournal.API.Services
{
    public interface IExportService
    {
        Task<byte[]> ExportEntriesToPdfAsync(Guid userId, Guid? entryId = null);
        Task<string> ExportEntriesToHtmlAsync(Guid userId, Guid? entryId = null);
    }

    public class ExportService : IExportService
    {
        private readonly IEntryRepository _entryRepository;

        public ExportService(IEntryRepository entryRepository)
        {
            _entryRepository = entryRepository;
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public async Task<byte[]> ExportEntriesToPdfAsync(Guid userId, Guid? entryId = null)
        {
            var entries = new List<Models.Entry>();
            if (entryId.HasValue)
            {
                var entry = await _entryRepository.GetByIdAsync(entryId.Value);
                if (entry == null || entry.UserId != userId)
                {
                    throw new UnauthorizedAccessException("Entry not found or access denied.");
                }
                entries.Add(entry);
            }
            else
            {
                entries = await _entryRepository.GetAllByUserIdAsync(userId);
            }

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header()
                        .Text("Personal Journal Export")
                        .SemiBold().FontSize(24).FontColor(Colors.Blue.Darken2);

                    page.Content().PaddingVertical(1, Unit.Centimetre).Column(x =>
                    {
                        foreach (var entry in entries)
                        {
                            x.Item().Text(entry.Title).SemiBold().FontSize(18).FontColor(Colors.Grey.Darken3);
                            x.Item().Text(entry.Date.ToString("yyyy-MM-dd")).FontSize(10).FontColor(Colors.Grey.Medium);
                            x.Item().PaddingBottom(1, Unit.Centimetre).Text(entry.Content);
                        }
                    });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Page ");
                            x.CurrentPageNumber();
                        });
                });
            });

            using var stream = new MemoryStream();
            document.GeneratePdf(stream);
            return stream.ToArray();
        }

        public async Task<string> ExportEntriesToHtmlAsync(Guid userId, Guid? entryId = null)
        {
            var entries = new List<Models.Entry>();
            if (entryId.HasValue)
            {
                var entry = await _entryRepository.GetByIdAsync(entryId.Value);
                if (entry == null || entry.UserId != userId)
                {
                    throw new UnauthorizedAccessException("Entry not found or access denied.");
                }
                entries.Add(entry);
            }
            else
            {
                entries = await _entryRepository.GetAllByUserIdAsync(userId);
            }

            var sb = new StringBuilder();
            sb.AppendLine("<!DOCTYPE html>");
            sb.AppendLine("<html><head><title>Journal Export</title></head><body>");
            sb.AppendLine("<h1>Personal Journal Export</h1>");

            foreach (var entry in entries)
            {
                sb.AppendLine($"<h2>{entry.Title}</h2>");
                sb.AppendLine($"<p><em>{entry.Date:yyyy-MM-dd}</em></p>");
                sb.AppendLine($"<div>{entry.Content}</div>");
                sb.AppendLine("<hr/>");
            }

            sb.AppendLine("</body></html>");
            return sb.ToString();
        }
    }
}
