using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalJournal.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveEncryptedContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EncryptedContent",
                table: "Entries");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EncryptedContent",
                table: "Entries",
                type: "text",
                nullable: true);
        }
    }
}
