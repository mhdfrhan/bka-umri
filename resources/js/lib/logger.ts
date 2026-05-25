export interface ActivityLog {
    id: number;
    time: string; // ISO string
    user: string;
    role: string;
    action: string;
    target: string;
    type: 'create' | 'update' | 'delete' | 'system' | 'user';
}

export function logActivity(
    action: string,
    target: string,
    type: 'create' | 'update' | 'delete' | 'system' | 'user',
) {
    try {
        const savedLogs = localStorage.getItem('bka_activity_logs');
        let logs: ActivityLog[] = [];

        if (savedLogs) {
            try {
                logs = JSON.parse(savedLogs);
            } catch {
                logs = [];
            }
        }

        const savedUser = localStorage.getItem('bka_current_user');
        let currentUser = { name: 'Super Admin', role: 'Super Admin' };

        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                currentUser = {
                    name: parsed.name || 'Super Admin',
                    role:
                        parsed.role === 'super_admin'
                            ? 'Super Admin'
                            : parsed.role === 'admin'
                              ? 'Admin'
                              : parsed.role || 'Super Admin',
                };
            } catch {}
        }

        const newLog: ActivityLog = {
            id: Date.now(),
            time: new Date().toISOString(),
            user: currentUser.name,
            role: currentUser.role,
            action,
            target,
            type,
        };

        const updatedLogs = [newLog, ...logs].slice(0, 50);
        localStorage.setItem('bka_activity_logs', JSON.stringify(updatedLogs));
    } catch (e) {
        console.error('Failed to write activity log', e);
    }
}
