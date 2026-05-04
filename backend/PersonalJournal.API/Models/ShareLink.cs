using System;

namespace PersonalJournal.API.Models
{
    public class ShareLink
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid EntryId { get; set; }
        public Entry Entry { get; set; } = null!;
        public Guid PublicUuid { get; set; } = Guid.NewGuid();
    }
}
