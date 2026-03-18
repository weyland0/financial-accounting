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

    [HttpGet("{invite_token}")]
    public async Task<IActionResult> Get(string invite_token)
    {
        var result = await _service.Get(invite_token);
        return result.ToActionResult();
    }

    [HttpPut("accept/{token}")]
    public async Task<IActionResult> Accept(string token, [FromBody] InviteAcceptRequest request)
    {
        var result = await _service.Accept(token, request);
        return result.ToActionResult();
    }
}
