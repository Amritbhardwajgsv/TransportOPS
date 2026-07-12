export default function Avatar({ photo, name, size = 32 }) {
    const initials = (name ?? '?')
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    if (photo) {
        return (
            <img
                src={photo}
                alt={name}
                style={{ width: size, height: size }}
                className="shrink-0 rounded-full object-cover"
            />
        );
    }

    return (
        <span
            style={{ width: size, height: size }}
            className="flex shrink-0 items-center justify-center rounded-full bg-coal-800 text-xs font-medium text-smoke-400"
        >
            {initials}
        </span>
    );
}
