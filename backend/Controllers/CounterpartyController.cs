using finacc.DTOs;
using finacc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace finacc.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class CounterpartyController : ControllerBase
{
    private readonly ICounterpartyService _counterpartyService;

    public CounterpartyController(ICounterpartyService counterpartyService)
    {
        _counterpartyService = counterpartyService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CounterpartyRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = await _counterpartyService.Create(request);
        return result.ToActionResult();
    }

    [HttpGet("get-by-organization/{orgId}")]
    public async Task<IActionResult> GetAllByOrganization(int orgId)
    {
        var result = await _counterpartyService.GetAllByOrganization(orgId);
        return result.ToActionResult();
    }

    [HttpPut("update/{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CounterpartyRequest request)
    {
        var result = await _counterpartyService.Update(id, request);
        return result.ToActionResult();
    }
}

