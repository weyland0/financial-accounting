using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Utility;
using finacc.DTOs.Invite;
using finacc.Application.Invites.Commands;
using finacc.Application.Invites.Queries;

namespace FinanceApp.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class InviteController : ControllerBase
{
    private readonly CreateInviteHandler _createInviteHandler;
    private readonly AcceptInviteHandler _acceptInviteHandler;
    private readonly GetInviteByTokenHandler _getInviteByTokenHandler;


    public InviteController(CreateInviteHandler createInviteHandler, AcceptInviteHandler acceptInviteHandler, GetInviteByTokenHandler getInviteByTokenHandler)
    {
        _createInviteHandler = createInviteHandler;
        _acceptInviteHandler = acceptInviteHandler;
        _getInviteByTokenHandler = getInviteByTokenHandler;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create(CreateInviteRequest request)
    {
        var result = await _createInviteHandler.Handle(request);
        return result.ToActionResult();
    }

    [HttpGet("{invite_token}")]
    public async Task<IActionResult> Get(string invite_token)
    {
        var result = await _getInviteByTokenHandler.Handle(invite_token);
        return result.ToActionResult();
    }

    [HttpPut("accept/{token}")]
    public async Task<IActionResult> Accept(string token, [FromBody] AcceptInviteRequest request)
    {
        var result = await _acceptInviteHandler.Handle(token, request);
        return result.ToActionResult();
    }
}
