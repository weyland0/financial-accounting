using finacc.DTOs;
using finacc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceApp.Controllers;


[ApiController]
[Route("[controller]")]
[Authorize]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = await _categoryService.Create(request);
        return result.ToActionResult();
    }

    [HttpGet("organization/{organizationId}")]
    public async Task<IActionResult> GetByOrganization(int organizationId)
    {
        var result = await _categoryService.GetAllByOrganization(organizationId);
        return result.ToActionResult();
    }
}

