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
    string GenerateRefreshToken();
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

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
