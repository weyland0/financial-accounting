
const roleRules = [
    {
        page: '/organizationinfo',
        rules: { 
            canCreate: 'all',
            canEdit: ['owner', 'admin'],
            canView: 'all',
        }
    },
    {
        page: '/accounts',
        rules: { 
            canCreate: ['owner', 'admin' ],
            canEdit: ['owner', 'admin' ],
            canView: 'all',
        }
    },
    {
        page: '/transactions',
        rules: { 
            canCreate: ['owner', 'admin', 'accountant' ],
            canEdit: ['owner', 'admin', 'accountant' ],
            canView: 'all',
        }
    },
    {
        page: '/invoices',
        rules: { 
            canCreate: ['owner', 'admin', 'accountant' ],
            canEdit: ['owner', 'admin', 'accountant' ],
            canView: 'all',
        }
    },
    {
        page: '/categories',
        rules: { 
            canCreate: ['owner', 'admin', 'accountant' ],
            canEdit: ['owner', 'admin', 'accountant' ],
            canView: 'all',
        }
    },
    {
        page: '/counterparties',
        rules: { 
            canCreate: ['owner', 'admin', 'accountant' ],
            canEdit: ['owner', 'admin', 'accountant' ],
            canView: 'all',
        }
    },
    {
        page: '/reports/pnl',
        rules: { 
            canCreate: ['owner', 'admin', 'accountant' ],
            canEdit: ['owner', 'admin', 'accountant' ],
            canView: 'all',
        }
    },
    {
        page: '/reports/cashflow',
        rules: { 
            canCreate: ['owner', 'admin', 'accountant' ],
            canEdit: ['owner', 'admin', 'accountant' ],
            canView: 'all',
        }
    },
];

export function canCreate(role, page) {
    if (!role) {
        return false;
    }

    if (!page) {
        return false;
    }

    const pr = roleRules.find(item => item.page === page);
    if (!pr) {
        return false;
    }

    if (Array.isArray(pr.rules.canCreate)) {
        return pr.rules.canCreate.includes(role);
    } else if (pr.rules.canCreate === 'all') {
        return true;
    } else {
        return false;
    }
}

export function canEdit(role, page) {
    if (!role) {
        return false;
    }

    if (!page) {
        return false;
    }

    const pr = roleRules.find(item => item.page === page);
    if (!pr) {
        return false;
    }

    if (Array.isArray(pr.rules.canEdit)) {
        return pr.rules.canEdit.includes(role);
    } else if (pr.rules.canEdit === 'all') {
        return true;
    } else {
        return false;
    }
}

export function canView(role, page) {
    if (!role) {
        return false;
    }

    if (!page) {
        return false;
    }

    const pr = roleRules.find(p => p.page === page );
    if (!pr) {
        return false;
    }

    if (Array.isArray(pr.rules.canView)) {
        return pr.rules.canView.includes(role);
    } else if (pr.rules.canView === 'all') {
        return true;
    } else {
        return false;
    }
}