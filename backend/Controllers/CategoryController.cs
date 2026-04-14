using finacc.DTOs;
using finacc.Services;
using finacc.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace finacc.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class CategoryController : BaseControllerContext
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpPost("create")]
    [Authorize(Roles = "owner,admin,accountant")]
    public async Task<IActionResult> Create([FromBody] CategoryRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _categoryService.Create(orgId.Value, request)).ToActionResult();
    }

    [HttpGet("organization")]
    public async Task<IActionResult> GetByOrganization()
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _categoryService.GetAllByOrganization(orgId.Value)).ToActionResult();
    }
}

