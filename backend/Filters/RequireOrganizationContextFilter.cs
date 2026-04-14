using System.Security.Claims;
using finacc.DataAccess;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace finacc.Filters;

/// <summary>
/// Для авторизованных запросов: валидный числовой claim organizationId и существующая организация в БД.
/// Результат кладётся в <see cref="OrganizationIdItemKey"/> для повторного использования в контроллере.
/// </summary>
public sealed class RequireOrganizationContextFilter : IAsyncActionFilter
{
    public const string OrganizationIdItemKey = "OrganizationId";

    private readonly ApplicationDbContext _dbContext;

    public RequireOrganizationContextFilter(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var endpoint = context.ActionDescriptor.EndpointMetadata;
        if (endpoint.Any(m => m is SkipOrganizationContextAttribute))
        {
            await next();
            return;
        }

        var user = context.HttpContext.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            await next();
            return;
        }

        var orgClaim = user.FindFirstValue("organizationId");
        if (string.IsNullOrWhiteSpace(orgClaim) || !int.TryParse(orgClaim, out var orgId))
        {
            context.Result = Problem(
                title: "Организация не выбрана",
                detail:
                "Для этого действия нужна привязка к организации. Вступите по приглашению или создайте организацию.",
                statusCode: StatusCodes.Status403Forbidden);
            return;
        }

        var exists = await _dbContext.Organizations.AsNoTracking()
            .AnyAsync(o => o.Id == orgId, context.HttpContext.RequestAborted);
        if (!exists)
        {
            context.Result = Problem(
                title: "Организация не найдена",
                detail:
                "Организация из вашего профиля отсутствует в системе. Выйдите и войдите снова или обратитесь к администратору.",
                statusCode: StatusCodes.Status403Forbidden);
            return;
        }

        context.HttpContext.Items[OrganizationIdItemKey] = orgId;

        await next();
    }

    private static ObjectResult Problem(string title, string detail, int statusCode)
    {
        return new ObjectResult(
            new ProblemDetails
            {
                Title = title,
                Detail = detail,
                Status = statusCode,
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
            })
        {
            StatusCode = statusCode,
        };
    }
}
