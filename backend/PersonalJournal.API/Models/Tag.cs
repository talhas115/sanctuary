using System;
using System.Collections.Generic;

namespace PersonalJournal.API.Models
{
    public class Tag
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;

        public ICollection<EntryTag> EntryTags { get; set; } = new List<EntryTag>();
    }
}
