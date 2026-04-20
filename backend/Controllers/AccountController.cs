using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Services;
using finacc.DTOs.Account;
using finacc.Utility;

namespace finacc.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class AccountController : BaseControllerContext
{
    private readonly IAccountService _accountService;

    public AccountController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpPost("create")]
    [Authorize(Roles = "owner,admin")]
    public async Task<IActionResult> Create([FromBody] AccountRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _accountService.Create(orgId.Value, request)).ToActionResult();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        return (await _accountService.GetById(id)).ToActionResult();
    }

    [HttpGet("get-by-organization")]
    public async Task<IActionResult> GetAllByOrganization()
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _accountService.GetAllByOrganization(orgId.Value)).ToActionResult();
    }
}
