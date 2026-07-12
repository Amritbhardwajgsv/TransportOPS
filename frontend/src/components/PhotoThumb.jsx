import { Truck } from 'lucide-react';

export default function PhotoThumb({ photo, size = 40 }) {
    if (photo) {
        return (
            <img
                src={photo}
                alt=""
                style={{ width: size, height: size }}
                className="shrink-0 rounded object-cover"
            />
        );
    }
    return (
        <span
            style={{ width: size, height: size }}
            className="flex shrink-0 items-center justify-center rounded bg-coal-800 text-smoke-400"
        >
            <Truck size={size * 0.5} strokeWidth={1.5} />
        </span>
    );
}
