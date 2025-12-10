using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace finacc.Models;


[Table("transactions")]
public class Transaction
{
    [Key]
    [Column("transaction_id")]
    public int Id { get; set; }

    [Column("organization_id")]
    public required int OrganizationId { get; set; }

    [Column("account_id")]
    public required int AccountId { get; set; }

    [Column("category_id")]
    public required int CategoryId { get; set; }

    [Column("transaction_type")] // Доход/Расход | Profit/Loss
    public string? TransactionType { get; set; }

    [Column("counterparty")]
    public string? Counterparty { get; set; }

    [Required]
    [Column("transaction_date")]
    public required DateOnly TransactionDate { get; set; }

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

    [Column("related_account_id")]
    public int? RelatedAccountId { get; set; }
    
    [Column("related_transaction_id")]
    public int? RelatedTransactionId { get; set; }
}
