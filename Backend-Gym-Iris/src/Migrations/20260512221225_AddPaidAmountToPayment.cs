using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend_Gym_Iris.Migrations
{
    /// <inheritdoc />
    public partial class AddPaidAmountToPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PaidAmount",
                table: "Payments",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaidAmount",
                table: "Payments");
        }
    }
}
