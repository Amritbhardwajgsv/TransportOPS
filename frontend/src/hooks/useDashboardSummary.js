import { useEffect, useState } from 'react';
import api from '../lib/api';

export function useDashboardSummary() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get('/dashboard/summary')
            .then((res) => setData(res.data))
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}
