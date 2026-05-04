using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalJournal.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultEncryption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "DefaultEncryption",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultEncryption",
                table: "Users");
        }
    }
}
