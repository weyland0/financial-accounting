using Microsoft.AspNetCore.Mvc;
using finacc.Services;
using finacc.DTOs;

namespace finacc.Controllers;


[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Проверка валидации модели
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = await _authService.Register(request);
        if (result.IsSuccess && result.Data?.RefreshToken is not null)
        {
            AppendRefreshCookie(result.Data.RefreshToken);
            result.Data.RefreshToken = null; // Не возвращаем в ответе
        }

        return result.ToActionResult();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Проверка валидации модели
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = await _authService.Login(request);
        if (result.IsSuccess && result.Data?.RefreshToken is not null)
        {
            AppendRefreshCookie(result.Data.RefreshToken);
            result.Data.RefreshToken = null; // Не возвращаем в ответе
        }

        return result.ToActionResult();
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Result<AuthResponse>.Failure("Refresh token отсутствует", 401).ToActionResult();
        }

        var result = await _authService.RefreshToken(refreshToken);
        if (result.IsSuccess && result.Data?.RefreshToken is not null)
        {
            AppendRefreshCookie(result.Data.RefreshToken);
            result.Data.RefreshToken = null; // Не возвращаем в ответе
        }

        return result.ToActionResult();
    }

    private void AppendRefreshCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/"
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}