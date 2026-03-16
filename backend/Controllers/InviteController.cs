using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Services;
using finacc.DTOs;

namespace FinanceApp.Controllers;


[ApiController]
[Route("[controller]")]
[Authorize]
public class InviteController : ControllerBase
{
    private readonly IInviteService _service;


    public InviteController(IInviteService service)
    {
        _service = service;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create(InviteRequest request)
    {
        var result = await _service.Create(request);
        return result.ToActionResult();
    }

    [HttpPut("accept/{token}")]
    public async Task<IActionResult> Accept(string token, int userId)
    {
        var result = await _service.Accept(token, userId);
        return result.ToActionResult();
    }
}
