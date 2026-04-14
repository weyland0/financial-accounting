using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.DTOs.Invoice;
using finacc.Utility;
using finacc.Application.Invoices.Commands;
using finacc.Application.Invoices.Queries;

namespace finacc.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class InvoiceController : BaseControllerContext
{
    private readonly CreateInvoiceHandler _createHandler;
    private readonly PayInvoiceHandler _payHandler;
    private readonly GetInvoicesByOrganizationHandler _getByOrgHandler;

    public InvoiceController(
        CreateInvoiceHandler createHandler,
        PayInvoiceHandler payHandler,
        GetInvoicesByOrganizationHandler getByOrgHandler)
    {
        _createHandler = createHandler;
        _payHandler = payHandler;
        _getByOrgHandler = getByOrgHandler;
    }

    [HttpPost("create")]
    [Authorize(Roles = "owner,admin,accountant")]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _createHandler.Handle(orgId.Value, request)).ToActionResult();
    }

    [HttpGet("organization")]
    public async Task<IActionResult> GetAll()
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _getByOrgHandler.Handle(orgId.Value)).ToActionResult();
    }

    [HttpPost("pay")]
    [Authorize(Roles = "owner,admin,accountant")]
    public async Task<IActionResult> Pay([FromBody] PayInvoiceRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var orgId = GetOrganizationId();
        if (orgId is null) return Forbid();
        return (await _payHandler.Handle(orgId.Value, request)).ToActionResult();
    }
}


