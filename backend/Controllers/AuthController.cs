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
    public async Task<ActionResult<RegisterResponse>> Register(RegisterRequest request)
    {
        try
        {
            RegisterResponse response = await _authService.Register(request);
            return Ok(response);
        }
        catch (ArgumentException e)
        {
            RegisterResponse response = new()
            {
                Success = false,
                Message = e.Message,
                UserDto = null
            };
            return BadRequest(response);
        }
        catch (UnauthorizedAccessException e)
        {
            RegisterResponse response = new()
            {
                Success = false,
                Message = e.Message,
                UserDto = null
            };
            return Unauthorized(response);
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginRequest request)
    {
        try
        {
            LoginResponse response = await _authService.Login(request);
            return Ok(response);
        }
        catch (ArgumentException e)
        {
            return BadRequest(e.Message);
        }
        catch (InvalidOperationException e)
        {
            return Conflict(e.Message);
        }
    }

    [HttpPost("registerandlogin")]
    public async Task<ActionResult> RegisterAndLogin(RegisterRequest request)
    {
        try
        {
            LoginResponse response = await _authService.RegisterAndLogin(request);
            return Ok(response);
        }
        catch (ArgumentException e)
        {
            return BadRequest(e.Message);
        }
        catch (InvalidOperationException e)
        {
            return Conflict(e.Message);
        }
        catch (UnauthorizedAccessException e)
        {
            return Conflict(e.Message);
        }
    }
}