using Microsoft.EntityFrameworkCore;
using Relevantz.ProgressPulse.Common.Entities;

namespace Relevantz.ProgressPulse.Data.DBContexts;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<PPGoal> Goals => Set<PPGoal>();
    public DbSet<PPWeeklyLog> WeeklyLogs => Set<PPWeeklyLog>();
    public DbSet<PPLogAttachment> LogAttachments => Set<PPLogAttachment>();
    public DbSet<PPLogGoalMapping> LogGoalMappings => Set<PPLogGoalMapping>();
    public DbSet<PPUserManagerMapping> UserManagerMappings => Set<PPUserManagerMapping>();
    public DbSet<PPLogComment> LogComments => Set<PPLogComment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<PPGoal>()
            .HasOne(g => g.User)
            .WithMany()
            .HasForeignKey(g => g.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPWeeklyLog>()
            .HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPLogAttachment>()
            .HasOne(a => a.WeeklyLog)
            .WithMany(w => w.Attachments)
            .HasForeignKey(a => a.WeeklyLogId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPLogGoalMapping>()
     .HasOne(x => x.WeeklyLog)
     .WithMany(w => w.LogGoalMappings)
     .HasForeignKey(x => x.WeeklyLogId)
     .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPLogGoalMapping>()
            .HasOne(x => x.Goal)
            .WithMany(g => g.LogGoalMappings)
            .HasForeignKey(x => x.GoalId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<PPUserManagerMapping>()
.HasOne(m => m.Employee)
.WithMany()
.HasForeignKey(m => m.EmployeeId)
.OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPUserManagerMapping>()
            .HasOne(m => m.Manager)
            .WithMany()
            .HasForeignKey(m => m.ManagerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPLogComment>()
    .HasOne(c => c.WeeklyLog)
    .WithMany(w => w.LogComments)   
    .HasForeignKey(c => c.WeeklyLogId)
    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPLogComment>()
            .HasOne(c => c.Manager)
            .WithMany()
            .HasForeignKey(c => c.ManagerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}