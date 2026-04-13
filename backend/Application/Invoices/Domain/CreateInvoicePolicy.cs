using finacc.DTOs;
using finacc.Models;
using finacc.Utility;

namespace finacc.Application.Invoices.Domain;

public static class CreateInvoicePolicy
{
    public static Result EnsureCanCreate(decimal paymentAmount)
    {
        if (paymentAmount <= 0)
            return Result.Failure("Сумма должна быть больше 0");

        return Result.Success();
    }
}