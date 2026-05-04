using System;
using System.Collections.Generic;

namespace PersonalJournal.API.Models
{
    public class Entry
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Visibility { get; set; } = "private"; // private/public
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsEncrypted { get; set; } = false;

        public NpgsqlTypes.NpgsqlTsVector? SearchVector { get; set; }

        public ICollection<EntryTag> EntryTags { get; set; } = new List<EntryTag>();
    }
}
