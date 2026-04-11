using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Services;
using finacc.Utility;

namespace FinanceApp.Controllers;


[ApiController]
[Route("[controller]")]
[Authorize]
public class RoleController : ControllerBase
{
    private readonly IRoleService _service;


    public RoleController(IRoleService service)
    {
        _service = service;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetById(id);
        return result.ToActionResult();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAll();
        return result.ToActionResult();
    }
}
