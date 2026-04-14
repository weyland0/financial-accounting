using finacc.Models;

namespace finacc.Application.Invoices.Data;

public class CreateInvoiceData
{
    public required Account Account { get; set; }
    public required Category Category { get; set; }
    public required Counterparty Counterparty { get; set; }
}