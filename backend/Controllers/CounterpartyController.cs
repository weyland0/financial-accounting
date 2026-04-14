using finacc.DTOs;
using finacc.Services;
using finacc.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace finacc.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class CounterpartyController : BaseControllerContext
{
    private readonly ICounterpartyService _counterpartyService;

    public CounterpartyController(ICounterpartyService counterpartyService)
    {
        _counterpartyService = counterpartyService;
    }

    [HttpPost("create")]
    [Authorize(Roles = "owner,admin,accountant")]
    public async Task<IActionResult> Create([FromBody] CounterpartyRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _counterpartyService.Create(orgId.Value, request)).ToActionResult();
    }

    [HttpGet("get-by-organization")]
    public async Task<IActionResult> GetAllByOrganization()
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _counterpartyService.GetAllByOrganization(orgId.Value)).ToActionResult();
    }

    [HttpPut("update/{id}")]
    [Authorize(Roles = "owner,admin,accountant")]
    public async Task<IActionResult> Update(int id, [FromBody] CounterpartyRequest request)
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _counterpartyService.Update(id, orgId.Value, request)).ToActionResult();
    }
}
