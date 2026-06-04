import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { LoginPage } from "./LoginPage";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext
const mockLogin = vi.fn();
const mockSignup = vi.fn();
vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    signup: mockSignup,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields and sign-in button", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders application title", () => {
    render(<LoginPage />);

    expect(screen.getByText("Document Manager")).toBeInTheDocument();
  });

  it("shows validation error when submitting empty fields", () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Please fill in all fields.")).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("calls login with email and password on valid submission", () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
  });

  it("navigates to /files on successful login", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/files");
    });
  });

  it("displays error message on login failure", async () => {
    mockLogin.mockRejectedValueOnce({
      response: {
        data: {
          non_field_errors: ["Unable to log in with provided credentials."],
        },
      },
    });
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "bad@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to log in/i)).toBeInTheDocument();
    });
  });

  it("displays generic error when response has no structured data", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Network error"));
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
    });
  });

  // ── Sign Up Tests ───────────────────────────────────────────────────────

  it("toggles to sign up mode when clicking sign up link", () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByText(/sign up/i));

    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows error when passwords do not match on sign up", () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByText(/sign up/i));

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "different" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("calls signup and navigates on successful sign up", async () => {
    mockSignup.mockResolvedValueOnce(undefined);
    render(<LoginPage />);

    fireEvent.click(screen.getByText(/sign up/i));

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith("new@example.com", "password123", "password123");
      expect(mockNavigate).toHaveBeenCalledWith("/files");
    });
  });

  it("displays API error on sign up failure", async () => {
    mockSignup.mockRejectedValueOnce({
      response: {
        data: {
          email: ["A user with this email already exists."],
        },
      },
    });
    render(<LoginPage />);

    fireEvent.click(screen.getByText(/sign up/i));

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "existing@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/a user with this email already exists/i)).toBeInTheDocument();
    });
  });

  it("toggles back to sign in mode", () => {
    render(<LoginPage />);

    // Go to sign up
    fireEvent.click(screen.getByText(/sign up/i));
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    // Go back to sign in
    fireEvent.click(screen.getByText(/sign in/i));
    expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
