using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace finacc.Models;


[Table("invites")]
public class Invite
{
    [Key]
    [Column("invite_id")]
    public int Id { get; set; }

    [Required]
    [Column("token")]
    public required string Token { get; set; }
    
    [Required]
    [Column("organization_id")]
    public required int OrganizationId { get; set; }

    [Required]
    [Column("role_id")]
    public required int RoleId { get; set; }

    [Column("is_revoked")]
    public bool IsRevoked { get; set; } = false;

    [Column("expires_at")]
    public DateTime ExpireTime { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public void MarkAsUsed()
    {
        IsRevoked = true;
    }

    public bool IsExpired()
    {
        return DateTime.UtcNow > ExpireTime;
    }
}