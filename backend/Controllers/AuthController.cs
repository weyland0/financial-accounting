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
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.Register(request);
        return result.ToActionResult();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.Login(request);
        return result.ToActionResult();
    }
}