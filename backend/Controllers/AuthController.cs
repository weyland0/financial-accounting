using Microsoft.AspNetCore.Mvc;
using finacc.DTOs.Auth;
using finacc.Utility;
using finacc.Application.Auth.Commands;

namespace finacc.Controllers;


[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly LoginHandler _loginHandler;
    private readonly RegisterHandler _registerHandler;
    private readonly RefreshTokenHandler _refreshTokenHandler;


    public AuthController(
        LoginHandler loginHandler,
        RegisterHandler registerHandler,
        RefreshTokenHandler refreshTokenHandler)
    {
        _loginHandler = loginHandler;
        _registerHandler = registerHandler;
        _refreshTokenHandler = refreshTokenHandler;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        // Проверка валидации модели
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = await _registerHandler.Handle(request, cancellationToken);
        if (result.IsSuccess && result.Data?.RefreshToken is not null)
        {
            AppendRefreshCookie(result.Data.RefreshToken);
            result.Data.RefreshToken = null; // Не возвращаем в ответе
        }

        return result.ToActionResult();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        // Проверка валидации модели
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = await _loginHandler.Handle(request, cancellationToken);
        if (result.IsSuccess && result.Data?.RefreshToken is not null)
        {
            AppendRefreshCookie(result.Data.RefreshToken);
            result.Data.RefreshToken = null; // Не возвращаем в ответе
        }

        return result.ToActionResult();
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Result<AuthResponse>.Failure("Refresh token отсутствует", 401).ToActionResult();
        }

        var result = await _refreshTokenHandler.Handle(refreshToken, cancellationToken);
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