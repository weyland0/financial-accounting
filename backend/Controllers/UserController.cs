using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Services;
using System.Security.Claims;
using finacc.DTOs;

namespace FinanceApp.Controllers;


[ApiController]
[Route("[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _service;


    public UserController(IUserService service)
    {
        _service = service;
    }

    [HttpGet("{orgId}")]
    public async Task<IActionResult> GetAllByOrganizationId(int orgId)
    {
        var result = await _service.GetAllByOrganizationId(orgId);
        return result.ToActionResult();
    }
}
