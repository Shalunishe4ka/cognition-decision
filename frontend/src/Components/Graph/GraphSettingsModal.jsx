// GraphSettingsModal.jsx
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function GraphSettingsModal({ show, onClose }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Graph Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="backgroundColor">
            <Form.Label>Background color</Form.Label>
            <Form.Control type="color" />
          </Form.Group>
          {/* Остальные поля */}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onClose}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
