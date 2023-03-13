import { useEffect } from 'react';
import ReactDOM from 'react-dom';

function Modal({ onClose, children, actionBar }) {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');

    return () => document.body.classList.remove('overflow-hidden');
  }, []);

  return ReactDOM.createPortal(
    <div className="custom-modal">
      <div className="custom-modal__background" onClick={onClose}></div>

      <div className="custom-modal__content">
        <button className="custom-modal__close" onClick={onClose}></button>

        <div className="custom-modal__entry">{children}</div>

        <div className="custom-modal__actions">{actionBar}</div>
      </div>
    </div>,
    document.querySelector('.modal-container'),
  );
}

export default Modal;
