using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Utility;
using finacc.DTOs.Invite;
using finacc.Application.Invites.Commands;
using finacc.Application.Invites.Queries;

namespace finacc.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class InviteController : BaseControllerContext
{
    private readonly CreateInviteHandler _createInviteHandler;
    private readonly AcceptInviteHandler _acceptInviteHandler;
    private readonly GetInviteByTokenHandler _getInviteByTokenHandler;

    public InviteController(
        CreateInviteHandler createInviteHandler,
        AcceptInviteHandler acceptInviteHandler,
        GetInviteByTokenHandler getInviteByTokenHandler)
    {
        _createInviteHandler = createInviteHandler;
        _acceptInviteHandler = acceptInviteHandler;
        _getInviteByTokenHandler = getInviteByTokenHandler;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateInviteRequest request)
    {
        return (await _createInviteHandler.Handle(request)).ToActionResult();
    }

    [HttpGet("{inviteToken}")]
    public async Task<IActionResult> Get(string inviteToken)
    {
        return (await _getInviteByTokenHandler.Handle(inviteToken)).ToActionResult();
    }

    [HttpPut("accept/{token}")]
    public async Task<IActionResult> Accept(string token)
    {
        var userId = GetUserId();
        return (await _acceptInviteHandler.Handle(token, userId)).ToActionResult();
    }
}
