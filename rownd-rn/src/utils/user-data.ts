export function redactUserDataWithAcls(
    userData: Record<string, any> | undefined | null,
    acls: Record<string, { shared: boolean }> | undefined | null
): Record<string, any> {
    if (!userData) {
        return {};
    }
    return Object.entries(userData).reduce((acc: Record<string, any>, [key, value]) => {
        acc[key] = (!acls?.[key] || acls?.[key]?.shared) ? value : 'ROWND_REDACTED';
        return acc;
    }, {});
}