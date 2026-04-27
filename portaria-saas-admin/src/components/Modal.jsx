export default function Modal({ aberto, titulo, descricao, onClose, children, footer }) {
  if (!aberto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{titulo}</h2>
            {descricao && <p>{descricao}</p>}
          </div>

          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {children}

        {footer && <div className="modal-actions">{footer}</div>}
      </div>
    </div>
  );
}
