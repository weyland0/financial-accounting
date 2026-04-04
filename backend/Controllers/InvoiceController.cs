using finacc.DTOs;
using finacc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace finacc.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoiceController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpPost("create")]
    [Authorize(Roles ="owner,admin,accountant")]
    public async Task<IActionResult> Create([FromBody] InvoiceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = await _invoiceService.Create(request);
        return result.ToActionResult();
    }

    [HttpGet("organization/{orgId}")]
    public async Task<IActionResult> GetAll(int orgId)
    {
        var result = await _invoiceService.GetAllByOrganization(orgId);
        return result.ToActionResult();
    }

    [HttpPost("pay")]
    [Authorize(Roles ="owner,admin,accountant")]
    public async Task<IActionResult> Pay([FromBody] InvoicePaymentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = await _invoiceService.Pay(request);
        return result.ToActionResult();
    }
}


