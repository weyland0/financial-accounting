using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace finacc.Controllers;

public class BaseControllerContext : ControllerBase
{
    protected int GetUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    protected int? GetOrganizationId()
    {
        var value = User.FindFirstValue("organizationId");
        return int.TryParse(value, out var id) ? id : null;
    }
}