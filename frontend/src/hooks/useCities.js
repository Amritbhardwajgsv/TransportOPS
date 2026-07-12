import { useEffect, useState } from 'react';
import api from '../lib/api';

export function useCities() {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get('/cities')
            .then((res) => setCities(res.data.cities))
            .finally(() => setLoading(false));
    }, []);

    return { cities, loading };
}
