using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

#nullable disable

namespace Backend_Gym_Iris.Migrations
{
    public partial class RemovePilatesAppointments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropTable(
                name: "PilatesAppointments");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Recreate the old table if rolling back
            migrationBuilder.CreateTable(
                name: "PilatesAppointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Day = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    TimeSlot = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PilatesAppointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PilatesAppointments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PilatesAppointments_Day_TimeSlot",
                table: "PilatesAppointments",
                columns: new[] { "Day", "TimeSlot" });

            migrationBuilder.CreateIndex(
                name: "IX_PilatesAppointments_UserId_Day_TimeSlot",
                table: "PilatesAppointments",
                columns: new[] { "UserId", "Day", "TimeSlot" },
                unique: true);
        }
    }
}
