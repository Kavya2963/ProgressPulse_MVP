using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Relevantz.ProgressPulse.Core.IService;
using Relevantz.ProgressPulse.Core.Service;
using Relevantz.ProgressPulse.Data.DBContexts;
using Relevantz.ProgressPulse.Data.IRepository;
using Relevantz.ProgressPulse.Data.Repository;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Relevantz.ProgressPulse.Common.Validators;

var builder = WebApplication.CreateBuilder(args);

// ── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowProgressPulse", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddFluentValidation();

builder.Services.AddValidatorsFromAssemblyContaining<CreateWeeklyLogRequestValidator>();
builder.Services.AddEndpointsApiExplorer();

// ── Swagger ───────────────────────────────────────────────────────────────────
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ProgressPulse API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token like this: Bearer {your token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// ── Database ──────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 34))
    ));

// ── JWT Authentication ────────────────────────────────────────────────────────
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// ── Services & Repositories ───────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService,         AuthService>();
builder.Services.AddScoped<IWeeklyLogRepository, WeeklyLogRepository>();
builder.Services.AddScoped<IWeeklyLogService,    WeeklyLogService>();
builder.Services.AddScoped<IAttachmentService,   AttachmentService>();
builder.Services.AddScoped<IGoalRepository,      GoalRepository>();
builder.Services.AddScoped<IGoalService,         GoalService>();
builder.Services.AddScoped<IManagerService,      ManagerService>();
builder.Services.AddScoped<ICommentService,      CommentService>();

// ── FastAPI HttpClient (single registration) ──────────────────────────────────
// builder.Services.AddHttpClient("FastAPI", client =>
// {
//     client.BaseAddress = new Uri("http://progresspulse_fastapi:8001");
//     client.Timeout = TimeSpan.FromSeconds(130);
// });

builder.Services.AddHttpClient("FastAPI", client =>
{
    client.BaseAddress = new Uri("http://host.docker.internal:8001");  
    client.Timeout = TimeSpan.FromSeconds(130);
});

var app = builder.Build();

// ── Swagger (always enabled for MVP) ─────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ProgressPulse API v1");
    c.RoutePrefix = "swagger";
});

// ── Seed Test Users ───────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();

    // Manager L1
    var managerL1 = context.Users.FirstOrDefault(u => u.Email == "manager1@test.com");
    if (managerL1 == null)
    {
        managerL1 = new Relevantz.ProgressPulse.Common.Entities.User
        {
            Name         = "Manager L1",
            Email        = "manager1@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role         = "Manager"
        };
        context.Users.Add(managerL1);
        context.SaveChanges();
    }

    // Manager L2
    var managerL2 = context.Users.FirstOrDefault(u => u.Email == "manager2@test.com");
    if (managerL2 == null)
    {
        managerL2 = new Relevantz.ProgressPulse.Common.Entities.User
        {
            Name         = "Manager L2",
            Email        = "manager2@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role         = "Manager"
        };
        context.Users.Add(managerL2);
        context.SaveChanges();
    }

    // Employee — Kavya
    var employee = context.Users.FirstOrDefault(u => u.Email == "kavya@test.com");
    if (employee == null)
    {
        employee = new Relevantz.ProgressPulse.Common.Entities.User
        {
            Name         = "Kavya",
            Email        = "kavya@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role         = "Employee"
        };
        context.Users.Add(employee);
        context.SaveChanges();
    }

    // Manager Mapping — L1
    if (!context.UserManagerMappings.Any(m =>
        m.EmployeeId == employee.Id && m.ManagerId == managerL1.Id))
    {
        context.UserManagerMappings.Add(
            new Relevantz.ProgressPulse.Common.Entities.PPUserManagerMapping
            {
                EmployeeId = employee.Id,
                ManagerId  = managerL1.Id,
                Level      = "L1"
            });
    }

    // Manager Mapping — L2
    if (!context.UserManagerMappings.Any(m =>
        m.EmployeeId == employee.Id && m.ManagerId == managerL2.Id))
    {
        context.UserManagerMappings.Add(
            new Relevantz.ProgressPulse.Common.Entities.PPUserManagerMapping
            {
                EmployeeId = employee.Id,
                ManagerId  = managerL2.Id,
                Level      = "L2"
            });
    }

    context.SaveChanges();
}

// ── Middleware Pipeline (ORDER MATTERS) ───────────────────────────────────────
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowProgressPulse");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
