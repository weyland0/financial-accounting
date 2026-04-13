using finacc.Application.Invoices.Commands;
using finacc.Application.Invoices.Queries;
using finacc.DTOs;
using finacc.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace finacc.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class InvoiceController : ControllerBase
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
        return (await _createHandler.Handle(request)).ToActionResult();
    }

    [HttpGet("organization/{orgId}")]
    public async Task<IActionResult> GetAll(int orgId)
    {
        return (await _getByOrgHandler.Handle(orgId)).ToActionResult();
    }

    [HttpPost("pay")]
    [Authorize(Roles = "owner,admin,accountant")]
    public async Task<IActionResult> Pay([FromBody] InvoicePaymentRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        return (await _payHandler.Handle(request)).ToActionResult();
    }
}


