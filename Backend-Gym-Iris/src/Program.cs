using Backend_Gym_Iris.Data;
using Backend_Gym_Iris.Entities;
using Backend_Gym_Iris.Enums;
using Backend_Gym_Iris.Repositories;
using Backend_Gym_Iris.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // Priorizar variable de entorno, luego configuración
    var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
                          ?? builder.Configuration.GetConnectionString("DefaultConnection");

    if (!string.IsNullOrEmpty(connectionString))
    {
        // Usar versión específica en lugar de AutoDetect para evitar conexiones innecesarias al iniciar
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 40));
        options.UseMySql(connectionString, serverVersion);
    }
    else
    {
        throw new InvalidOperationException("No se encontró una cadena de conexión válida.");
    }
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Registrar Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IMembershipPriceRepository, MembershipPriceRepository>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "https://gym-iris-web.vercel.app",
            "https://www.gymiris.com.ar",
            "https://gymiris.com.ar"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});
// Registrar Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IMembershipPriceService, MembershipPriceService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPilatesService, PilatesService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();


app.UseCors("AllowFrontend");

// Global exception handling
app.UseMiddleware<Backend_Gym_Iris.Middleware.ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();


using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    dbContext.Database.Migrate();

    // Sembrar precios predeterminados si la tabla está vacía
    if (!dbContext.MembershipPrices.Any())
    {
        dbContext.MembershipPrices.AddRange(
            new MembershipPrice { Type = MembershipType.Musculacion, Price = 38000m, LastUpdated = DateTime.UtcNow },
            new MembershipPrice { Type = MembershipType.Pilates, Price = 43000m, LastUpdated = DateTime.UtcNow }
        );
        dbContext.SaveChanges();
    }
}

app.Run();
