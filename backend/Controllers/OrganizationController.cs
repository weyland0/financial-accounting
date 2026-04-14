using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Services;
using finacc.DTOs;
using finacc.Utility;

namespace finacc.Controllers;


[ApiController]
[Route("[controller]")]
[Authorize]
public class OrganizationController : BaseControllerContext
{
    private readonly IOrganizationService _organizationService;


    public OrganizationController(IOrganizationService organizationService)
    {
        _organizationService = organizationService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] OrganizationRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _organizationService.Create(GetUserId(), request);
        return result.ToActionResult();
    }

    [HttpPut("update/{id}")]
    public async Task<IActionResult> Update(int id, OrganizationRequest request)
    {
        var result = await _organizationService.Update(id, request);
        return result.ToActionResult();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var result = await _organizationService.GetById(id);
        return result.ToActionResult();
    }
}
