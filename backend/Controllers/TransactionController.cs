using finacc.DTOs;
using finacc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Utility;

namespace finacc.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class TransactionController : BaseControllerContext
{
    private readonly ITransactionService _transactionService;

    public TransactionController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpPost("create")]
    [Authorize(Roles = "owner,admin,accountant")]
    public async Task<IActionResult> Create([FromBody] TransactionRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _transactionService.Create(orgId.Value, request)).ToActionResult();
    }

    [HttpGet("organization")]
    public async Task<IActionResult> GetAll()
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _transactionService.GetAllByOrganization(orgId.Value)).ToActionResult();
    }
}

