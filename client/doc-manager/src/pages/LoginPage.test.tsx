import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "./LoginPage";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext
const mockLogin = vi.fn();
vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
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

  it("shows validation error when submitting empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Please fill in all fields.")).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("calls login with email and password on valid submission", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
  });

  it("navigates to /files on successful login", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

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
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), "bad@example.com");
    await user.type(screen.getByLabelText(/^password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to log in/i)).toBeInTheDocument();
    });
  });

  it("displays generic error when response has no structured data", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
    });
  });
});
