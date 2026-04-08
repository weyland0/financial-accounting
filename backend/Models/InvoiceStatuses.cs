namespace finacc.Models;

public static class InvoiceStatuses
{
    public const string Paid = "Оплачен";
    public const string PartiallyPaid = "Оплачен частично";
    public const string Pending = "Ожидает оплаты";
}

public static class TransactionStatuses
{
    public const string InvoicePaymentPrefix = "Оплата счета #";

    public static string InvoicePayment(int invoiceId) => $"{InvoicePaymentPrefix}{invoiceId}";

    public static bool IsInvoicePayment(string? status)
    {
        return (status ?? "").StartsWith(InvoicePaymentPrefix, StringComparison.OrdinalIgnoreCase);
    }
}
