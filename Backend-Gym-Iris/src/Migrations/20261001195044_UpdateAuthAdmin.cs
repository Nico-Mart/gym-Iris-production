using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend_Gym_Iris.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAuthAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PilatesAppointments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PilatesAppointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    Day = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TimeSlot = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    UserId1 = table.Column<int>(type: "int", nullable: true)
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
                    table.ForeignKey(
                        name: "FK_PilatesAppointments_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PilatesAppointments_Day_TimeSlot",
                table: "PilatesAppointments",
                columns: new[] { "Day", "TimeSlot" });

            migrationBuilder.CreateIndex(
                name: "IX_PilatesAppointments_UserId_Day_TimeSlot",
                table: "PilatesAppointments",
                columns: new[] { "UserId", "Day", "TimeSlot" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PilatesAppointments_UserId1",
                table: "PilatesAppointments",
                column: "UserId1");
        }
    }
}
