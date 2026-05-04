using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PersonalJournal.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Repositories & Services
builder.Services.AddScoped<PersonalJournal.API.Repositories.IUserRepository, PersonalJournal.API.Repositories.UserRepository>();
builder.Services.AddScoped<PersonalJournal.API.Services.IAuthService, PersonalJournal.API.Services.AuthService>();
builder.Services.AddScoped<PersonalJournal.API.Repositories.IEntryRepository, PersonalJournal.API.Repositories.EntryRepository>();
builder.Services.AddScoped<PersonalJournal.API.Services.IEntryService, PersonalJournal.API.Services.EntryService>();
builder.Services.AddScoped<PersonalJournal.API.Services.IAnalyticsService, PersonalJournal.API.Services.AnalyticsService>();
builder.Services.AddScoped<PersonalJournal.API.Services.IExportService, PersonalJournal.API.Services.ExportService>();
builder.Services.AddScoped<PersonalJournal.API.Repositories.IShareLinkRepository, PersonalJournal.API.Repositories.ShareLinkRepository>();
builder.Services.AddScoped<PersonalJournal.API.Services.IPublicService, PersonalJournal.API.Services.PublicService>();

// Jwt Authentication
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured.");
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("AllowFrontend");

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
