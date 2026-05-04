using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PersonalJournal.API.DTOs.Entries
{
    public class CreateEntryDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        [Required]
        public string Content { get; set; } = string.Empty;
        public string Visibility { get; set; } = "private";
        public DateTime Date { get; set; } = DateTime.UtcNow.Date;
        public List<string> Tags { get; set; } = new List<string>();
        public bool IsEncrypted { get; set; } = false;
    }

    public class UpdateEntryDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        [Required]
        public string Content { get; set; } = string.Empty;
        public string Visibility { get; set; } = "private";
        public DateTime Date { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public bool IsEncrypted { get; set; } = false;
    }

    public class EntryResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Visibility { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; }
        public int WordCount { get; set; }
        public bool IsEncrypted { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
    }
}
