export default function EmptyState({ icon: Icon, title, text, children }) {
    return (
        <div className="empty">
            {Icon && (
                <span className="empty-art">
                    <Icon size={36} strokeWidth={1.5} aria-hidden="true" />
                </span>
            )}
            <h2>{title}</h2>
            {text && <p>{text}</p>}
            {children}
        </div>
    );
}