import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Card } from "react-bootstrap";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend registration API
    navigate("/login");
  };

  return (
    <Container className="py-5" style={{ maxWidth: "520px" }}>
      <Card className="shadow-sm border-0 rounded-4 p-4">
        <h3 className="mb-3 text-center">Бүртгүүлэх</h3>
        <Form onSubmit={onSubmit} className="d-flex flex-column gap-2">
          <Form.Control
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            placeholder="Овог"
            required
          />
          <Form.Control
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            placeholder="Нэр"
            required
          />
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="И-мэйл"
            required
          />
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            placeholder="Утас"
            required
          />
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="Нууц үг"
            required
          />
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChange}
            placeholder="Нууц үг давтах"
            required
          />
          <div className="d-flex justify-content-between mt-3">
            <Button as={Link} to="/booking" variant="outline-secondary">
              Буцах
            </Button>
            <Button type="submit" variant="primary">
              Бүртгүүлэх
            </Button>
          </div>
        </Form>
        <p className="text-center mt-3 mb-0">
          Бүртгэлтэй юу? <Link to="/login">Нэвтрэх</Link>
        </p>
      </Card>
    </Container>
  );
}
