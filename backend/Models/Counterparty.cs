using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace finacc.Models;


[Table("counterparties")]
public class Counterparty
{
    [Key]
    [Column("counterparty_id")]
    public int Id { get; set; }

    [Required]
    [Column("name")]
    public required string Name { get; set; }

    [Required]
    [Column("organization_id")]
    public required int OrganizationId { get; set; }

    [Column("type")]
    public string? Type { get; set; } // Клиент (физ. лицо) | Организация (юр. лицо)

    [Column("category")]
    public string? Category { get; set; } // Поставщик, партнер, покупатель, ...

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
