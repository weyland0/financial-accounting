using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace finacc.Models;


[Table("invoices")]
public class Invoice
{
    [Key]
    [Column("invoice_id")]
    public int Id { get; set; }

    [Column("organization_id")]
    public required int OrganizationId { get; set; }

    [Column("account_id")]
    public required int AccountId { get; set; }

    [Column("category_id")]
    public required int CategoryId { get; set; }

    [Column("counterparty_id")]
    public required int CounterpartyId { get; set; }

    [Column("invoice_type")] // Доход/Расход | Profit/Loss
    public string? InvoiceType { get; set; }

    [Required]
    [Column("invoice_date")]
    public required DateOnly InvoiceDate { get; set; }

    [Column("amount")]
    public required decimal Amount { get; set; }

    [Column("status")]
    public string? Status { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("pay_up_date")]
    public required DateOnly PayUpDate { get; set; }

    [Column("paid_amount")]
    public decimal PaidAmount { get; set; } = 0;
}
