import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  overflow-y: scroll;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: #fff;
  color: black;
  border-radius: 8px;
  padding: 25px;
  width: 90%;
  max-width: 600px;
  margin: 200px auto 100px auto;
  position: relative;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  ${({ titleStyle }) => titleStyle}
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;


const ModalButton = ({
  title,
  children,
  footerComponent,
  titleStyle,
  buttonStyle = { padding: "10px 20px" },
  buttonClassname = "",
  buttonText,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Ensure `#modal-root` exists
  useEffect(() => {
    let modalRoot = document.getElementById("modal-root");
    if (!modalRoot) {
      modalRoot = document.createElement("div");
      modalRoot.id = "modal-root";
      document.body.appendChild(modalRoot);
    }
  }, []);

  const toggleModal = () => setIsOpen(!isOpen);

  if (!isOpen) {
    return (
      <button
        className={buttonClassname}
        onClick={toggleModal}
        style={buttonStyle}
      >
        {buttonText}
      </button>
    );
  }

  return ReactDOM.createPortal(
    <Overlay>
      <ModalContainer>
        <ModalHeader titleStyle={titleStyle}>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={toggleModal}>&times;</CloseButton>
        </ModalHeader>
        {children}
        {footerComponent && (
          <ModalFooter>
            {footerComponent}
          </ModalFooter>
        )}
      </ModalContainer>
    </Overlay>,
    document.getElementById("modal-root")
  );
};

export default ModalButton;
