using finacc.DTOs;
using finacc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace finacc.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] TransactionRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = await _transactionService.Create(request);
        return result.ToActionResult();
    }

    [HttpGet("organization/{orgId}")]
    public async Task<IActionResult> GetAll(int orgId)
    {
        var result = await _transactionService.GetAllByOrganization(orgId);
        return result.ToActionResult();
    }
}

