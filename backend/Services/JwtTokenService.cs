using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using finacc.Models;

namespace finacc.Services;

public interface IJwtTokenService
{
    // Генерирует Access Token (короткоживущий - 15 мин)
    // Используется для доступа к защищенным ресурсам API
    string GenerateAccessToken(User user);

    // Генерирует Refresh Token (долгоживущий - 7 дней)
    // Используется для получения нового Access Token
    string GenerateRefreshToken(User user);

    // Валидирует Refresh Token и возвращает ID пользователя
    int? ValidateRefreshToken(string refreshToken);
}


public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateAccessToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email)
        };

        // Получаем секретный ключ из конфигурации
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKeyString = jwtSettings["Secret"]!;

        // Конвертируем строку ключа в байты
        // JWT требует байты для подписи
        var secretKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secretKeyString)
        );


        // Создаем объект подписи с алгоритмом HMAC SHA256
        // Это гарантирует что никто не может подделать токен
        var credentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

        // Описываем дескриптор токена 
        var tokenDescriptor = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: credentials
        );

        // Создаем и возращаем сам токен (строку)
        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }

    public string GenerateRefreshToken(User user)
    {
        // Генерируем JWT refresh token с долгим сроком жизни (7 дней)
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKeyString = jwtSettings["Secret"]!;
        var secretKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secretKeyString)
        );

        var credentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

        // Refresh token содержит userId для идентификации пользователя при обновлении
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        var tokenDescriptor = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }

    public int? ValidateRefreshToken(string refreshToken)
    {
        try
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var secretKeyString = jwtSettings["Secret"]!;
            var secretKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKeyString)
            );

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = secretKey
            };

            var principal = tokenHandler.ValidateToken(refreshToken, validationParameters, out var validatedToken);
            
            // Извлекаем userId из claims
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }

            return null;
        }
        catch
        {
            return null;
        }
    }
}
