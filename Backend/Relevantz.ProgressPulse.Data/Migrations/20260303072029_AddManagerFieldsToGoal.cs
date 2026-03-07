using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Relevantz.ProgressPulse.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddManagerFieldsToGoal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<int>(
                name: "AssignedByManagerId",
                table: "Goals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Goals",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Goals",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "Goals",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "Goals",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedByManagerId",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Goals");

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
    }
}
