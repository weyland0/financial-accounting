using finacc.DTOs;
using finacc.Models;
using finacc.Utility;

namespace finacc.Application.Invoices.Domain;

public static class PayInvoicePolicy
{
    public static Result EnsureCanPay(Invoice invoice, decimal paymentAmount, decimal availableBalance)
    {
        if (paymentAmount <= 0)
            return Result.Failure("Сумма должна быть больше 0");

        var remaining = invoice.GetRemainingAmount();

        if (remaining <= 0)
            return Result.Failure("Инвойс уже полностью оплачен");

        if (paymentAmount > remaining)
            return Result.Failure("Сумма оплаты превышает остаток по инвойсу");

        if (string.Equals(invoice.InvoiceType, TransactionTypes.Expense, StringComparison.OrdinalIgnoreCase)
            && availableBalance < paymentAmount)
        {
            return Result.Failure("Недостаточно средств на счёте для оплаты");
        }

        return Result.Success();
    }
}