namespace finacc.Filters;

/// <summary>
/// Пропускает <see cref="RequireOrganizationContextFilter"/> для действий,
/// где пользователь может быть без организации в JWT (создание орг, принятие инвайта и т.п.).
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class SkipOrganizationContextAttribute : Attribute;
