using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

using finacc.DataAccess;
using finacc.Filters;
using finacc.Services;
using finacc.Application.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Настройка для поддержки DateOnly в JSON
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddSwaggerGen();

// application database context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// crud services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICounterpartyService, CounterpartyService>();
builder.Services.AddScoped<IUserService, UserService>();
// builder.Services.AddScoped<IInviteService, InviteService>();
builder.Services.AddScoped<IRoleService, RoleService>();

builder.Services.AddScoped<RequireOrganizationContextFilter>();

// Application services
builder.Services.AddScoped<BalanceService>();

// Invoice use-case handlers
builder.Services.AddScoped<finacc.Application.Invoices.Commands.CreateInvoiceHandler>();
builder.Services.AddScoped<finacc.Application.Invoices.Commands.PayInvoiceHandler>();
builder.Services.AddScoped<finacc.Application.Invoices.Queries.GetInvoicesByOrganizationHandler>();

// Invite use-case handlers
builder.Services.AddScoped<finacc.Application.Invites.Commands.CreateInviteHandler>();
builder.Services.AddScoped<finacc.Application.Invites.Queries.GetInviteByTokenHandler>();
builder.Services.AddScoped<finacc.Application.Invites.Commands.AcceptInviteHandler>();

// Auth use-case handlers
builder.Services.AddScoped<finacc.Application.Auth.Data.LoginDataLoader>();
builder.Services.AddScoped<finacc.Application.Auth.Data.RefreshTokenDataLoader>();
builder.Services.AddScoped<finacc.Application.Auth.Commands.LoginHandler>();
builder.Services.AddScoped<finacc.Application.Auth.Commands.RegisterHandler>();
builder.Services.AddScoped<finacc.Application.Auth.Commands.RefreshTokenHandler>();

var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["Secret"]!)
            )
        };
    }
);
    
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
