using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Relevantz.ProgressPulse.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixCommentForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PPWeeklyLogId",
                table: "LogComments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LogComments_PPWeeklyLogId",
                table: "LogComments",
                column: "PPWeeklyLogId");

            migrationBuilder.AddForeignKey(
                name: "FK_LogComments_WeeklyLogs_PPWeeklyLogId",
                table: "LogComments",
                column: "PPWeeklyLogId",
                principalTable: "WeeklyLogs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LogComments_WeeklyLogs_PPWeeklyLogId",
                table: "LogComments");

            migrationBuilder.DropIndex(
                name: "IX_LogComments_PPWeeklyLogId",
                table: "LogComments");

            migrationBuilder.DropColumn(
                name: "PPWeeklyLogId",
                table: "LogComments");
        }
    }
}
