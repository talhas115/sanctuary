using Microsoft.EntityFrameworkCore;
using PersonalJournal.API.Models;

namespace PersonalJournal.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Entry> Entries { get; set; } = null!;
        public DbSet<Tag> Tags { get; set; } = null!;
        public DbSet<EntryTag> EntryTags { get; set; } = null!;
        public DbSet<ShareLink> ShareLinks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Entry Entity
            modelBuilder.Entity<Entry>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Date);
                
                // tsvector index for Title and Content
                entity.HasGeneratedTsVectorColumn(
                    p => p.SearchVector,
                    "english",
                    p => new { p.Title, p.Content })
                    .HasIndex(p => p.SearchVector)
                    .HasMethod("GIN");
            });

            // Tag Entity
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // EntryTag Many-to-Many
            modelBuilder.Entity<EntryTag>(entity =>
            {
                entity.HasKey(et => new { et.EntryId, et.TagId });

                entity.HasOne(et => et.Entry)
                      .WithMany(e => e.EntryTags)
                      .HasForeignKey(et => et.EntryId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(et => et.Tag)
                      .WithMany(t => t.EntryTags)
                      .HasForeignKey(et => et.TagId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ShareLink Entity
            modelBuilder.Entity<ShareLink>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.PublicUuid).IsUnique();

                entity.HasOne(e => e.Entry)
                      .WithMany()
                      .HasForeignKey(e => e.EntryId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
