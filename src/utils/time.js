const formatRelativeTime = (date) => {
    const now = Date.now();
    const past = new Date(date).getTime();
    const diffMs = now - past;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
};

const isOlderThan = (date, minutes) => {
    const diffMs = Date.now() - new Date(date).getTime();
    return diffMs > minutes * 60 * 1000;
};

const toUTC = (date) => new Date(date).toISOString();

module.exports = { formatRelativeTime, isOlderThan, toUTC };