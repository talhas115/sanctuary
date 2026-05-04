using System;

namespace PersonalJournal.API.DTOs.Entries
{
    public class PublicEntryDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int WordCount { get; set; }
        public bool IsEncrypted { get; set; }
    }
}
