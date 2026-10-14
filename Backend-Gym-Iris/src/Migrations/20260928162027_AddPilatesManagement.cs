using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend_Gym_Iris.Migrations
{
    /// <inheritdoc />
    public partial class AddPilatesManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PilatesSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    DayIndex = table.Column<int>(type: "int", nullable: false),
                    SlotIndex = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PilatesSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PilatesSchedules_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PilatesSchedules_DayIndex_SlotIndex",
                table: "PilatesSchedules",
                columns: new[] { "DayIndex", "SlotIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_PilatesSchedules_UserId_DayIndex",
                table: "PilatesSchedules",
                columns: new[] { "UserId", "DayIndex" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PilatesSchedules");
        }
    }
}
