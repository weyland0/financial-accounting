using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Services;
using finacc.DTOs;
using finacc.Utility;

namespace finacc.Controllers;


[ApiController]
[Route("[controller]")]
[Authorize]
public class UserController : BaseControllerContext
{
    private readonly IUserService _service;

    public UserController(IUserService service)
    {
        _service = service;
    }

    [HttpGet("organization")]
    public async Task<IActionResult> GetAllByOrganizationId()
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        var result = await _service.GetAllByOrganizationId(orgId.Value);
        return result.ToActionResult();
    }

    [HttpPut("update-role/{id}")]
    [Authorize(Roles = "owner,admin")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UserRoleUpdateRequest request)
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        var result = await _service.UpdateRole(id, orgId.Value, request);
        return result.ToActionResult();
    }
}
