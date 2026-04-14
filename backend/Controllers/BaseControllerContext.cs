using System.Security.Claims;
using finacc.Filters;
using Microsoft.AspNetCore.Mvc;

namespace finacc.Controllers;

[ServiceFilter(typeof(RequireOrganizationContextFilter))]
public class BaseControllerContext : ControllerBase
{
    protected int GetUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    /// <summary>
    /// После <see cref="RequireOrganizationContextFilter"/> для действий без
    /// <see cref="SkipOrganizationContextAttribute"/> возвращает проверенный id организации.
    /// </summary>
    protected int? GetOrganizationId()
    {
        if (HttpContext.Items.TryGetValue(RequireOrganizationContextFilter.OrganizationIdItemKey, out var fromFilter)
            && fromFilter is int idFromFilter)
        {
            return idFromFilter;
        }

        var value = User.FindFirstValue("organizationId");
        return int.TryParse(value, out var id) ? id : null;
    }
}